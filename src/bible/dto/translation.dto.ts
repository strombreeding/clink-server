import { ApiProperty } from '@nestjs/swagger';
import { ApiResponseDto } from '../../common/dto/api-response.dto';

export class TranslationDto {
  @ApiProperty()
  name: string;

  // 번역본에 필요한 다른 속성들도 추가할 수 있습니다
}

export class TranslationsResponseDto extends ApiResponseDto<TranslationDto[]> {
  @ApiProperty({ type: [TranslationDto] })
  data: TranslationDto[];
}
