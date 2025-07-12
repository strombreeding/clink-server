import {
  Controller,
  Get,
  Post,
  Query,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { BibleService } from './bible.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Translation } from '../../types/enum';
import { ApiOperation, ApiProperty, ApiResponse } from '@nestjs/swagger';
import { TranslationsResponseDto } from './dto/translation.dto';
import { ChaptersResponseDto } from './dto/chapter.dto';
import { VersesResponseDto } from './dto/verse.dto';

@Controller('bible')
export class BibleController {
  constructor(private readonly bibleService: BibleService) {}

  // - 서버가 가지고 있는 번역본 정보 조회
  @Get('/have-translations')
  async getAllTranslations(): Promise<TranslationsResponseDto> {
    const translations = await this.bibleService.findAllTranslation();
    return {
      msg: '서버가 소유한 번역본 리스트 조회',
      data: translations,
      status: HttpStatus.OK,
    };
  }

  // -
  @Get('/chapters')
  async getAllChapters(
    @Query()
    query: {
      translations?: Translation;
      customId?: string;
      chapterId?: string;
      name?: string;
    },
  ): Promise<ChaptersResponseDto> {
    if (
      query.customId == null &&
      query.chapterId == null &&
      query.translations == null &&
      query.name == null
    ) {
      throw new HttpException(
        '아이디 값이 누락되었습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const chapters = await this.bibleService.findAllChapters(
      query.translations,
      query.customId,
      query.chapterId,
      query.name,
    );
    return {
      msg: '챕터 조회',
      data: chapters,
      status: HttpStatus.OK,
    };
  }

  @Get('/verses')
  async getVersesFromChapter(
    @Query()
    query: {
      chapterId?: string;
      customId?: string;
      customChapterId?: string;
      verseId?: string;
    },
  ): Promise<VersesResponseDto> {
    if (
      query.chapterId == null &&
      query.customId == null &&
      query.customChapterId == null &&
      query.verseId == null
    ) {
      throw new HttpException(
        '아이디 값이 누락되었습니다.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const verses = await this.bibleService.findVersesFromChapterId(
      query.chapterId,
      query.customId,
      query.customChapterId,
      query.verseId,
    );

    return {
      msg: '절 조회',
      status: HttpStatus.OK,
      data: verses || [],
    };
  }

  @Post('/new-translation')
  @UseInterceptors(FileInterceptor('jsonFile'))
  async create(@UploadedFile() file: Express.Multer.File) {
    const zz = await this.bibleService.createChapter(file);
    return zz;
  }

  // - 구절별 검색 기능
  @Get('/verses/for-word')
  async getForWord(
    @Query()
    query: {
      word: string;
      lastId?: string;
      useLegacyLogic?: boolean;
    },
  ) {
    const result = await this.bibleService.findVerseForWord(
      query.word,
      query.lastId,
      query.useLegacyLogic === true ? true : false,
    );
    return {
      msg: '검색 결과',
      status: HttpStatus.OK,
      data: result,
    };
  }
}
