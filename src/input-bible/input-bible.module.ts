import { Module } from '@nestjs/common';
import { InputBibleService } from './input-bible.service';
import { InputBibleController } from './input-bible.controller';

@Module({
  providers: [InputBibleService],
  controllers: [InputBibleController]
})
export class InputBibleModule {}
