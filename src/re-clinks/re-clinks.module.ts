import { Module } from '@nestjs/common';
import { ReClinksService } from './re-clinks.service';
import { ReClinksController } from './re-clinks.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { ReClink, ReClinkSchema } from './entities/re-clink.entity';
import { UsersModule } from 'src/users/users.module';
import { Like, LikeSchema } from 'src/likes/entities/like.entity';
import { Clink, ClinkSchema } from 'src/clinks/entities/clink.entity';
import { LikesModule } from 'src/likes/likes.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Clink.name, schema: ClinkSchema }]),
    MongooseModule.forFeature([{ name: ReClink.name, schema: ReClinkSchema }]),
    MongooseModule.forFeature([{ name: Like.name, schema: LikeSchema }]),
    UsersModule,
  ],
  controllers: [ReClinksController],
  providers: [ReClinksService],
  exports: [ReClinksService],
})
export class ReClinksModule {}
