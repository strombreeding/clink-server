import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserTypeEnum } from '../../../types/enum';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ require: true })
  name: string;

  @Prop({ require: true })
  nickname: string;

  @Prop()
  age: number;

  @Prop()
  type: string;

  @Prop()
  info: string;

  @Prop()
  profileImg: string;

  @Prop({ default: new Date() })
  createdAt: Date;

  @Prop({ default: null })
  deletedAt: Date | null;

  //   @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Owner' })
  //   owner: Owner;
}

export const UserSchema = SchemaFactory.createForClass(User);
