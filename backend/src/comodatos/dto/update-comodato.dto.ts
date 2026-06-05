import { PartialType } from '@nestjs/mapped-types';
import { CreateComodatoDto } from './create-comodato.dto';

export class UpdateComodatoDto extends PartialType(CreateComodatoDto) {}
