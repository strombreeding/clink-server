import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

export type ClinkDocument = HydratedDocument<Clink>;

@Schema()
export class Clink {
  @ApiProperty({
    description: '사용자 정보',
  })
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userState: User; // 창세기

  @ApiProperty({
    description: '클링 내용',
    example: '오늘의 묵상 내용입니다.',
    type: String,
  })
  @Prop()
  content: string; // 새번역

  @ApiProperty({
    description: '파일 경로 목록',
    example: ['/uploads/123e4567-e89b-12d3-a456-426614174000.jpg'],
    type: [String],
  })
  @Prop()
  filePath: string[];

  @ApiProperty({
    description: '생성 일시',
    type: Date,
  })
  @Prop({ default: new Date() })
  createdAt: Date;

  @ApiProperty({
    description: '수정 일시',
    type: Date,
  })
  @Prop({ default: new Date() })
  updatedAt: Date;
}

export const ClinkSchema = SchemaFactory.createForClass(Clink);
