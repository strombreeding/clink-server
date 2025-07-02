import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  HttpStatus,
  UnauthorizedException,
  UseGuards,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { JwtAuthGuard, RequestWithUserId } from '../JwtAuthGuard';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // - 1. 카카오 로그인
  @Post('kakao-login')
  async kakaoLogin(@Body('accessToken') kakaoAccessToken: string) {
    try {
      // 1. 카카오 Access Token으로 사용자 정보 가져오기
      const kakaoAt =
        await this.usersService.getKakaoAccessToken(kakaoAccessToken);

      const kakaoUserInfo = await this.usersService.getKakaoUserInfo(kakaoAt);
      const { id, kakao_account } = kakaoUserInfo;
      const { email, profile } = kakao_account; // 이 안에 프사도있음
      const { thumbnail_image_url, profile_image_url } = profile;
      console.log(id, email, thumbnail_image_url, profile_image_url, '캬캬3');
      // 2. 가져온 정보로 우리 서비스 사용자 검증 및 저장/업데이트
      const user = await this.usersService.findOneByKakaoId(id);

      if (user == null) {
        const newUser = await this.usersService.createUser({
          kakaoId: id,
          email: email || null,
          profileImg: thumbnail_image_url || null,
        });
        const accessToken = await this.usersService.generateJwtToken(newUser);
        return {
          code: HttpStatus.CREATED,
          msg: '카카오 회원가입 완료',
          data: { accessToken, user: newUser },
        };
      }

      // 3. 우리 서비스의 JWT 토큰 발행
      const jwtToken = await this.usersService.generateJwtToken(user);

      // 프론트엔드(React Native 앱)로 우리 서비스의 JWT 토큰 반환
      return {
        code: HttpStatus.OK,
        msg: '카카오 로그인 완료',
        accessToken: jwtToken,
      };
    } catch (error) {
      console.error('Kakao login failed:', error);
      if (error instanceof UnauthorizedException) {
        return {
          code: HttpStatus.UNAUTHORIZED,
          msg: error.message,
          data: null,
        };
      }
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
        msg: 'Internal server error during Kakao login.',
        data: null,
      };
    }
  }

  // - 2. 유저 정보 변경
  @UseGuards(JwtAuthGuard)
  @Patch()
  async userUpdate(@Req() req: RequestWithUserId, @Body() body: Partial<User>) {
    // console.log(req, '여기로?');
    await this.usersService.findByIdAndUpdate(req.userId, body);
    return {
      code: HttpStatus.OK,
      msg: '유저 정보 변경 완료',
      data: {
        result: true,
      },
    };
  }

  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  @Get('/filter')
  async findByFilter(@Query() query: Partial<User>) {
    return await this.usersService.findByFilter(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    console.log(id, '여기로?');
    return await this.usersService.findOneById(id);
  }

  @Get('/kakao/:id')
  async findOneFromKakao(@Param('id') id: string) {
    console.log(id, '아님 여기로');
    const user = await this.usersService.findOneByKakaoId(id);
    return {
      msg: '유저 조회',
      user,
    };
  }

  @Get('/compare/:nickname')
  async compareNickname(@Param('nickname') nickname: string) {
    const user = await this.usersService.findByFilter({ nickname: nickname });
    return {
      msg: '닉네임 중복 조회',
      user,
    };
  }
}
