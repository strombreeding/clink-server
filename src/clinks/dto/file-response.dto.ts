import { ApiProperty } from '@nestjs/swagger';

export class FileResponseDto {
  @ApiProperty({
    description: '응답 메시지',
    example: 'Files processed successfully',
    type: String,
  })
  message: string;

  @ApiProperty({
    description: '처리된 파일 경로 목록',
    example: ['/uploads/123e4567-e89b-12d3-a456-426614174000.jpg'],
    type: [String],
  })
  files: string[];
}
