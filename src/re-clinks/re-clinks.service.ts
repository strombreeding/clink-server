import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateReClinkDto } from './dto/create-re-clink.dto';
import { UpdateReClinkDto } from './dto/update-re-clink.dto';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model, Types } from 'mongoose';
import { ReClink } from './entities/re-clink.entity';
import { UsersService } from 'src/users/users.service';
import { Like } from 'src/likes/entities/like.entity';
import { ClinksService } from 'src/clinks/clinks.service';
import { Clink } from 'src/clinks/entities/clink.entity';
import { LikesService } from 'src/likes/likes.service';

@Injectable()
export class ReClinksService {
  constructor(
    @InjectModel(ReClink.name) private reClinkModel: Model<ReClink>,
    @InjectModel(Clink.name) private clinkModel: Model<Clink>,
    @InjectModel(Like.name) private likeModel: Model<Like>,
    private readonly usersService: UsersService,
  ) {}

  async create(data: CreateReClinkDto) {
    const newReClink = await this.reClinkModel.create({
      ...data,
    });

    switch (data.type) {
      case 'RE_CLINK':
        await this.clinkModel.findOneAndUpdate(
          { _id: new Types.ObjectId(data.clinkId) },
          { $inc: { commentCount: 1 } },
          { new: true },
        );
        break;
      case 'RE_CLINK_COMMENT':
        await this.reClinkModel.findOneAndUpdate(
          { _id: new Types.ObjectId(data.parentId) },
          { $inc: { commentCount: 1 } },
          { new: true },
        );
    }

    return newReClink;
  }

  // - 부모 크링크 삭제시 모든 자녀 리크링크, 리리크링크 삭제
  async deleteByClinkId(clinkId: string) {
    await this.reClinkModel.deleteMany({
      clinkId: new Types.ObjectId(clinkId),
    });
    // @ 라이크 삭제
    await this.likeModel.deleteMany({
      clinkId,
    });
  }

  // - 크링크 조회시 리크링크 조회.
  async getReClinkByClinkId(clinkId: string, userId: string) {
    console.log(userId, 'userId???!@#!@#');
    const reclinks = await this.reClinkModel.aggregate([
      { $match: { clinkId: new Types.ObjectId(clinkId) } },
      { $sort: { createdAt: 1 } },
      {
        $lookup: {
          from: 'likes',
          let: { reclinkId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$reclinkId', '$$reclinkId'] },
                    { $eq: ['$ownerId', new Types.ObjectId(userId)] },
                    { $eq: ['$type', 'reclink'] },
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
      {
        $lookup: {
          from: 'users',
          localField: 'ownerId',
          foreignField: '_id',
          as: 'userDetail',
        },
      },

      // 댓글에 포함될 대댓글 붙이기
      {
        $lookup: {
          from: 'reclinks', // 자기 자신과 조인
          localField: '_id',
          foreignField: 'parentId',
          as: 'reclinkComments',
        },
      },

      // 댓글만 필터링 (type: 'comment')
      {
        $match: { type: 'RE_CLINK' },
      },

      {
        $project: {
          _id: 1,
          type: 1,
          ownerId: 1,
          verses: 1,
          imgList: 1,
          content: 1,
          likeCount: 1,
          commentCount: 1,
          isLiked: 1,
          createdAt: 1,
          updatedAt: 1,
          userDetail: {
            _id: 1,
            nickname: 1,
            profileImg: 1,
          },
          reclinkComments: {
            type: 1,
            ownerId: 1,
            verses: 1,
            imgList: 1,
            _id: 1,
            content: 1,
            createdAt: 1,
            likeCount: 1,
            updatedAt: 1,
          },
        },
      },
    ]);
    const result = await this.mappingUserDetail(reclinks, userId);
    return result;
  }

  async update(id: string, data: UpdateReClinkDto) {
    try {
      const updatedReClink = await this.reClinkModel.findOneAndUpdate(
        { _id: new Types.ObjectId(id) },
        data,
        { new: true },
      );
      return updatedReClink;
    } catch (err) {
      console.log(err);
      throw new BadRequestException('리크링크 수정 실패');
    }
  }

  async delete(data: CreateReClinkDto) {
    if (data.type === 'RE_CLINK') {
      const deletedReClink = await this.reClinkModel.findOneAndDelete({
        clinkId: new Types.ObjectId(data.clinkId),
        ownerId: new Types.ObjectId(data.ownerId),
        reclinkId: new Types.ObjectId(data.clinkId),
        type: 'RE_CLINK',
      });
      // @ 삭제된 리크링크의 댓글들 모두 삭제
      await this.reClinkModel.deleteMany({
        clinkId: new Types.ObjectId(data.clinkId),
        parentId: new Types.ObjectId(deletedReClink._id),
        type: 'RE_CLINK_COMMENT',
      });
      // @ 삭제된 리크링크의 좋아요 모두 삭제
      await this.likeModel.deleteMany({
        clinkId: new Types.ObjectId(data.clinkId),
        reclinkId: deletedReClink._id,
        type: 'reclink',
      });
      // @ 삭제된 리크링크의 댓글들 좋아요 모두 삭제
      await this.likeModel.deleteMany({
        clinkId: new Types.ObjectId(data.clinkId),
        reclinkId: deletedReClink._id,
        type: 'reclink',
      });
    } else {
      const deletedReClinkComment = await this.reClinkModel.findOneAndDelete({
        parentId: new Types.ObjectId(data.parentId),
        ownerId: new Types.ObjectId(data.ownerId),
        clinkId: new Types.ObjectId(data.clinkId),
        type: 'RE_CLINK_COMMENT',
      });
    }
    const deletedReClink = await this.reClinkModel.findOneAndDelete({
      _id: new Types.ObjectId(
        data.type === 'RE_CLINK' ? data.clinkId : data.parentId,
      ),
      ownerId: new Types.ObjectId(data.ownerId),
    });
    if (deletedReClink != null) {
      await this.switchType('decrease', data);
      if (data.type === 'RE_CLINK') {
        await this.reClinkModel.deleteMany({ parentId: data.parentId });
      }
      await this.likeModel.deleteMany({
        reclinkId: deletedReClink._id,
        type: 'reclink',
      });
      return true;
    } else {
      return false;
    }
  }

  async increaseLikeCount(id: string) {
    await this.reClinkModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
      { $inc: { likeCount: 1 } },
      { new: true },
    );
    return true;
  }

  async decreaseLikeCount(id: string) {
    await this.reClinkModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
      { $inc: { likeCount: -1 } },
      { new: true },
    );
    return true;
  }

  async mappingUserDetail(reclinks: any, userId: string) {
    const allReplyOwnerIds = reclinks
      .flatMap((comment) => comment.reclinkComments)
      .map((reply) => reply.ownerId?.toString())
      .filter(Boolean);

    const uniqueOwnerIds = [...new Set(allReplyOwnerIds)].map(
      (_id: string) => new Types.ObjectId(_id),
    );

    // 3. userService 통해 유저 정보 조회
    const users = await this.usersService.findAllByIds(uniqueOwnerIds);

    const userMap = new Map(users.map((user) => [user._id.toString(), user]));

    // 4. 대댓글에 userDetail 붙이기
    for (let i = 0; i < reclinks.length; i++) {
      const comment = reclinks[i];
      if (comment.reclinkComments.length > 0) {
        for (let a = 0; a < comment.reclinkComments.length; a++) {
          const existLike = await this.likeModel.findOne({
            reclinkId: comment.reclinkComments[a]._id,
            type: 'reclink',
            ownerId: new Types.ObjectId(userId),
          });
          if (existLike) {
            comment.reclinkComments[a].isLiked = true;
          } else {
            comment.reclinkComments[a].isLiked = false;
          }

          comment.reclinkComments[a].userDetail = [
            userMap.get(comment.reclinkComments[a].ownerId?.toString()),
          ];
        }
      }
    }
    return reclinks;
  }

  async switchType(action: 'increase' | 'decrease', data: CreateReClinkDto) {
    switch (data.type) {
      case 'RE_CLINK':
        await this.clinkModel.findOneAndUpdate(
          { _id: new Types.ObjectId(data.clinkId) },
          { $inc: { commentCount: action === 'increase' ? 1 : -1 } },
          { new: true },
        );
        break;
      case 'RE_CLINK_COMMENT':
        await this.reClinkModel.findOneAndUpdate(
          { _id: new Types.ObjectId(data.parentId) },
          { $inc: { commentCount: action === 'increase' ? 1 : -1 } },
          { new: true },
        );
        break;
    }
  }
}
