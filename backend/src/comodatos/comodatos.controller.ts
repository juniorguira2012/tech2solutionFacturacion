import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ComodatosService } from './comodatos.service';
import { CreateComodatoDto } from './dto/create-comodato.dto';
import { UpdateComodatoDto } from './dto/update-comodato.dto';

@Controller('comodatos')
export class ComodatosController {
  constructor(private readonly comodatosService: ComodatosService) {}

  @Post()
  async create(@Body() createComodatoDto: CreateComodatoDto) {
    return await this.comodatosService.create(createComodatoDto);
  }

  @Get()
  async findAll() {
    return await this.comodatosService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.comodatosService.findOne(+id);
  }

  @Post(':id/devolver')
  async devolver(@Param('id') id: string) {
    return await this.comodatosService.devolverComodato(+id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateComodatoDto: UpdateComodatoDto,
  ) {
    return await this.comodatosService.update(+id, updateComodatoDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.comodatosService.remove(+id);
  }
}
