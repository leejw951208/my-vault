// YYYY-MM-DD 문자열을 UTC 자정 Date로 변환하는 공통 헬퍼.
import { BadRequestException } from "@nestjs/common"

export function parseIsoDate(value: string): Date {
    const [yearStr, monthStr, dayStr] = value.split("T")[0]!.split("-")
    const year = Number(yearStr)
    const month = Number(monthStr)
    const day = Number(dayStr)
    if (
        !Number.isFinite(year) ||
        !Number.isFinite(month) ||
        !Number.isFinite(day)
    ) {
        throw new BadRequestException("날짜 형식이 올바르지 않습니다.")
    }
    if (month < 1 || month > 12) {
        throw new BadRequestException("월은 1~12 사이여야 합니다.")
    }
    if (day < 1 || day > 31) {
        throw new BadRequestException("일은 1~31 사이여야 합니다.")
    }
    return new Date(Date.UTC(year, month - 1, day))
}
