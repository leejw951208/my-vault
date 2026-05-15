// 결제 예정 인스턴스 HTTP 엔드포인트.
import { Body, Controller, Get, Param, Patch, Query } from '@nestjs/common';
import { OccurrencesService } from './occurrences.service';
import { ListOccurrencesDto } from './dto/list-occurrences.dto';
import { UpdateOccurrenceDto } from './dto/update-occurrence.dto';

@Controller('occurrences')
export class OccurrencesController {
  constructor(private readonly service: OccurrencesService) {}

  @Get()
  list(@Query() query: ListOccurrencesDto) {
    return this.service.list(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateOccurrenceDto) {
    return this.service.update(id, dto);
  }
}
