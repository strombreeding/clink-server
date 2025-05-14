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
  async create(
    userId: string,
    bibleList: string[],
    filePath: string[],
    content: string,
  ) {
    const input = {
      userId: new mongoose.Types.ObjectId(userId),
      bibleList,
      filePath,
      content,
    };
    await this.clinkModel.create(input);
  }

  async findAllClinks() {
    const result = await this.clinkModel.find({}).populate('userState').exec();
    return result;
  }
}
