import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Chapter, ChapterDocument } from './entities/chapter.entity';
import mongoose, { Model, ObjectId, Types } from 'mongoose';
import { Translation, TranslationCode } from '../../types/enum';
import { Verse } from './entities/verse.entity';
import { Translations } from './entities/translations';
import { ISearchWordRes } from 'types';

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

    console.log(JSON.parse(jsonContent));

    const existBible = await this.chapterModel.findOne({
      translation: data.chapters[0].translation,
    });
    console.log('ㅂㅇ');
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

      // );
    }
    return true;
  }

  async findVerseForWord(
    searchWord: string,
    lastId?: string,
    useLegacyLogic: boolean = false, // true: 기존 $regex 로직, false: 개선된 $text 로직
    pageSize: number = 25,
  ): Promise<ISearchWordRes> {
    // 1. 입력 문자열 전처리
    const trimmedSearchTerm = searchWord.trim();

    if (!trimmedSearchTerm) {
      console.log('검색어가 유효하지 않습니다.');
      return { verses: [], hasNextPage: false, lastId: null };
    }

    const pipeline: any[] = [];

    // --- 검색어 매칭 및 초기 필터링 로직 (여기서 분기) ---
    if (useLegacyLogic) {
      // **기존 $regex 로직 (손상 없이 유지)**
      pipeline.push({
        $match: {
          content: { $regex: trimmedSearchTerm, $options: 'i' },
        },
      });

      // 기존 _id 기반 커서 페이지네이션 조건
      if (lastId) {
        pipeline.push({
          $match: {
            _id: { $gt: new Types.ObjectId(lastId) },
          },
        });
      }

      // 기존 _id 기준 정렬
      pipeline.push({
        $sort: { _id: 1 },
      });

      pipeline.push({
        $project: {
          _id: 1,
          chapterId: 1,
          index: 1,
          content: 1,
        },
      });
    } else {
      pipeline.push({
        $match: {
          $text: { $search: trimmedSearchTerm },
        },
      });

      if (lastId) {
        pipeline.push({
          $match: {
            _id: { $gt: new Types.ObjectId(lastId) },
          },
        });
      }

      pipeline.push({
        $sort: { _id: 1 },
      });

      pipeline.push({
        $project: {
          _id: 1,
          chapterId: 1, // $lookup 전에도 chapterId는 있어야 합니다.
          index: 1, // $lookup 전에도 index는 있어야 합니다.
          content: 1, // $lookup 전에도 content는 있어야 합니다.
        },
      });
    }

    // --- 검색어 매칭 및 초기 필터링 로직 끝 ---
    // 2. Chapter 컬렉션과 조인 ($lookup) - 로직 변화 없음
    pipeline.push({
      $lookup: {
        from: 'chapters',
        localField: 'chapterId',
        foreignField: '_id',
        as: 'chapterInfo',
      },
    });

    // 3. 조인된 배열을 단일 객체로 펼치기 ($unwind) - 로직 변화 없음
    pipeline.push({
      $unwind: {
        path: '$chapterInfo',
        preserveNullAndEmptyArrays: true,
      },
    });

    // 4. 최종 결과 필드 선택 및 이름 변경 ($project) -
    pipeline.push({
      $project: {
        _id: '$_id',
        chapterId: '$chapterId',
        index: '$index',
        content: '$content', // 원본 content는 여기서 가져옵니다.
        chapterName: '$chapterInfo.name',
        chapterIndex: '$chapterInfo.chapter',
      },
    });

    // 5. 결과 개수 제한 (한 페이지 + 다음 페이지 존재 여부 확인을 위해 1개 더 가져옴) - 로직 변화 없음
    pipeline.push({
      $limit: pageSize + 1,
    });

    const rawResults = await this.verseModel.aggregate(pipeline);
    console.log(rawResults[rawResults.length - 1]._id);

    const hasNextPage = rawResults.length > pageSize;
    const paginatedResults = rawResults.slice(0, pageSize);

    // 6. 앞뒤 어절 추출 및 최종 가공 - 로직 변화 없음 (NULL 검사 포함)
    const finalProcessedResults = paginatedResults
      .map((doc) => {
        let regex;

        if (useLegacyLogic) {
          regex = new RegExp(
            `(\\S*)(${trimmedSearchTerm})(\\S*)`, // 공백이 아닌 문자로 검색어 앞뒤를 모두 잡기
            'i',
          );
        } else {
          regex = new RegExp(`(\\S*\\s)?(${trimmedSearchTerm})(\\s\\S*)?`, 'i');
        }

        const match = doc.content.match(regex);

        if (match) {
          const before = match[1] || ''; // 앞 어절 (없으면 빈 문자열)
          const after = match[3] || ''; // 뒤 어절 (없으면 빈 문자열)
          return {
            _id: doc._id,
            chapterId: doc.chapterId,
            index: doc.index,
            chapterName: doc.chapterName,
            chapterIndex: doc.chapterIndex,
            fullContent: doc.content,
            content: `${before}${match[2]}${after}`
              .trim()
              .replace(/^[\\"]+|[\\"]+$/g, '')
              .replace('”', '')
              .replace('“', '')
              .replace('’', '')
              .replace('‘', ''),
          }; // 결과 조합 및 공백 제거
        }

        return null;
      })
      .filter((item) => item !== null); // null 값 제거

    console.log(finalProcessedResults.length);

    const lastDoc =
      finalProcessedResults.length > 0
        ? finalProcessedResults[finalProcessedResults.length - 1]
        : null;
    const nextLastId = lastDoc ? lastDoc._id : null;

    if (finalProcessedResults.length === 0 && useLegacyLogic === false) {
      console.log('검색어결과가 없어서 기존 로직으로 다시 검색');
      return await this.findVerseForWord(searchWord, lastId, true, pageSize);
    }

    return {
      verses: finalProcessedResults,
      hasNextPage: hasNextPage,
      lastId: nextLastId,
    };
  }
}
