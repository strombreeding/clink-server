import { Module } from '@nestjs/common';
import { ClinksService } from './clinks.service';
import { ClinksController } from './clinks.controller';
import { Clink, ClinkSchema } from './entities/clink.entity';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Clink.name, schema: ClinkSchema }]),
    UsersModule,
  ],
  controllers: [ClinksController],
  providers: [ClinksService],
})
export class ClinksModule {}
