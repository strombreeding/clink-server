import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ type: mongoose.Schema.Types.ObjectId })
  _id: mongoose.Types.ObjectId;

  @Prop({ require: false })
  name: string | null;

  @Prop({ require: false, default: null })
  nickname: string | null;

  @Prop({ require: false, default: null })
  profileImg: string | null;

  @Prop({ require: false, default: null })
  phone: string | null;

  @Prop({ require: false, default: null })
  email: string | null;

  @Prop({ require: false, default: null })
  gender: string | null;

  @Prop({ require: false, default: null })
  birth: string | null;

  @Prop({ require: false, default: '성도' })
  type: string;

  @Prop({ require: false, default: '' })
  info: string;

  @Prop({ require: false, default: false })
  fcmAllow: boolean;

  @Prop({ require: false, default: '' })
  fcmToken: string;

  @Prop({ default: new Date() })
  survey: Date;

  @Prop({ default: new Date() })
  createdAt: Date;

  @Prop({ default: new Date() })
  updatedAt: Date;

  @Prop({ default: new Date() })
  lastNicknameUpdateAt: Date;

  @Prop({ unique: true })
  kakaoId: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
