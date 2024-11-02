import { PartialType } from '@nestjs/mapped-types';
import { CreateReClinkDto } from './create-re-clink.dto';

export class UpdateReClinkDto extends PartialType(CreateReClinkDto) {}
