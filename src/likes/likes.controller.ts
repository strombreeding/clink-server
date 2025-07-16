import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { CreateLikeDto } from './dto/create-like.dto';

import { JwtAuthGuard, RequestWithUserId } from 'src/JwtAuthGuard';

@Controller('likes')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/')
  async reclinkLikeCreate(
    @Req() req: RequestWithUserId,
    @Body() createLikeDto: CreateLikeDto,
  ) {
    const result = await this.likesService.createLike({
      ...createLikeDto,
      ownerId: req.userId,
    });
    return {
      code: HttpStatus.CREATED,
      msg: '좋아요 누르기 완료',
      data: result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('/')
  async clinkLikeDelete(
    @Req() req: RequestWithUserId,
    @Body() body: { type: 'clink' | 'reclink' | 'magazine'; id: string },
  ) {
    const result = await this.likesService.delete({
      ...body,
      ownerId: req.userId,
    });
    return {
      code: HttpStatus.OK,
      msg: '좋아요 취소 완료',
      data: result,
    };
  }
}
