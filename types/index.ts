import type { Types } from 'mongoose';

export interface ISearchWordRes {
  verses: {
    _id: Types.ObjectId;
    chapterId: Types.ObjectId;
    index: string;
    chapterName: string;
    chapterIndex: string;
    fullContent: string;
    content: string;
  }[];
  hasNextPage: boolean;
  lastId: Types.ObjectId | null;
}
