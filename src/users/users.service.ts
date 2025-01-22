import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './entities/user.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  create(createUserDto: CreateUserDto) {
    console.log(createUserDto);
    return 'This action adds a new user';
  }
  async createAdmin() {
    const datas: User[] = [
      {
        name: '이진희',
        nickname: '지니나무',
        age: 29,
        type: 'admin',
        info: '안녕하세요 나는 지니나무입니다',
        createdAt: new Date(),
        deletedAt: null,
        profileImg:
          'https://i.pinimg.com/236x/28/ca/1a/28ca1ae3996729d8eedec9235eb8d9a0.jpg',
      },
      {
        name: '이진희',
        nickname: '진둥이',
        age: 29,
        type: 'admin',
        info: '멍멍멍!',
        createdAt: new Date(),
        deletedAt: null,
        profileImg:
          'https://i.namu.wiki/i/wiP-b4EAaFe8dcrYKxfRSBSBzqOVI_CMPyTPj5UdQpKQyvM_Q3tamuTnofFGNGoaeMBYyn_cUoI2dXqX3jxlkg.webp',
      },
      {
        name: '송지은',
        nickname: '송피',
        age: 31,
        type: 'admin',
        info: '안녕하세요 나는 엘바페 팬이에요',
        createdAt: new Date(),
        deletedAt: null,
        profileImg:
          'https://cdn.slist.kr/news/photo/202410/591767_931973_102.jpg',
      },
      {
        name: '노승현',
        nickname: '마누라빼고다바꿔',
        age: 32,
        type: 'admin',
        info: '안녕하세요 나는 배틀바이블 1등 노갈입니다',
        createdAt: new Date(),
        deletedAt: null,
        profileImg:
          'https://i.ytimg.com/vi/62eoTsRPJwA/sddefault.jpg?v=6524dbc6',
      },
    ];
    for (let i = 0; i < datas.length; i++) {
      await this.userModel.create(datas[i]);
    }
  }

  async findAll() {
    return await this.userModel.find({});
  }

  async findByFilter(filter: Partial<User>) {
    return await this.userModel.find(filter);
  }

  async findByIdAndUpdate(id: string, filter: Partial<User>) {
    await this.userModel.findByIdAndUpdate(id, { $set: filter });
    return true;
  }

  async findOne(id: string) {
    const user = await this.userModel.findById(id);
    console.log(user);
    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  async remove(id: string) {
    console.log(id);
    const zz = await this.userModel.findByIdAndUpdate(id, {
      $set: { deletedAt: new Date(new Date().getTime() + 604800000) },
    });
    return `This action removes a #${id} user`;
  }
}
