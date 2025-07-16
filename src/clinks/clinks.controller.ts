import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  HttpStatus,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  Param,
  Delete,
  Put,
  Patch,
} from '@nestjs/common';
import { ClinksService } from './clinks.service';
import { CreateClinkDto } from './dto/create-clink.dto';
import { JwtAuthGuard, RequestWithUserId } from '../JwtAuthGuard';
import mongoose from 'mongoose';
import { UpdateClinkDto } from './dto/update-clink.dto';

@Controller('clinks')
export class ClinksController {
  constructor(private readonly clinksService: ClinksService) {}

  // - 2-1 크링크 생성
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async uploadClink(
    @Req() req: RequestWithUserId,
    @Body() body: CreateClinkDto,
  ) {
    // const bibleList = body.bible ? JSON.parse(JSON.stringify(body.bible)) : [];
    const userId = new mongoose.Types.ObjectId(req.userId);
    const content = body.content;
    const imgList = body.imgList;
    const verses = body.verses;

    const newClink = await this.clinksService.create(
      userId,
      content,
      imgList,
      verses,
    );

    return {
      code: HttpStatus.CREATED,
      msg: '크링크 작성 완료',
      data: {
        newClink: { _id: newClink._id },
      },
    };
  }

  // - 2-2 크링크 조회 페이지네이션
  @Get('/')
  async getClinkPaginationByCursor(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('adjustedScore') adjustedScore?: string,
    @Query('createdAt') createdAt?: string,
    @Query('_id') _id?: string,
    @Query('userId') userId?: string,
  ) {
    let data = null;
    if (adjustedScore && createdAt && _id) {
      data = {
        adjustedScore: parseFloat(adjustedScore),
        createdAt,
        _id,
      };
    }
    const result = await this.clinksService.getClinkPaginationByCursor(
      limit,
      data,
      userId,
    );
    return {
      code: HttpStatus.OK,
      msg: '크링크 조회',
      data: result,
    };
  }

  // - 2-3 크링크 상세 조회
  @Get('/:id')
  async getClinkById(
    @Param('id') id: string,
    @Query('userId') userId?: string,
  ) {
    return {
      code: HttpStatus.OK,
      msg: '크링크 상세 조회',
      data: { result: await this.clinksService.getClinkById(id, userId) },
    };
  }

  // - 2-4 크링크 삭제
  @UseGuards(JwtAuthGuard)
  @Delete('/:id')
  async deleteClink(@Req() req: RequestWithUserId, @Param('id') id: string) {
    const userId = new mongoose.Types.ObjectId(req.userId);
    await this.clinksService.delete(id, userId);
    return {
      code: HttpStatus.OK,
      msg: '크링크 삭제 완료',
      result: true,
    };
  }

  // - 2-5 크링크 수정
  @UseGuards(JwtAuthGuard)
  @Patch('/:id')
  async updateClink(
    @Req() req: RequestWithUserId,
    @Param('id') id: string,
    @Body() body: UpdateClinkDto,
  ) {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const result = await this.clinksService.update(id, userId, body);
    return {
      code: HttpStatus.OK,
      msg: '크링크 수정 완료',
      data: { result },
    };
  }

  // - 크링크 목데이터 생성
  @Post('/mock')
  async createMockClinks() {
    return await this.clinksService.createMockClinks();
  }
}
