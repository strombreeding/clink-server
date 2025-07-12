import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId, Types } from 'mongoose';
import { Translation, TranslationCode } from '../../../types/enum';

export type VerseDocument = HydratedDocument<Verse>;

@Schema()
export class Verse {
  @Prop({ type: Types.ObjectId })
  chapterId: ObjectId | string;

  @Prop()
  customChapterId: string;

  @Prop()
  customId: string;

  @Prop()
  index: string;

  @Prop()
  content: string;

  @Prop()
  markedUsers: number;

  @Prop({ type: [Types.ObjectId] })
  postIdList: ObjectId[] | string[];
}

export const VerseSchema = SchemaFactory.createForClass(Verse);

// 텍스트 인덱스 설정
VerseSchema.index({ content: 'text' });
VerseSchema.index({ chapterId: 1 });

// customChapterId로 자주 검색/정렬한다면
VerseSchema.index({ customChapterId: 1 });

// customId로 자주 검색/정렬하며, 고유해야 한다면
VerseSchema.index({ customId: 1 }, { unique: true });
