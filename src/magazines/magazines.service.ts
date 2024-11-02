import { Injectable } from '@nestjs/common';
import { CreateMagazineDto } from './dto/create-magazine.dto';
import { UpdateMagazineDto } from './dto/update-magazine.dto';

@Injectable()
export class MagazinesService {
  create(createMagazineDto: CreateMagazineDto) {
    return 'This action adds a new magazine';
  }

  findAll() {
    return `This action returns all magazines`;
  }

  findOne(id: number) {
    return `This action returns a #${id} magazine`;
  }

  update(id: number, updateMagazineDto: UpdateMagazineDto) {
    return `This action updates a #${id} magazine`;
  }

  remove(id: number) {
    return `This action removes a #${id} magazine`;
  }
}
