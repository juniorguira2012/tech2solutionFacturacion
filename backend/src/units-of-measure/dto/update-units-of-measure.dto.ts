// 📄 src/units-of-measure/dto/update-units-of-measure.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateUnitsOfMeasureDto } from './create-units-of-measure.dto';

export class UpdateUnitsOfMeasureDto extends PartialType(CreateUnitsOfMeasureDto) {}