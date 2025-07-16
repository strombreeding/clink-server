import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type LikeDocument = HydratedDocument<Like>;

@Schema({ timestamps: true })
export class Like {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  ownerId: string; // 좋아요 누른 사람

  @Prop({ type: String, enum: ['clink', 'reclink', 'magazine'] })
  type: 'clink' | 'reclink' | 'magazine';

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Clink',
    required: false,
    default: null,
  })
  clinkId: string; // 좋아요 누른 크링크

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReClink',
    required: false,
    default: null,
  })
  reclinkId: string; // 좋아요 누른 리크링크

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ReClink',
    required: false,
    default: null,
  })
  reclinkCommentId: string; // 좋아요 누른 리크링크 댓글

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Magazine',
    required: false,
    default: null,
  })
  magazineId: string; // 좋아요 누른 매거진

  @Prop({ default: new Date() })
  createdAt: Date;
}

export const LikeSchema = SchemaFactory.createForClass(Like);
