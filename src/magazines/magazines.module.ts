import { Module } from '@nestjs/common';
import { MagazinesService } from './magazines.service';
import { MagazinesController } from './magazines.controller';

@Module({
  controllers: [MagazinesController],
  providers: [MagazinesService],
})
export class MagazinesModule {}
