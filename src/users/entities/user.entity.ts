import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { UserTypeEnum } from '../../../types/enum';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ require: true, unique: true })
  name: string;

  @Prop()
  age: number;

  @Prop()
  type: UserTypeEnum;

  @Prop()
  info: string;

  @Prop()
  profileImg: string;

  //   @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Owner' })
  //   owner: Owner;
}

export const UserSchema = SchemaFactory.createForClass(User);
