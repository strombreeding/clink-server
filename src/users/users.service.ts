import { Injectable, UnauthorizedException } from '@nestjs/common';
import { User, UserDocument } from './entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Document, Model, Types } from 'mongoose';
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

  async findAll() {
    return await this.userModel.find({});
  }

  async findByFilter(filter: Partial<User>) {
    return await this.userModel.find(filter);
  }

  async findByIdAndUpdate(id: string, filter: Partial<User>) {
    console.log(filter, '업데이트 할것들');

    // 업데이트할 필드들을 동적으로 구성
    const updates: any = {};

    console.log(filter.survey, '닉네임');
    // 각 필드가 존재할 때만 업데이트 객체에 추가
    if (filter.nickname) {
      updates.nickname = filter.nickname;
      updates.lastNicknameUpdateAt = new Date(); // 닉네임 변경 시 마지막 업데이트 시간 기록
    }

    if (filter.info !== undefined) {
      // undefined가 아닌 모든 값 허용 (빈 문자열도)
      updates.info = filter.info;
    }

    if (filter.type !== undefined) {
      updates.type = filter.type; // 기존 코드에서 info로 잘못 설정된 부분 수정
    }

    if (filter.profileImg !== undefined) {
      updates.profileImg = filter.profileImg;
    }

    if (filter.survey !== undefined) {
      updates.survey = new Date(); // survey 필드가 전달되면 현재 시간으로 설정
    }

    if (filter.fcmAllow !== undefined) {
      updates.fcmAllow = filter.fcmAllow;
    }

    if (filter.fcmToken !== undefined) {
      updates.fcmToken = filter.fcmToken;
    }

    // updatedAt은 항상 업데이트
    updates.updatedAt = new Date();

    console.log(id, updates, '업데이트 할것들');

    // MongoDB 업데이트 실행
    const result = await this.userModel.findByIdAndUpdate(
      id,
      { $set: updates },
      {
        new: true, // 업데이트된 문서 반환
        runValidators: true, // 스키마 검증 실행
        upsert: false, // 문서가 없으면 생성하지 않음
      },
    );

    if (!result) {
      throw new Error(`사용자를 찾을 수 없습니다: ${id}`);
    }

    return result; // 업데이트된 사용자 정보 반환
  }

  // 여러 유저 정보 조회
  async findAllByIds(userIds: Types.ObjectId[]) {
    return await this.userModel
      .find({
        _id: { $in: userIds },
      })
      .select('_id nickname profileImg')
      .lean();
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
  async generateJwtToken(user: UserDocument): Promise<string> {
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
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_SECRET'),
    });
  }

  async remove(id: string) {
    console.log(id);
    await this.userModel.findByIdAndUpdate(id, {
      $set: { deletedAt: new Date(new Date().getTime() + 604800000) },
    });
    return `This action removes a #${id} user`;
  }
}
