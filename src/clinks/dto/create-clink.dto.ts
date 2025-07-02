import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateClinkDto {
  @IsString()
  @IsNotEmpty()
  content: string;

  @IsOptional()
  fileList?: string[];
}
