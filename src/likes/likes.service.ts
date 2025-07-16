import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Like } from './entities/like.entity';
import mongoose, { Model } from 'mongoose';
import { ReClinksService } from 'src/re-clinks/re-clinks.service';
import { ClinksService } from 'src/clinks/clinks.service';
import { MagazinesService } from 'src/magazines/magazines.service';

@Injectable()
export class LikesService {
  constructor(
    @InjectModel(Like.name)
    private likeModel: Model<Like>,

    private readonly reClinksService: ReClinksService,
    private readonly clinksService: ClinksService,
    private readonly magazinesService: MagazinesService,
  ) {}

  async createLike(createLikeDto: CreateLikeDto) {
    const { ownerId, clinkId, reclinkId, magazineId, reclinkCommentId } =
      createLikeDto;
    console.log(createLikeDto, 'createLikeDto');

    // 조건 필터 구성
    const filter: any = {
      ownerId,
      ...(reclinkId && { reclinkId }),
      ...(reclinkCommentId && { reclinkCommentId }),
      ...(clinkId && { clinkId }),
      ...(magazineId && { magazineId }),
    };

    console.log(filter, '시발');
    // like 생성 또는 중복 확인
    const result = await this.likeModel.findOneAndUpdate(
      filter,
      {
        $setOnInsert: createLikeDto, // insert 시에만 적용
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    // 이미 좋아요가 존재했던 경우 (upsert=false는 없으므로 이렇게 체크)
    const alreadyLiked = await this.likeModel.findOne(filter);
    if (
      alreadyLiked &&
      alreadyLiked.createdAt.getTime() !== result.createdAt.getTime()
    ) {
      throw new BadRequestException('이미 좋아요를 눌렀습니다.');
    }

    // 좋아요 수 증가 로직
    await this.switchType('increase', createLikeDto.type, createLikeDto);

    return result;
  }

  async delete(data: UpdateLikeDto) {
    const result = await this.likeModel.findOneAndDelete(data);
    if (!result) {
      throw new BadRequestException('좋아요를 누르지 않았습니다.');
    }
    await this.switchType('decrease', data.type, data);
    return result;
  }

  async deleteReclinkLike(reclinkId: string) {
    await this.likeModel.deleteMany({
      reclinkId,
      type: 'reclink',
    });
  }

  async deleteClinkLike(clinkId: string) {
    await this.likeModel.deleteMany({
      clinkId,
      type: 'clink',
    });
  }

  async switchType(
    action: 'increase' | 'decrease',
    type: 'clink' | 'reclink' | 'magazine',
    data: UpdateLikeDto,
  ) {
    switch (type) {
      case 'clink':
        return action === 'increase'
          ? await this.clinksService.increaseLikeCount(data.clinkId)
          : await this.clinksService.decreaseLikeCount(data.clinkId);
      case 'reclink':
        return action === 'increase'
          ? await this.reClinksService.increaseLikeCount(data.reclinkId)
          : await this.reClinksService.decreaseLikeCount(data.reclinkId);
      case 'magazine':
        return action === 'increase'
          ? await this.magazinesService.increaseLikeCount(data.magazineId)
          : await this.magazinesService.decreaseLikeCount(data.magazineId);
      default:
        throw new BadRequestException('잘못된 타입입니다.');
    }
  }
}
