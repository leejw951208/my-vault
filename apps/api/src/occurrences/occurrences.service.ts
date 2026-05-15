// 결제 예정 인스턴스 조회와 상태 변경 로직.
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { parseIsoDate } from '../common/dates';
import { ListOccurrencesDto } from './dto/list-occurrences.dto';
import { UpdateOccurrenceDto } from './dto/update-occurrence.dto';

@Injectable()
export class OccurrencesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: ListOccurrencesDto) {
    const where: Record<string, unknown> = {};

    if (query.from || query.to) {
      const range: Record<string, Date> = {};
      if (query.from) range.gte = parseIsoDate(query.from);
      if (query.to) range.lte = parseIsoDate(query.to);
      where.dueDate = range;
    }

    if (query.status) {
      where.status = query.status;
    }

    if (query.category || query.paymentMethod) {
      where.expense = {
        ...(query.category ? { category: query.category } : {}),
        ...(query.paymentMethod ? { paymentMethod: query.paymentMethod } : {})
      };
    }

    return this.prisma.expenseOccurrence.findMany({
      where,
      orderBy: { dueDate: 'asc' },
      include: { expense: true }
    });
  }

  async findById(id: string) {
    const occurrence = await this.prisma.expenseOccurrence.findUnique({
      where: { id },
      include: { expense: true }
    });
    if (!occurrence) {
      throw new NotFoundException('해당 결제 인스턴스를 찾을 수 없습니다.');
    }
    return occurrence;
  }

  async update(id: string, dto: UpdateOccurrenceDto) {
    const existing = await this.findById(id);

    const data: Record<string, unknown> = {
      status: dto.status
    };

    // dto.memo가 undefined면 기존 값을 유지한다(키 자체를 생략).
    // null이 명시적으로 들어오면 비우기 의도이므로 null로 저장한다.
    if (dto.memo !== undefined) {
      data.memo = dto.memo;
    }

    if (dto.status === 'PAID') {
      // 실제 금액 미입력 시 예상 금액으로 폴백한다.
      data.actualAmount = dto.actualAmount ?? existing.expectedAmount;
      data.paidAt = new Date();
    } else {
      data.actualAmount = null;
      data.paidAt = null;
    }

    return this.prisma.expenseOccurrence.update({
      where: { id },
      data,
      include: { expense: true }
    });
  }
}
