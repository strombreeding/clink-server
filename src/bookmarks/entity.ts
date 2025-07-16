import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type BookmarkDocument = HydratedDocument<Bookmark>;

@Schema({ timestamps: true })
export class Bookmark {
  @Prop({ require: true })
  title: string;

  @Prop({ require: true })
  subtitle: string;

  @Prop({ require: true })
  contentText: string;

  @Prop({ require: true })
  contentImg: string;

  @Prop({ require: true })
  thumbnailImg: string;
}

export const BookmarkSchema = SchemaFactory.createForClass(Bookmark);
