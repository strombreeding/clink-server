import { PartialType } from '@nestjs/mapped-types';
import { CreateClinkDto } from './create-clink.dto';

export class UpdateClinkDto extends PartialType(CreateClinkDto) {}
