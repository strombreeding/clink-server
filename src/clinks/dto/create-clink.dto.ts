import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateClinkDto {
  @ApiProperty({
    description: '성경 구절 목록',
    example: ['John 3:16', 'Romans 8:28'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  bible: string[];

  @ApiProperty({
    description: '클링(Clink) 내용',
    example: '오늘의 묵상 내용입니다.',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  content: string;

  @ApiProperty({
    description: '사용자 ID',
    example: '60d21b4667d0d8992e610c85',
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: '클링 이미지 파일들 (최대 5개, 각 5MB 이하)',
    type: 'array',
    items: {
      type: 'string',
      format: 'binary',
    },
    required: false,
  })
  @IsOptional()
  photos?: Express.Multer.File[];
}
