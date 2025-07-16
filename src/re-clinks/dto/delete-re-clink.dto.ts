import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import mongoose from 'mongoose';

export class CreateReClinkDto {
  @IsOptional()
  reclink?: mongoose.Types.ObjectId;

  @IsNotEmpty()
  clinkId?: mongoose.Types.ObjectId;

  @IsOptional()
  parentId?: mongoose.Types.ObjectId;

  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  type: 'RE_CLINK' | 'RE_CLINK_COMMENT';

  @IsOptional()
  imgList?: string[];

  @IsOptional()
  verses?: string[];
}
