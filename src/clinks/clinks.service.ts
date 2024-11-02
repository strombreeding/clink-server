import { Injectable } from '@nestjs/common';
import { CreateClinkDto } from './dto/create-clink.dto';
import { UpdateClinkDto } from './dto/update-clink.dto';

@Injectable()
export class ClinksService {
  create(createClinkDto: CreateClinkDto) {
    return 'This action adds a new clink';
  }

  findAll() {
    return `This action returns all clinks`;
  }

  findOne(id: number) {
    return `This action returns a #${id} clink`;
  }

  update(id: number, updateClinkDto: UpdateClinkDto) {
    return `This action updates a #${id} clink`;
  }

  remove(id: number) {
    return `This action removes a #${id} clink`;
  }
}
