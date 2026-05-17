// 정기 지출 수정 DTO. CreateExpenseDto의 모든 필드를 선택값으로 변환한다.
import { OmitType, PartialType } from "@nestjs/mapped-types"
import { IsDateString, IsOptional, ValidateIf } from "class-validator"
import { CreateExpenseDto } from "./create-expense.dto"

// endDate는 별도 정의가 필요하므로 PartialType에서 제외한다.
class UpdateExpenseBaseDto extends PartialType(
    OmitType(CreateExpenseDto, ["endDate"] as const),
) {}

export class UpdateExpenseDto extends UpdateExpenseBaseDto {
    // 종료일은 명시적 null 또는 빈 문자열로 비우기 의도를 표현할 수 있어야 한다.
    // null/빈문자열일 때는 IsDateString 검증을 건너뛴다.
    @IsOptional()
    @ValidateIf((_, value) => value !== null && value !== "")
    @IsDateString({}, { message: "종료일은 YYYY-MM-DD 형식이어야 합니다." })
    endDate?: string | null
}
