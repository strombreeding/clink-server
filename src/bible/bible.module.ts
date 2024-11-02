import { Module } from '@nestjs/common';
import { BibleService } from './bible.service';
import { BibleController } from './bible.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Chapter, ChapterSchema } from './entities/chapter.entity';
import { Verse, VerseSchema } from './entities/verse.entity';
import { Translations, TranslationsSchema } from './entities/translations';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Chapter.name, schema: ChapterSchema },
      { name: Verse.name, schema: VerseSchema },
      { name: Translations.name, schema: TranslationsSchema },
    ]),
  ],
  controllers: [BibleController],
  providers: [BibleService],
})
export class BibleModule {}
