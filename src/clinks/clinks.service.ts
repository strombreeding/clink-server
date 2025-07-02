import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Clink } from './entities/clink.entity';
import mongoose, { Model } from 'mongoose';

@Injectable()
export class ClinksService {
  constructor(
    @InjectModel(Clink.name)
    private clinkModel: Model<Clink>,
  ) {}
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
