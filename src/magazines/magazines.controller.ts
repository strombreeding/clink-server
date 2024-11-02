import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MagazinesService } from './magazines.service';
import { CreateMagazineDto } from './dto/create-magazine.dto';
import { UpdateMagazineDto } from './dto/update-magazine.dto';

@Controller('magazines')
export class MagazinesController {
  constructor(private readonly magazinesService: MagazinesService) {}

  @Post()
  create(@Body() createMagazineDto: CreateMagazineDto) {
    return this.magazinesService.create(createMagazineDto);
  }

  @Get()
  findAll() {
    return this.magazinesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.magazinesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMagazineDto: UpdateMagazineDto) {
    return this.magazinesService.update(+id, updateMagazineDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.magazinesService.remove(+id);
  }
}
