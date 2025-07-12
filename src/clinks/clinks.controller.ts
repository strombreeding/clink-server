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
} from '@nestjs/common';
import { ClinksService } from './clinks.service';
import * as fs from 'fs';
import { CreateClinkDto } from './dto/create-clink.dto';
import { JwtAuthGuard, RequestWithUserId } from '../JwtAuthGuard';

@Controller('clinks')
export class ClinksController {
  constructor(private readonly clinksService: ClinksService) {}

  @UseGuards(JwtAuthGuard)
  @Post('/')
  async uploadClink(
    @Req() req: RequestWithUserId,
    @Body() body: CreateClinkDto,
  ) {
    // const bibleList = body.bible ? JSON.parse(JSON.stringify(body.bible)) : [];
    const userId = req.userId;
    const content = body.content;
    const imgList = body.imgList;

    const newClink = await this.clinksService.create(userId, content, imgList);

    return {
      code: HttpStatus.CREATED,
      msg: '크링크 작성 완료',
      data: {
        newClink,
      },
    };
  }

  @Get('/')
  async getClinkPaginationByCursor(
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('adjustedScore') adjustedScore?: string,
    @Query('createdAt') createdAt?: string,
    @Query('_id') _id?: string,
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
    );
    return {
      code: HttpStatus.OK,
      msg: '크링크 조회',
      data: result,
    };
  }

  @Get('/feed/ranked')
  async findRankedFeed(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
    @Query('cursorScore') cursorScore?: string,
    @Query('cursorId') cursorId?: string,
  ) {
    // 쿼리 파라미터로 받은 score는 문자열이므로 숫자로 변환
    const score = cursorScore ? parseFloat(cursorScore) : undefined;
    return this.clinksService.findRankedFeedByCursor(limit, score, cursorId);
  }
  // 파일 크기 계산
  private async getFileSize(filePath: string): Promise<number> {
    const stats = fs.statSync(filePath);
    return stats.size;
  }

  @Post('/mock')
  async createMockClinks() {
    return await this.clinksService.createMockClinks();
  }
}
