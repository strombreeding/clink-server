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
} from '@nestjs/common';
import { BibleService } from './bible.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Translation } from '../../types/enum';
import { query } from 'express';
import { ObjectId } from 'mongoose';

@Controller('bible')
export class BibleController {
  constructor(private readonly bibleService: BibleService) {}

  @Post('new-translation')
  @UseInterceptors(FileInterceptor('jsonFile'))
  async create(@UploadedFile() file: Express.Multer.File) {
    const zz = await this.bibleService.createChapter(file);
    return zz;
  }

  @Get('/have-translations')
  async getAllTranslations() {
    const translations = await this.bibleService.findAllTranslation();
    return translations;
  }

  @Get('/chapters')
  async getAllChapters(@Query() query: { translations?: Translation }) {
    const chapters = await this.bibleService.findAllChapters(
      query.translations,
    );
    return chapters;
  }

  @Get('/verses')
  async getVersesFromChapter(@Query() query: { chapterId: string }) {
    const verses = await this.bibleService.findVersesFromChapterId(
      query.chapterId,
    );
    return verses;
  }

  @Get()
  async getChapterAndVerses(
    @Query() { chapterName: string, chapter: number, translation: Translation },
  ) {}
}
