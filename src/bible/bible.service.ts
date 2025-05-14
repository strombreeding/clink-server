import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Chapter, ChapterDocument } from './entities/chapter.entity';
import mongoose, { Model, ObjectId } from 'mongoose';
import { Translation, TranslationCode } from '../../types/enum';
import { Verse } from './entities/verse.entity';
import { Translations } from './entities/translations';

interface IChapterProps {
  name: string;
  translation: Translation;
  isOldGospel: boolean;
  prevChapter: ObjectId | null;
  nextChapter: ObjectId | null;
  customId: string;
  chapter: string;
}

interface IVerseProps {
  customId: string;
  chapterId: ObjectId | string;
  index: string;
  content: string;
  markedUsers: ObjectId[];
}

@Injectable()
export class BibleService {
  constructor(
    @InjectModel(Chapter.name) private chapterModel: Model<Chapter>,
    @InjectModel(Verse.name) private verseModel: Model<Verse>,
    @InjectModel(Translations.name) private tlModel: Model<Translations>,
  ) {}

  async findAllTranslation() {
    try {
      const result = await this.tlModel.find({});
      return result;
    } catch (err) {}
  }

  async findAllChapters(translation?: Translation) {
    try {
      const chapters = await this.chapterModel.find({
        translation: translation == null ? '새번역' : translation,
      });
      const bookMap = new Map<string, ChapterDocument[]>();
      console.log(bookMap.has('창세기'));
      chapters.forEach((chapter) => {
        if (bookMap.has(chapter.name)) {
          bookMap.get(chapter.name).push(chapter);
        } else {
          bookMap.set(chapter.name, [chapter]);
        }
      });

      const finalData = Array.from(bookMap, ([name, chapterIdList]) => ({
        name,
        chapterIdList,
      }));

      return finalData;
    } catch (err) {}
  }

  async findVersesFromChapterId(chapterId: string) {
    try {
      const verses = await this.verseModel.find({
        chapterId: new mongoose.Types.ObjectId(chapterId),
      });

      return verses;
    } catch (err) {}
  }

  async createChapter(file: Express.Multer.File) {
    const jsonContent = file.buffer.toString();
    const data: { chapters: IChapterProps[]; verses: IVerseProps[] } =
      JSON.parse(jsonContent);

    const existBible = await this.chapterModel.findOne({
      translation: data.chapters[0].translation,
    });
    if (existBible) {
      return `이미 존재하는 번역본 입니다.[${data.chapters[0].translation}]`;
    }
    await this.tlModel.create({
      name: data.chapters[0].translation,
      code: data.chapters[0].customId.split('-')[0],
    });
    const progressChapterList = [] as ChapterDocument[];
    for (let i = 0; i < data.chapters.length; i++) {
      const translationCode = data.chapters[i].customId.split(
        '-',
      )[0] as TranslationCode;

      const chapterModel: Chapter = {
        ...data.chapters[i],
        translationCode,
        chapter: data.chapters[i].chapter,
        isOldTestament: data.chapters[i].isOldGospel,
      };

      const newChapter = await this.chapterModel.create(chapterModel);
      progressChapterList.push(newChapter);
    }
    for (let i = 0; i < progressChapterList.length; i++) {
      const { _id, nextChapter, prevChapter, customId } =
        progressChapterList[i];

      // 벌스를 만듬
      const hasVerses = data.verses.filter((verse) => {
        return verse.chapterId === customId;
      });
      for (let i = 0; i < hasVerses.length; i++) {
        const newVerse = {
          ...hasVerses[i],
          chapterId: _id,
          postIdList: [],
        };
        await this.verseModel.create(newVerse);
      }

      console.log(hasVerses.length, customId);

      // 다음챕터가 있을 경우 해당 customId를 가진 customId를 조회후에 걔의 _id를 넣음
      if (prevChapter !== null) {
        const prevChapterId = progressChapterList.find((chapter) => {
          return chapter.customId === prevChapter;
        })._id;
        await this.chapterModel.findOneAndUpdate(
          { _id },
          { $set: { prevChapter: prevChapterId } },
        );
      }
      if (nextChapter !== null) {
        const nextChapterId = progressChapterList.find((chapter) => {
          return chapter.customId === nextChapter;
        })._id;
        await this.chapterModel.findOneAndUpdate(
          { _id },
          { $set: { nextChapter: nextChapterId } },
        );
      }

      // await this.chapterModel.findOne({customId:})
      // mongoData.nextChapter = jsonData.nextChapter;
      // mongoData.prevChapter = jsonData.prevChapter;
      // await this.chapterModel.findOneAndUpdate(
      //   { _id: mongoData._id },
      //   { $set: { prevChapter: } },
      // );
    }
    return true;
  }

  async findVerseForWord(searchWord: string) {
    // 1. 입력 문자열 전처리
    const trimmedSearchTerm = searchWord.trim();

    // 2. MongoDB 쿼리 실행
    const results = await this.verseModel.find(
      { content: { $regex: trimmedSearchTerm, $options: 'i' } }, // content 필드에서 검색
      { chapterId: 1, content: 1 }, // chapterId와 content를 반환, _id는 기본적으로 포함됨
    );

    // 3. 앞뒤 어절 추출
    const result = results
      .map((doc) => {
        const regex = new RegExp(
          `(\\S*\\s)?(${trimmedSearchTerm})(\\s\\S*)?`,
          'i',
        );
        const match = doc.content.match(regex);

        if (match) {
          const before = match[1] || ''; // 앞 어절 (없으면 빈 문자열)
          const after = match[3] || ''; // 뒤 어절 (없으면 빈 문자열)
          return {
            _id: doc._id,
            chapterId: doc.chapterId,
            content: `${before}${match[2]}${after}`
              .trim()
              .replace(/^[\\"]+|[\\"]+$/g, ''),
          }; // 결과 조합 및 공백 제거
        }

        return null;
      })
      .filter((item) => item !== null); // null 값 제거
    console.log(result.length);
    return result;
  }
}
