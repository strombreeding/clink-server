import { Module } from '@nestjs/common';
import { MagazinesService } from './magazines.service';
import { MagazinesController } from './magazines.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Magazine, MagazineSchema } from './entities/magazine.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Magazine.name, schema: MagazineSchema },
    ]),
  ],
  controllers: [MagazinesController],
  providers: [MagazinesService],
  exports: [MagazinesService],
})
export class MagazinesModule {}
