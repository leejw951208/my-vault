// CSV 내보내기 쿼리 DTO. from/to 기간 검증을 담당한다.
import { IsDateString } from 'class-validator';

export class ExportQueryDto {
  @IsDateString({}, { message: 'from은 YYYY-MM-DD 형식이어야 합니다.' })
  from!: string;

  @IsDateString({}, { message: 'to는 YYYY-MM-DD 형식이어야 합니다.' })
  to!: string;
}
