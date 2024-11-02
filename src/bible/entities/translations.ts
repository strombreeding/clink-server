import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId, Types } from 'mongoose';
import { Translation, TranslationCode } from '../../../types/enum';

export type TranslationsDocument = HydratedDocument<Translations>;

@Schema()
export class Translations {
  @Prop()
  name: Translation;

  @Prop()
  code: TranslationCode;
}

export const TranslationsSchema = SchemaFactory.createForClass(Translations);
