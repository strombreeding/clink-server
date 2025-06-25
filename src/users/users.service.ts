import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async getKakaoAccessToken(code: string): Promise<any> {
    try {
      const response = await axios.post(
        'https://kauth.kakao.com/oauth/token',
        {
          grant_type: 'authorization_code',
          client_id: this.configService.get('KAKAO_DEVELOPER_REST'),
          client_secret: this.configService.get('KAKAO_DEVELOPER_SECRET'),
          redirect_uri: 'http://localhost:8080/kakao-test-callback',
          code,
        },
        {
          headers: {
            Authorization: `Bearer ${code}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );
      console.log(response.data, '캬캬2');
      return response.data.access_token;
    } catch (error) {
      console.error(
        'Failed to get Kakao user info:',
        error.response?.data || error.message,
      );
      throw new UnauthorizedException(
        'Invalid Kakao Access Token or API error.',
      );
    }
  }

  // 카카오 access_token으로 사용자 정보 가져오기
  async getKakaoUserInfo(accessToken: string): Promise<any> {
    try {
      const response = await axios.get('https://kapi.kakao.com/v2/user/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
        },
      });
      return response.data;
    } catch (error) {
      console.error(
        'Failed to get Kakao user info:',
        error.response?.data || error.message,
      );
      throw new UnauthorizedException(
        'Invalid Kakao Access Token or API error.',
      );
    }
  }

  // 사용자 정보 검증 및 저장 (또는 업데이트)
  async validateKakaoUser(kakaoUserInfo: any): Promise<any> {
    const kakaoId = kakaoUserInfo.id.toString();
    return kakaoId;
  }

  create(createUserDto: CreateUserDto) {
    console.log(createUserDto);
    return 'This action adds a new user';
  }

  async findAll() {
    return await this.userModel.find({});
  }

  async findByFilter(filter: Partial<User>) {
    return await this.userModel.find(filter);
  }

  async findByIdAndUpdate(id: string, filter: Partial<User>) {
    const updates = {
      ...(filter.nickname && {
        nickname: filter.nickname,
        lastNicknameUpdateAt: new Date(),
      }), // 닉네임 바꾸면 라스트 닉넴업데이트 해주기
      ...(filter.info && { info: filter.info }),
      ...(filter.type && { info: filter.type }),
      ...(filter.profileImg && { profileImg: filter.profileImg }),
      ...(filter.survey && { survey: new Date() }),
      updatedAt: new Date(),
    };

    console.log(id, updates, '업데이트 할것들');
    await this.userModel.findByIdAndUpdate(id, {
      $set: {
        ...updates,
      },
    });
    return true;
  }

  async findOneById(id: string) {
    const user = await this.userModel.findById(id);
    console.log(user);
    return user;
  }

  async findOneByKakaoId(socialId: string) {
    const user = await this.userModel.findOne({ kakaoId: socialId });
    console.log(user);
    return user;
  }

  async createUser(user: Partial<User>) {
    const newUser = await this.userModel.create(user);
    return newUser;
  }

  // 우리 서비스의 JWT 토큰 발행
  async generateJwtToken(user: UserDocument): Promise<{ accessToken: string }> {
    const payload = {
      // sub: user._id,
      _id: user._id,
      nickname: user.nickname,
      profileImg: user.profileImg,
      phone: user.phone,
      email: user.email,
      gender: user.gender,
      birth: user.birth,
      type: user.type,
      info: user.info,
      survey: user.survey,
    };
    return {
      accessToken: this.jwtService.sign(payload, {
        secret: this.configService.get('JWT_SECRET'),
      }),
    };
  }

  async remove(id: string) {
    console.log(id);
    await this.userModel.findByIdAndUpdate(id, {
      $set: { deletedAt: new Date(new Date().getTime() + 604800000) },
    });
    return `This action removes a #${id} user`;
  }
}
