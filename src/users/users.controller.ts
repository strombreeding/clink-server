import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  @Put()
  async createAdminUsers() {
    return await this.usersService.createAdmin();
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  @Get('/filter')
  async findByFilter(@Query() query: Partial<User>) {
    return await this.usersService.findByFilter(query);
  }

  @Patch()
  async userUpdate(
    @Body() body: { userId: string; updateData: Partial<User> },
  ) {
    await this.usersService.findByIdAndUpdate(body.userId, body.updateData);
    return true;
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    console.log(id);
    return await this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  async removeSoft(@Param('id') id: string) {
    console.log(id);
    return await this.usersService.remove(id);
  }
}
