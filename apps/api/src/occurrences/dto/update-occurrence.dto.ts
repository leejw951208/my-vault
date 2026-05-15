// 결제 예정 인스턴스 처리 DTO. 완료/스킵/되돌리기를 한 엔드포인트에서 받는다.
import { IsIn, IsInt, IsOptional, IsString, MaxLength, Min, ValidateIf } from 'class-validator';
import { OccurrenceStatusValues } from '../../common/recurrence.types';

export class UpdateOccurrenceDto {
  @IsIn(OccurrenceStatusValues as unknown as string[], {
    message: '상태는 SCHEDULED/PAID/SKIPPED 중 하나여야 합니다.'
  })
  status!: 'SCHEDULED' | 'PAID' | 'SKIPPED';

  @IsOptional()
  @IsInt({ message: '실제 금액은 정수여야 합니다.' })
  @Min(0)
  actualAmount?: number;

  // null은 메모를 명시적으로 비우려는 의도. 미전달(undefined)은 기존 메모 유지.
  @ValidateIf((_, value) => value !== null)
  @IsOptional()
  @IsString()
  @MaxLength(200)
  memo?: string | null;
}
