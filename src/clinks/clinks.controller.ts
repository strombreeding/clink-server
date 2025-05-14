import {
  Controller,
  Get,
  Post,
  Body,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ClinksService } from './clinks.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import * as fs from 'fs';
import {
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateClinkDto } from './dto/create-clink.dto';
import { FileResponseDto } from './dto/file-response.dto';
import { Clink } from './entities/clink.entity';

@ApiTags('clinks')
@Controller('clinks')
export class ClinksController {
  constructor(private readonly clinksService: ClinksService) {}

  @Post('/')
  @ApiOperation({
    summary: '클링 업로드',
    description: '클링 데이터와 이미지를 업로드합니다.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: '크링크가 성공적으로 생성되었습니다.',
    type: FileResponseDto,
  })
  @UseInterceptors(
    FilesInterceptor('photos', 5, {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          const uniqueSuffix = uuidv4() + extname(file.originalname);
          callback(null, uniqueSuffix);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 각 파일 크기 5MB 제한
    }),
  )
  async uploadClink(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Body() body: CreateClinkDto,
  ) {
    const bibleList = body.bible ? JSON.parse(JSON.stringify(body.bible)) : [];
    const content = body.content;
    const userId = body.userId;
    const processedFiles = [];
    if (files || files.length > 0) {
      for (const file of files) {
        const filePath = join('./uploads', file.filename);
        let fileSize = await this.getFileSize(filePath);

        if (fileSize > 1 * 1024 * 1024) {
          // 파일 크기가 1MB를 넘으면
          let quality = 90;

          while (fileSize > 1 * 1024 * 1024 && quality > 10) {
            const buffer = await sharp(filePath)
              .resize({ width: 800 }) // 너비를 800px로 설정 (비율 유지)
              .jpeg({ quality }) // 품질을 조정하여 크기 줄임
              .toBuffer(); // 버퍼로 변환

            fs.writeFileSync(filePath, buffer); // 파일 덮어쓰기

            fileSize = await this.getFileSize(filePath); // 새로 저장된 파일 크기 확인
            quality -= 10;
          }

          if (fileSize > 1 * 1024 * 1024) {
            // 여전히 크기가 큰 경우 삭제
            fs.unlinkSync(filePath);
            console.log(`Large file ${filePath} deleted successfully`);
            continue; // 다음 파일로 넘어감
          }
        }

        processedFiles.push(`/uploads/${file.filename}`);
      }
    }

    await this.clinksService.create(userId, bibleList, processedFiles, content);

    return {
      message: 'Files processed successfully',
      files: processedFiles,
    };
  }

  @Get('/')
  @ApiOperation({
    summary: '모든 클링 조회',
    description: '저장된 모든 클링 데이터를 조회합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '클링 목록을 성공적으로 조회했습니다.',
    type: [Clink],
  })
  async getAllClinks() {
    return await this.clinksService.findAllClinks();
  }
  // 파일 크기 계산
  private async getFileSize(filePath: string): Promise<number> {
    const stats = fs.statSync(filePath);
    return stats.size;
  }
}
