import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ClinksService } from './clinks.service';
import { CreateClinkDto } from './dto/create-clink.dto';
import { UpdateClinkDto } from './dto/update-clink.dto';

@Controller('clinks')
export class ClinksController {
  constructor(private readonly clinksService: ClinksService) {}

  @Post()
  create(@Body() createClinkDto: CreateClinkDto) {
    return this.clinksService.create(createClinkDto);
  }

  @Get()
  findAll() {
    return this.clinksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.clinksService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClinkDto: UpdateClinkDto) {
    return this.clinksService.update(+id, updateClinkDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.clinksService.remove(+id);
  }
}
