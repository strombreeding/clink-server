import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, ObjectId, Types } from 'mongoose';
import { Translation, TranslationCode } from '../../../types/enum';
import { User } from '../../users/entities/user.entity';

export type ClinkDocument = HydratedDocument<Clink>;

@Schema()
export class Clink {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  userState: User; // 창세기

  @Prop()
  content: string; // 새번역

  @Prop()
  filePath: string[];

  @Prop({ default: new Date() })
  createdAt: Date;

  @Prop({ default: new Date() })
  updatedAt: Date;
}

export const ClinkSchema = SchemaFactory.createForClass(Clink);
