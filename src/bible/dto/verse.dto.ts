import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from '../../common/dto/api-response.dto';
import { Verse } from '../entities/verse.entity';

export class VersesResponseDto extends ApiResponseDto<Verse[]> {
  @ApiProperty({ type: [Verse] })
  data: Verse[];
}
