// 📄 src/units-of-measure/units-of-measure.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm'; // 👈 Asegúrate de importar esto
import { UnitsOfMeasureService } from './units-of-measure.service';
import { UnitsOfMeasureController } from './units-of-measure.controller';
import { UnidadMedida } from './entities/units-of-measure.entity'; // 👈 Y tu entidad

@Module({
  imports: [TypeOrmModule.forFeature([UnidadMedida])], // 👈 ¡ESTO ES CRUCIAL PARA LA DB!
  controllers: [UnitsOfMeasureController],
  providers: [UnitsOfMeasureService],
  exports: [UnitsOfMeasureService], // Por si necesitas usarlo en productos más adelante
})
export class UnitsOfMeasureModule {}