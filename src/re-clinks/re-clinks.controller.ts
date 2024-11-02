import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ReClinksService } from './re-clinks.service';
import { CreateReClinkDto } from './dto/create-re-clink.dto';
import { UpdateReClinkDto } from './dto/update-re-clink.dto';

@Controller('re-clinks')
export class ReClinksController {
  constructor(private readonly reClinksService: ReClinksService) {}

  @Post()
  create(@Body() createReClinkDto: CreateReClinkDto) {
    return this.reClinksService.create(createReClinkDto);
  }

  @Get()
  findAll() {
    return this.reClinksService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.reClinksService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateReClinkDto: UpdateReClinkDto) {
    return this.reClinksService.update(+id, updateReClinkDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reClinksService.remove(+id);
  }
}
