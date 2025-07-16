import { Module } from '@nestjs/common';
import { ClinksService } from './clinks.service';
import { ClinksController } from './clinks.controller';
import { Clink, ClinkSchema } from './entities/clink.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { ReClink, ReClinkSchema } from 'src/re-clinks/entities/re-clink.entity';
import { ReClinksService } from 'src/re-clinks/re-clinks.service';
import { ReClinksModule } from 'src/re-clinks/re-clinks.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Clink.name, schema: ClinkSchema }]),
    UsersModule,
    ReClinksModule,
  ],
  controllers: [ClinksController],
  providers: [ClinksService],
  exports: [ClinksService],
})
export class ClinksModule {}
