import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateLikeDto {
  @IsNotEmpty()
  type: 'clink' | 'reclink' | 'magazine';

  ownerId: string;

  @IsOptional()
  clinkId?: string;

  @IsOptional()
  reclinkId?: string;

  @IsOptional()
  reclinkCommentId?: string;

  @IsOptional()
  magazineId?: string;
}
