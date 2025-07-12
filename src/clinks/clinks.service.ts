import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Clink } from './entities/clink.entity';
import mongoose, { Model, Types } from 'mongoose';
import { getMockList } from 'data';

@Injectable()
export class ClinksService {
  constructor(
    @InjectModel(Clink.name)
    private clinkModel: Model<Clink>,
  ) {}

  async createMockClinks() {
    const clinkData = getMockList();
    for (let i = 0; i < clinkData.length; i++) {
      await this.clinkModel.create(clinkData[i]);
    }
    return 'success';
  }

  // async getClinkPaginationByCursor(
  //   limit = 20,
  //   cursor?: {
  //     adjustedScore: number;
  //     createdAt: string;
  //     _id: string;
  //   },
  // ) {
  //   const today = new Date();
  //   today.setHours(0, 0, 0, 0); // 오늘 00시 기준

  //   const pipeline: any[] = [
  //     {
  //       $addFields: {
  //         daysAgo: {
  //           $floor: {
  //             $divide: [
  //               { $subtract: [today, '$createdAt'] },
  //               1000 * 60 * 60 * 24,
  //             ],
  //           },
  //         },
  //       },
  //     },
  //     {
  //       $addFields: {
  //         adjustedScore: {
  //           $cond: [
  //             { $gt: ['$daysAgo', 7] },
  //             { $multiply: ['$totalScore', 0.0001] }, // 7일 초과는 강한 페널티
  //             {
  //               $cond: [
  //                 { $gt: ['$totalScore', 0] },
  //                 '$totalScore', // 점수 있음 → 그대로 사용
  //                 2, // 점수 없음 → 최소 1점 보정
  //               ],
  //             },
  //           ],
  //         },
  //       },
  //     },
  //   ];

  //   if (cursor) {
  //     pipeline.push({
  //       $match: {
  //         $or: [
  //           { adjustedScore: { $lt: cursor.adjustedScore } },
  //           {
  //             adjustedScore: cursor.adjustedScore,
  //             createdAt: { $lt: new Date(cursor.createdAt) },
  //           },
  //           {
  //             adjustedScore: cursor.adjustedScore,
  //             createdAt: new Date(cursor.createdAt),
  //             _id: { $lt: new Types.ObjectId(cursor._id) },
  //           },
  //         ],
  //       },
  //     });
  //   }

  //   pipeline.push(
  //     {
  //       $sort: {
  //         adjustedScore: -1,
  //         createdAt: -1,
  //         _id: -1,
  //       },
  //     },
  //     {
  //       $limit: limit,
  //     },
  //   );

  //   const clinks = await this.clinkModel.aggregate(pipeline);

  //   const nextCursor =
  //     clinks.length > 0
  //       ? {
  //           adjustedScore: clinks[clinks.length - 1].adjustedScore,
  //           createdAt: clinks[clinks.length - 1].createdAt,
  //           _id: clinks[clinks.length - 1]._id.toString(),
  //         }
  //       : null;

  //   return {
  //     data: clinks,
  //     nextCursor,
  //   };
  // }

  async getClinkPaginationByCursor(
    limit = 20,
    cursor?: {
      adjustedScore: number;
      createdAt: string;
      _id: string;
    },
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
              { $add: [{ $multiply: ['$totalScore', 0.0001] }, '$baseScore'] },
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

    pipeline.push(
      // - sort, limit이전에 lookup 추가 (join같은것)
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

  async create(userId: string, content: string, fileList: string[]) {
    const input = {
      ownerId: userId,
      filePath: fileList,
      content,
    };
    return await this.clinkModel.create(input);
  }

  async findAllClinks() {
    const result = await this.clinkModel.find({}).populate('userState').exec();
    return result;
  }

  async findRankedFeedByCursor(
    limit: number,
    cursorScore?: number,
    cursorId?: string,
  ) {
    // 중력 상수 (이 값을 조정하여 '최신성'의 가중치를 변경할 수 있습니다)
    const GRAVITY = 1.8;

    const pipeline: any[] = [
      // --- 🚀 MVP 단계에서는 전체 데이터를 대상으로 하므로 우선 주석 처리 ---
      // --- 추후 서비스가 커지고 성능 최적화가 필요할 때 주석을 해제하세요 ---
      // {
      //   $match: {
      //     // 최근 30일 내의 문서만 대상으로 랭킹을 계산
      //     createdAt: { $gte: new Date(new Date().setDate(new Date().getDate() - 30)) }
      //   }
      // },
      // -----------------------------------------------------------

      // 1. 랭킹 점수 계산을 위한 필드 추가
      {
        $addFields: {
          points: { $add: ['$likes', '$reclinks'] },
          ageInHours: {
            $divide: [
              { $subtract: [new Date(), '$createdAt'] },
              1000 * 60 * 60,
            ],
          },
        },
      },
      {
        $addFields: {
          rankingScore: {
            $divide: [
              { $subtract: ['$points', 1] },
              {
                $pow: [{ $add: ['$ageInHours', 2] }, GRAVITY],
              },
            ],
          },
        },
      },
    ];

    // 2. 커서 기반 페이지네이션을 위한 $match 단계
    if (cursorScore !== undefined && cursorId) {
      pipeline.push({
        $match: {
          $or: [
            { rankingScore: { $lt: cursorScore } },
            {
              rankingScore: cursorScore,
              _id: { $lt: new mongoose.Types.ObjectId(cursorId) },
            },
          ],
        },
      });
    }

    // 3. 최종 정렬 및 개수 제한
    pipeline.push({ $sort: { rankingScore: -1, _id: -1 } });
    pipeline.push({ $limit: limit });

    const crinks = await this.clinkModel.aggregate(pipeline).exec();

    // 4. 다음 페이지를 위한 커서 생성
    let nextCursor = null;
    if (crinks.length > 0) {
      const lastCrink = crinks[crinks.length - 1];
      nextCursor = {
        score: lastCrink.rankingScore,
        id: lastCrink._id.toString(),
      };
    }

    return {
      data: crinks,
      nextCursor,
    };
  }
}
