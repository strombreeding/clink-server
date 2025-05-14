import {
  Controller,
  Get,
  Post,
  Query,
  UseInterceptors,
  UploadedFile,
  HttpStatus,
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

  @Get('/have-translations')
  @ApiOperation({ summary: '서버에서 소유하고 있는 번역본 찾기' })
  @ApiResponse({
    status: 200,
    description: '번역본 갖고있는 리스트 반환',
    type: TranslationsResponseDto,
  })
  async getAllTranslations(): Promise<TranslationsResponseDto> {
    const translations = await this.bibleService.findAllTranslation();
    return {
      msg: '서버가 소유한 번역본 리스트 조회',
      data: translations,
      status: HttpStatus.OK,
    };
  }

  @Get('/chapters')
  @ApiOperation({ summary: '모든 챕터 조회' })
  @ApiResponse({
    status: 200,
    description: '챕터별 장수 리스트 반환',
    type: ChaptersResponseDto,
  })
  @ApiProperty({ example: '새번역', description: '번역본 이름' })
  async getAllChapters(
    @Query()
    query: {
      translations?: Translation;
    },
  ): Promise<ChaptersResponseDto> {
    const chapters = await this.bibleService.findAllChapters(
      query.translations,
    );
    return {
      msg: '챕터 조회',
      data: chapters,
      status: HttpStatus.OK,
    };
  }

  @Get('/verses')
  @ApiResponse({
    status: 200,
    description: '절 조회 결과 반환',
    type: VersesResponseDto,
  })
  async getVersesFromChapter(
    @Query() query: { chapterId: string },
  ): Promise<VersesResponseDto> {
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

  @Get('/verses/for-word')
  async getForWord(@Query() query: { word: string }) {
    console.log(query.word);
    const result = await this.bibleService.findVerseForWord(query.word);
    return result;
  }
}
