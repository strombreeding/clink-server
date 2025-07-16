import { PartialType } from '@nestjs/mapped-types';
import { CreateClinkDto } from './create-clink.dto';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateClinkDto extends PartialType(CreateClinkDto) {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsString({ each: true })
  imgList?: string[];

  @IsOptional()
  @IsString({ each: true })
  verses?: string[];
}
