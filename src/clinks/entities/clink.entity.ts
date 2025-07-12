import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ClinkDocument = HydratedDocument<Clink>;

@Schema({ timestamps: true })
export class Clink {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  ownerId: string;

  @Prop({ require: true, maxlength: 500 })
  content: string; // 새번역

  @Prop({ default: [] })
  imgList: string[]; // max Length 5

  @Prop({ default: [] })
  verses: string[]; // verse의 id

  @Prop({ default: 0 })
  likeCount: number;

  @Prop({ default: 0 })
  commentCount: number;

  @Prop({ default: 0 })
  totalScore: number;

  @Prop({ default: new Date() })
  createdAt: Date;

  @Prop({ default: new Date() })
  updatedAt: Date;
}

export const ClinkSchema = SchemaFactory.createForClass(Clink);

ClinkSchema.index({ totalScore: -1, createdAt: -1 });
