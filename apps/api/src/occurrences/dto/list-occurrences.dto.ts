// 결제 예정 인스턴스 목록 조회 쿼리 DTO.
import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';
import { OccurrenceStatusValues } from '../../common/recurrence.types';

export class ListOccurrencesDto {
  @IsOptional()
  @IsDateString({}, { message: 'from은 YYYY-MM-DD 형식이어야 합니다.' })
  from?: string;

  @IsOptional()
  @IsDateString({}, { message: 'to는 YYYY-MM-DD 형식이어야 합니다.' })
  to?: string;

  @IsOptional()
  @IsIn(OccurrenceStatusValues as unknown as string[], {
    message: '상태는 SCHEDULED/PAID/SKIPPED 중 하나여야 합니다.'
  })
  status?: 'SCHEDULED' | 'PAID' | 'SKIPPED';

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
