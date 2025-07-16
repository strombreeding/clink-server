import { PartialType } from '@nestjs/mapped-types';
import { CreateReClinkDto } from './create-re-clink.dto';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateReClinkDto extends PartialType(CreateReClinkDto) {
  @IsNotEmpty()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString({ each: true })
  imgList?: string[];

  @IsOptional()
  @IsString({ each: true })
  verses?: string[];

  @IsOptional()
  commentCount?: number;

  @IsOptional()
  likeCount?: number;
}
