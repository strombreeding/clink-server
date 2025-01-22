import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId, Types } from 'mongoose';
import { Translation, TranslationCode } from '../../../types/enum';

export type VerseDocument = HydratedDocument<Verse>;

@Schema()
export class Verse {
  @Prop({ type: Types.ObjectId })
  chapterId: ObjectId | string;

  @Prop()
  index: string;

  @Prop()
  content: string;

  @Prop({ type: [Types.ObjectId] })
  markedUsers: ObjectId[]; // 마크업한 유저의 수

  @Prop({ type: [Types.ObjectId] })
  postIdList: ObjectId[] | string[];
}

export const VerseSchema = SchemaFactory.createForClass(Verse);

// 텍스트 인덱스 설정
VerseSchema.index({ content: 'text' });
