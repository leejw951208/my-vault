// 정기 지출 생성 요청 DTO와 검증 규칙.
import {
    IsBoolean,
    IsDateString,
    IsIn,
    IsInt,
    IsOptional,
    IsString,
    Max,
    MaxLength,
    Min,
    ValidateIf,
} from "class-validator"
import { RecurrenceValues } from "../../common/recurrence.types"

export class CreateExpenseDto {
    @IsString({ message: "이름은 문자열이어야 합니다." })
    @MaxLength(80, { message: "이름은 80자 이하여야 합니다." })
    name!: string

    @IsString({ message: "카테고리는 문자열이어야 합니다." })
    @MaxLength(40, { message: "카테고리는 40자 이하여야 합니다." })
    category!: string

    @IsInt({ message: "금액은 정수여야 합니다." })
    @Min(0, { message: "금액은 0 이상이어야 합니다." })
    amount!: number

    @IsOptional()
    @IsString({ message: "통화는 문자열이어야 합니다." })
    @MaxLength(8)
    currency?: string

    @IsIn(RecurrenceValues as unknown as string[], {
        message: "반복 주기는 MONTHLY/WEEKLY/YEARLY 중 하나여야 합니다.",
    })
    recurrence!: "MONTHLY" | "WEEKLY" | "YEARLY"

    @ValidateIf((o) => o.recurrence === "MONTHLY" || o.recurrence === "YEARLY")
    @IsInt({ message: "결제일은 1~31 사이의 정수여야 합니다." })
    @Min(1)
    @Max(31)
    dayOfMonth?: number

    @ValidateIf((o) => o.recurrence === "WEEKLY")
    @IsInt({ message: "요일은 0(일)~6(토) 사이여야 합니다." })
    @Min(0)
    @Max(6)
    dayOfWeek?: number

    @ValidateIf((o) => o.recurrence === "YEARLY")
    @IsInt({ message: "월은 1~12 사이여야 합니다." })
    @Min(1)
    @Max(12)
    monthOfYear?: number

    @IsDateString({}, { message: "시작일은 YYYY-MM-DD 형식이어야 합니다." })
    startDate!: string

    @IsOptional()
    @IsDateString({}, { message: "종료일은 YYYY-MM-DD 형식이어야 합니다." })
    endDate?: string

    @IsOptional()
    @IsString()
    @MaxLength(40)
    paymentMethod?: string

    @IsOptional()
    @IsString()
    @MaxLength(200)
    memo?: string

    @IsOptional()
    @IsBoolean()
    isActive?: boolean
}
