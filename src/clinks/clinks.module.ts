import { Module } from '@nestjs/common';
import { ClinksService } from './clinks.service';
import { ClinksController } from './clinks.controller';

@Module({
  controllers: [ClinksController],
  providers: [ClinksService],
})
export class ClinksModule {}
