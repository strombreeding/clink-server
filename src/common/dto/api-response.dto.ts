import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty()
  msg: string;

  @ApiProperty()
  status: number;

  @ApiProperty()
  data: T;
}
