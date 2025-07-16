import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpStatus,
  BadRequestException,
  Patch,
  Delete,
  Param,
} from '@nestjs/common';
import { ReClinksService } from './re-clinks.service';
import { JwtAuthGuard, RequestWithUserId } from 'src/JwtAuthGuard';
import mongoose from 'mongoose';
import { UpdateReClinkDto } from './dto/update-re-clink.dto';
import { CreateReClinkDto } from './dto/create-re-clink.dto';

@Controller('re-clinks')
export class ReClinksController {
  constructor(private readonly reClinksService: ReClinksService) {}

  // - 3-1 리크링크 생성
  @UseGuards(JwtAuthGuard)
  @Post('/')
  async uploadClink(
    @Req() req: RequestWithUserId,
    @Body()
    body: {
      clinkId: string;
      type: 'RE_CLINK' | 'RE_CLINK_COMMENT';
      content: string;
      imgList: string[];
      verses: string[];
      parentId?: string;
    },
  ) {
    if (
      !req.userId ||
      !body.clinkId ||
      !body.content ||
      !body.type ||
      (body.type === 'RE_CLINK_COMMENT' && !body.parentId)
    ) {
      throw new BadRequestException('잘못된 요청입니다.');
    }
    // const bibleList = body.bible ? JSON.parse(JSON.stringify(body.bible)) : [];
    const userId = new mongoose.Types.ObjectId(req.userId);
    const content = body.content;
    const imgList = body.imgList;
    const verses = body.verses;
    const type = body.type;
    const clinkId = new mongoose.Types.ObjectId(body.clinkId);
    const parentId = body.parentId
      ? new mongoose.Types.ObjectId(body.parentId)
      : null;

    const newReClink = await this.reClinksService.create({
      ownerId: userId,
      clinkId,
      content,
      type,
      imgList,
      verses,
      parentId,
    });
    return {
      code: HttpStatus.CREATED,
      msg: '리크링크 작성 완료',
      data: {
        newReClink,
      },
    };
  }

  // - 3-2 리크링크 수정
  @UseGuards(JwtAuthGuard)
  @Patch('/:id')
  async updateReClink(
    @Req() req: RequestWithUserId,
    @Param('id') id: string,
    @Body() body: UpdateReClinkDto,
  ) {
    const userId = new mongoose.Types.ObjectId(req.userId);
    const updatedReClink = await this.reClinksService.update(id, body);
    return {
      code: HttpStatus.OK,
      msg: '리크링크 수정 완료',
      data: { updatedReClink },
    };
  }

  // - 3-3 리크링크 삭제
  @UseGuards(JwtAuthGuard)
  @Delete('/')
  async deleteReClink(
    @Req() req: RequestWithUserId,
    @Body()
    body: CreateReClinkDto,
  ) {
    const userId = req.userId;
    await this.reClinksService.delete({
      ...body,
      ownerId: new mongoose.Types.ObjectId(userId),
    });
    return {
      code: HttpStatus.OK,
      msg: '리크링크 삭제 완료',
      result: true,
    };
  }
}
