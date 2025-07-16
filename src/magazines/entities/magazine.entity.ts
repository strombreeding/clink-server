import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type MagazineDocument = HydratedDocument<Magazine>;

@Schema({ timestamps: true })
export class Magazine {
  @Prop()
  title: string;

  @Prop()
  content: string;

  @Prop()
  contentImg: string;

  @Prop()
  likeCount: number;

  @Prop()
  commentCount: number;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const MagazineSchema = SchemaFactory.createForClass(Magazine);
