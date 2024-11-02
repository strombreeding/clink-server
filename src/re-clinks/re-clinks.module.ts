import { Module } from '@nestjs/common';
import { ReClinksService } from './re-clinks.service';
import { ReClinksController } from './re-clinks.controller';

@Module({
  controllers: [ReClinksController],
  providers: [ReClinksService],
})
export class ReClinksModule {}
