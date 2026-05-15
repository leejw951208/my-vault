// 합계 조회 쿼리 DTO.
import { IsDateString } from 'class-validator';

export class SummaryQueryDto {
  @IsDateString({}, { message: 'from은 YYYY-MM-DD 형식이어야 합니다.' })
  from!: string;

  @IsDateString({}, { message: 'to는 YYYY-MM-DD 형식이어야 합니다.' })
  to!: string;
}
