import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';

import { BannersModule } from './banners/banners.module';
import { UsersModule } from './users/users.module';
import { BibleModule } from './bible/bible.module';
import { VersesModule } from './verses/verses.module';
import { ReportsModule } from './reports/reports.module';
import { ClinksModule } from './clinks/clinks.module';
import { ReClinksModule } from './re-clinks/re-clinks.module';
import { LikesModule } from './likes/likes.module';
import { NotificationsModule } from './notifications/notifications.module';
import { MagazinesModule } from './magazines/magazines.module';
import { InputBibleModule } from './input-bible/input-bible.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/click'),
    BannersModule,
    UsersModule,
    BibleModule,
    VersesModule,
    ReportsModule,
    ClinksModule,
    ReClinksModule,
    LikesModule,
    NotificationsModule,
    MagazinesModule,
    InputBibleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
