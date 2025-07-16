import { Injectable } from '@nestjs/common';
import { CreateMagazineDto } from './dto/create-magazine.dto';
import { UpdateMagazineDto } from './dto/update-magazine.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Magazine } from './entities/magazine.entity';
import { Model, Types } from 'mongoose';

@Injectable()
export class MagazinesService {
  constructor(
    @InjectModel(Magazine.name)
    private magazineModel: Model<Magazine>,
  ) {}

  async increaseLikeCount(id: string) {
    await this.magazineModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
      { $inc: { likeCount: 1 } },
      { new: true },
    );
  }
  async decreaseLikeCount(id: string) {
    await this.magazineModel.findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
      { $inc: { likeCount: -1 } },
      { new: true },
    );
  }
}
