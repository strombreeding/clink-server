import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId, Types } from 'mongoose';
import { Translation, TranslationCode } from '../../../types/enum';

export type ChapterDocument = HydratedDocument<Chapter>;

@Schema()
export class Chapter {
  @Prop()
  name: string; // 창세기

  @Prop()
  translation: Translation; // 새번역

  @Prop()
  translationCode: TranslationCode; // 새번역

  @Prop()
  isOldGospel: boolean; // 구약 true

  @Prop({ type: Types.ObjectId })
  prevChapter: ObjectId | null | string; // 이전 장에 chapter id

  @Prop({ type: Types.ObjectId })
  nextChapter: ObjectId | null | string; // // 다음 chapter  id

  @Prop()
  customId: string; // 크롤링때 생성한 id값

  @Prop()
  chapter: string; // 몇장인지
}

export const ChapterSchema = SchemaFactory.createForClass(Chapter);
