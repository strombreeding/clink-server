import { Injectable } from '@nestjs/common';
import { CreateReClinkDto } from './dto/create-re-clink.dto';
import { UpdateReClinkDto } from './dto/update-re-clink.dto';

@Injectable()
export class ReClinksService {
  create(createReClinkDto: CreateReClinkDto) {
    return 'This action adds a new reClink';
  }

  findAll() {
    return `This action returns all reClinks`;
  }

  findOne(id: number) {
    return `This action returns a #${id} reClink`;
  }

  update(id: number, updateReClinkDto: UpdateReClinkDto) {
    return `This action updates a #${id} reClink`;
  }

  remove(id: number) {
    return `This action removes a #${id} reClink`;
  }
}
