import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { ClinksService } from './clinks.service';
import { CreateClinkDto } from './dto/create-clink.dto';
import { UpdateClinkDto } from './dto/update-clink.dto';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

@Controller('clinks')
export class ClinksController {
  constructor(private readonly clinksService: ClinksService) {}

  @Post('/')
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
    @Body() body: { bible: string; content: string; userId: string },
  ) {
    const bibleList = JSON.parse(JSON.stringify(body.bible));
    const content = body.content;
    const userId = body.userId;
    const processedFiles = [];
    if (files || files.length > 0) {
      const fs = require('fs').promises;

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

            await fs.writeFile(filePath, buffer); // 파일 덮어쓰기

            fileSize = await this.getFileSize(filePath); // 새로 저장된 파일 크기 확인
            quality -= 10;
          }

          if (fileSize > 1 * 1024 * 1024) {
            // 여전히 크기가 큰 경우 삭제
            await fs.unlink(filePath);
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
  async getAllClinks() {
    return await this.clinksService.findAllClinks();
  }
  // 파일 크기 계산
  private async getFileSize(filePath: string): Promise<number> {
    const fs = require('fs').promises;
    const stats = await fs.stat(filePath);
    return stats.size;
  }
}
