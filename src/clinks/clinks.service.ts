import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Clink } from './entities/clink.entity';
import mongoose, { Model, Types } from 'mongoose';
import { getMockList } from 'data';
import { ReClink } from 'src/re-clinks/entities/re-clink.entity';
import { ReClinksService } from 'src/re-clinks/re-clinks.service';
import { UpdateClinkDto } from './dto/update-clink.dto';

@Injectable()
export class ClinksService {
  constructor(
    @InjectModel(Clink.name)
    private clinkModel: Model<Clink>,
    private readonly reClinksService: ReClinksService,
  ) {}

  async createMockClinks() {
    const clinkData = getMockList();
    for (let i = 0; i < clinkData.length; i++) {
      await this.clinkModel.create(clinkData[i]);
    }
    return 'success';
  }

  async getClinkById(id: string, userId?: string) {
    const clinkObjectId = new Types.ObjectId(id);

    // 1. Clink 문서 하나 조회
    const clink = await this.clinkModel.aggregate([
      { $match: { _id: clinkObjectId } },
      {
        $lookup: {
          from: 'likes',
          localField: '_id',
          foreignField: 'clinkId',
          as: 'likeInfo',
        },
      },
      {
        $addFields: {
          isLiked: { $gt: [{ $size: '$likeInfo' }, 0] },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'ownerId',
          foreignField: '_id',
          as: 'userDetail',
        },
      },
      {
        $project: {
          _id: 1,
          content: 1,
          verses: 1,
          imgList: 1,
          createdAt: 1,
          updatedAt: 1,
          likeCount: 1,
          commentCount: 1,
          isLiked: 1,
          userDetail: {
            _id: 1,
            profileImg: 1,
            nickname: 1,
          },
        },
      },
    ]);

    if (!clink[0]) return null;

    // 2. 해당 Clink의 모든 댓글 + 대댓글 조회
    const reclinks = await this.reClinksService.getReClinkByClinkId(id, userId);
    return {
      clink: clink[0],
      reclinks,
    };
  }

  async getClinkPaginationByCursor(
    limit = 20,
    cursor?: {
      adjustedScore: number;
      createdAt: string;
      _id: string;
    },
    userId?: string,
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 오늘 00시 기준

    const pipeline: any[] = [
      {
        $addFields: {
          daysAgo: {
            $floor: {
              $divide: [
                { $subtract: [today, '$createdAt'] },
                1000 * 60 * 60 * 24,
              ],
            },
          },
        },
      },
      {
        $addFields: {
          baseScore: {
            $switch: {
              branches: [
                { case: { $lte: ['$daysAgo', 1] }, then: 8 },
                { case: { $lte: ['$daysAgo', 7] }, then: 5 },
                { case: { $lte: ['$daysAgo', 31] }, then: 2.5 },
                { case: { $lte: ['$daysAgo', 90] }, then: 1.5 },
                { case: { $lte: ['$daysAgo', 365] }, then: 0.5 },
                { case: { $lte: ['$daysAgo', 365 * 2] }, then: -0.5 },
                { case: { $lte: ['$daysAgo', 365 * 3] }, then: -0.7 },
                { case: { $lte: ['$daysAgo', 365 * 4] }, then: -1 },
              ],
              default: 0,
            },
          },
        },
      },
      {
        $addFields: {
          adjustedScore: {
            $cond: [
              { $gt: ['$daysAgo', 7] },
              { $add: [{ $multiply: ['$totalScore', 0.001] }, '$baseScore'] },
              { $add: ['$totalScore', '$baseScore'] },
              // { $gt: ['$daysAgo', 7] },
              // { $multiply: ['$totalScore', 0.0001] },
              // { $add: ['$totalScore', '$baseScore'] }, // 7일 이하 → 점수 + 기본 점수
            ],
          },
        },
      },
    ];

    if (cursor) {
      pipeline.push({
        $match: {
          $or: [
            { adjustedScore: { $lt: cursor.adjustedScore } },
            {
              adjustedScore: cursor.adjustedScore,
              createdAt: { $lt: new Date(cursor.createdAt) },
            },
            {
              adjustedScore: cursor.adjustedScore,
              createdAt: new Date(cursor.createdAt),
              _id: { $lt: new Types.ObjectId(cursor._id) },
            },
          ],
        },
      });
    }

    // 좋아요 했는지 여부 파이프라인 넣기
    console.log(userId, 'userId???');
    if (userId) {
      pipeline.push(
        {
          $lookup: {
            from: 'likes',
            let: { clinkId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: {
                    $and: [
                      { $eq: ['$clinkId', '$$clinkId'] },
                      { $eq: ['$ownerId', new Types.ObjectId(userId)] }, // 주의: userId는 ObjectId로 변환 필요
                      { $eq: ['$type', 'clink'] },
                    ],
                  },
                },
              },
            ],
            as: 'likeInfo',
          },
        },
        {
          $addFields: {
            isLiked: { $gt: [{ $size: '$likeInfo' }, 0] },
          },
        },
      );
    }
    pipeline.push(
      {
        $lookup: {
          from: 'users',
          localField: 'ownerId',
          foreignField: '_id',
          as: 'userDetail',
        },
      },
      {
        $lookup: {
          from: 'verses', // verse 컬렉션명 (주의: 실제 컬렉션명 확인)
          localField: 'verses',
          foreignField: 'customId',
          as: 'verseDetails',
        },
      },
      {
        $sort: {
          adjustedScore: -1,
          createdAt: -1,
          _id: -1,
        },
      },
      {
        $limit: limit,
      },
      {
        $project: {
          content: 1,
          createdAt: 1,
          updatedAt: 1,
          adjustedScore: 1,
          likeCount: 1,
          commentCount: 1,
          imgList: 1,
          verseDetails: {
            content: 1,
            customId: 1,
            customChapterId: 1,
            chapterId: 1,
          },
          userDetail: {
            _id: 1,
            nickname: 1,
            profileImg: 1,
          },
          isLiked: 1,
        },
      },
    );

    const clinks = await this.clinkModel.aggregate(pipeline);

    const nextCursor =
      clinks.length > 0
        ? {
            adjustedScore: clinks[clinks.length - 1].adjustedScore,
            createdAt: clinks[clinks.length - 1].createdAt,
            _id: clinks[clinks.length - 1]._id.toString(),
          }
        : null;

    return {
      clinks,
      nextCursor,
    };
  }

  async create(
    ownerId: mongoose.Types.ObjectId,
    content: string,
    imgList?: string[],
    verses?: string[],
  ) {
    const input = {
      ownerId,
      imgList,
      content,
      verses,
    };
    return await this.clinkModel.create(input);
  }

  async delete(id: string, userId: mongoose.Types.ObjectId) {
    const deletedClink = await this.clinkModel.findOneAndDelete({
      _id: id,
      ownerId: userId,
    });
    if (deletedClink != null) {
      await this.reClinksService.deleteByClinkId(id);
      return true;
    } else {
      return false;
    }
  }

  async update(
    id: string,
    userId: mongoose.Types.ObjectId,
    data: UpdateClinkDto,
  ) {
    try {
      const updatedClink = await this.clinkModel.findOneAndUpdate(
        { _id: id, ownerId: userId },
        data,
        { new: true },
      );
      return updatedClink;
    } catch (err) {
      console.log(err);
      throw new BadRequestException('크링크 수정 실패');
    }
  }

  async increaseLikeCount(id: string) {
    await this.clinkModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
      { $inc: { likeCount: 1 } },
      { new: true },
    );
    return true;
  }

  async decreaseLikeCount(id: string) {
    await this.clinkModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
      { $inc: { likeCount: -1 } },
      { new: true },
    );
  }
}
