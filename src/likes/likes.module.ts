import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Like, LikeSchema } from './entities/like.entity';
import { UsersModule } from 'src/users/users.module';
import { ReClinksModule } from 'src/re-clinks/re-clinks.module';
import { ClinksModule } from 'src/clinks/clinks.module';
import { MagazinesModule } from 'src/magazines/magazines.module';

@Module({
  imports: [
    ReClinksModule,
    ClinksModule,
    MagazinesModule,
    UsersModule,
    MongooseModule.forFeature([{ name: Like.name, schema: LikeSchema }]),
  ],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}
