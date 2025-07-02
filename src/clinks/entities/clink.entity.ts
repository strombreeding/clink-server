import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ClinkDocument = HydratedDocument<Clink>;

@Schema({ timestamps: true })
export class Clink {
  @Prop({ require: true })
  ownerId: string;

  @Prop({ require: true, maxlength: 500 })
  content: string; // 새번역

  @Prop()
  filePath: string[]; // max Length 5

  @Prop({ default: new Date() })
  createdAt: Date;

  @Prop({ default: new Date() })
  updatedAt: Date;
}

export const ClinkSchema = SchemaFactory.createForClass(Clink);
