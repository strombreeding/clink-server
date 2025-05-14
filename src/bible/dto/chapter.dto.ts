import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { Chapter } from '../entities/chapter.entity';

export class ChaptersResponseDto extends ApiResponseDto<
  { chapterIdList: Chapter[]; name: string }[]
> {
  @ApiProperty({ type: [Chapter] })
  data: { chapterIdList: Chapter[]; name: string }[];
}
