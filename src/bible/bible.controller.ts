import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
} from '@nestjs/common';
import { BibleService } from './bible.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Translation } from '../../types/enum';
import { query } from 'express';
import { ObjectId } from 'mongoose';

@Controller('bible')
export class BibleController {
  constructor(private readonly bibleService: BibleService) {}

  @Get('/have-translations')
  async getAllTranslations() {
    const translations = await this.bibleService.findAllTranslation();
    return {
      msg: '서버가 소유한 번역본 리스트 조회',
      data: translations,
      status: HttpStatus.OK,
    };
  }

  @Get('/chapters')
  async getAllChapters(@Query() query: { translations?: Translation }) {
    const chapters = await this.bibleService.findAllChapters(
      query.translations,
    );
    return {
      msg: '챕터 조회 ',
      data: chapters,
      status: HttpStatus.OK,
    };
  }

  @Get('/verses')
  async getVersesFromChapter(@Query() query: { chapterId: string }) {
    const verses = await this.bibleService.findVersesFromChapterId(
      query.chapterId,
    );
    return {
      msg: '절 조회',
      status: HttpStatus.OK,
      data: verses,
    };
  }

  @Post('/new-translation')
  @UseInterceptors(FileInterceptor('jsonFile'))
  async create(@UploadedFile() file: Express.Multer.File) {
    const zz = await this.bibleService.createChapter(file);
    return zz;
  }
}
