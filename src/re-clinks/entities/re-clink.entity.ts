import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ReClinkDocument = HydratedDocument<ReClink>;

@Schema({ timestamps: true })
export class ReClink {
  @Prop({ enum: ['RE_CLINK', 'RE_CLINK_COMMENT'], required: true })
  type: 'RE_CLINK' | 'RE_CLINK_COMMENT';

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  ownerId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Clink', required: true })
  clinkId: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReClink',
    require: false,
  })
  parentId: string;

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

export const ReClinkSchema = SchemaFactory.createForClass(ReClink);

ReClinkSchema.index({ totalScore: -1, createdAt: -1 });
