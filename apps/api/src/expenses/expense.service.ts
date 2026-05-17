// 정기 지출 마스터 CRUD와 occurrence 동기화를 담당한다.
import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { CreateExpenseDto } from "./dto/create-expense.dto"
import { UpdateExpenseDto } from "./dto/update-expense.dto"
import { Recurrence } from "../common/recurrence.types"
import { parseIsoDate } from "../common/dates"
import { computeDueDates } from "./recurrence"

const HORIZON_MONTHS = 12

function todayUtc(now: Date = new Date()): Date {
    return new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    )
}

// 반복 규칙별 필수 필드와 범위를 검증한다. PATCH로 일부만 수정해 우회되는 것을 막는다.
function validateRecurrenceRule(rule: {
    recurrence: Recurrence
    dayOfMonth: number | null
    dayOfWeek: number | null
    monthOfYear: number | null
}) {
    if (rule.recurrence === "MONTHLY") {
        if (rule.dayOfMonth === null || rule.dayOfMonth === undefined) {
            throw new BadRequestException(
                "매월 반복은 결제일(dayOfMonth)이 필요합니다.",
            )
        }
        if (rule.dayOfMonth < 1 || rule.dayOfMonth > 31) {
            throw new BadRequestException(
                "결제일은 1~31 사이의 정수여야 합니다.",
            )
        }
    } else if (rule.recurrence === "WEEKLY") {
        if (rule.dayOfWeek === null || rule.dayOfWeek === undefined) {
            throw new BadRequestException(
                "매주 반복은 요일(dayOfWeek)이 필요합니다.",
            )
        }
        if (rule.dayOfWeek < 0 || rule.dayOfWeek > 6) {
            throw new BadRequestException("요일은 0(일)~6(토) 사이여야 합니다.")
        }
    } else if (rule.recurrence === "YEARLY") {
        if (rule.dayOfMonth === null || rule.dayOfMonth === undefined) {
            throw new BadRequestException(
                "매년 반복은 결제일(dayOfMonth)이 필요합니다.",
            )
        }
        if (rule.dayOfMonth < 1 || rule.dayOfMonth > 31) {
            throw new BadRequestException(
                "결제일은 1~31 사이의 정수여야 합니다.",
            )
        }
        if (rule.monthOfYear === null || rule.monthOfYear === undefined) {
            throw new BadRequestException(
                "매년 반복은 월(monthOfYear)이 필요합니다.",
            )
        }
        if (rule.monthOfYear < 1 || rule.monthOfYear > 12) {
            throw new BadRequestException("월은 1~12 사이여야 합니다.")
        }
    }
}

@Injectable()
export class ExpenseService {
    constructor(private readonly prisma: PrismaService) {}

    async list() {
        return this.prisma.recurringExpense.findMany({
            where: { isActive: true },
            orderBy: { createdAt: "desc" },
        })
    }

    async findById(id: string) {
        const expense = await this.prisma.recurringExpense.findUnique({
            where: { id },
        })
        if (!expense) {
            throw new NotFoundException("해당 정기 지출을 찾을 수 없습니다.")
        }
        return expense
    }

    async create(dto: CreateExpenseDto) {
        const startDate = parseIsoDate(dto.startDate)
        const endDate = dto.endDate ? parseIsoDate(dto.endDate) : null
        if (endDate && endDate < startDate) {
            throw new BadRequestException(
                "종료일은 시작일과 같거나 그 이후여야 합니다.",
            )
        }

        validateRecurrenceRule({
            recurrence: dto.recurrence as Recurrence,
            dayOfMonth: dto.dayOfMonth ?? null,
            dayOfWeek: dto.dayOfWeek ?? null,
            monthOfYear: dto.monthOfYear ?? null,
        })

        return this.prisma.$transaction(async (tx) => {
            const expense = await tx.recurringExpense.create({
                data: {
                    name: dto.name,
                    category: dto.category,
                    amount: dto.amount,
                    currency: dto.currency ?? "KRW",
                    recurrence: dto.recurrence,
                    dayOfMonth: dto.dayOfMonth ?? null,
                    dayOfWeek: dto.dayOfWeek ?? null,
                    monthOfYear: dto.monthOfYear ?? null,
                    startDate,
                    endDate,
                    paymentMethod: dto.paymentMethod ?? null,
                    memo: dto.memo ?? null,
                    isActive: dto.isActive ?? true,
                },
            })

            const dueDates = computeDueDates({
                start: startDate,
                end: endDate,
                rule: {
                    recurrence: dto.recurrence as Recurrence,
                    dayOfMonth: dto.dayOfMonth ?? null,
                    dayOfWeek: dto.dayOfWeek ?? null,
                    monthOfYear: dto.monthOfYear ?? null,
                },
                horizonMonths: HORIZON_MONTHS,
            })

            if (dueDates.length > 0) {
                await tx.expenseOccurrence.createMany({
                    data: dueDates.map((dueDate) => ({
                        expenseId: expense.id,
                        dueDate,
                        expectedAmount: dto.amount,
                        status: "SCHEDULED",
                    })),
                })
            }

            return expense
        })
    }

    async update(id: string, dto: UpdateExpenseDto) {
        const existing = await this.findById(id)

        const startDate = dto.startDate
            ? parseIsoDate(dto.startDate)
            : existing.startDate
        // endDate 비우기 의도는 명시적 null 또는 빈 문자열로 전달한다.
        const endDate =
            dto.endDate === null || dto.endDate === ""
                ? null
                : dto.endDate
                  ? parseIsoDate(dto.endDate)
                  : existing.endDate
        if (endDate && endDate < startDate) {
            throw new BadRequestException(
                "종료일은 시작일과 같거나 그 이후여야 합니다.",
            )
        }

        const merged = {
            name: dto.name ?? existing.name,
            category: dto.category ?? existing.category,
            amount: dto.amount ?? existing.amount,
            currency: dto.currency ?? existing.currency,
            recurrence: (dto.recurrence ?? existing.recurrence) as Recurrence,
            dayOfMonth: dto.dayOfMonth ?? existing.dayOfMonth,
            dayOfWeek: dto.dayOfWeek ?? existing.dayOfWeek,
            monthOfYear: dto.monthOfYear ?? existing.monthOfYear,
            startDate,
            endDate,
            paymentMethod: dto.paymentMethod ?? existing.paymentMethod,
            memo: dto.memo ?? existing.memo,
            isActive: dto.isActive ?? existing.isActive,
        }

        validateRecurrenceRule({
            recurrence: merged.recurrence,
            dayOfMonth: merged.dayOfMonth,
            dayOfWeek: merged.dayOfWeek,
            monthOfYear: merged.monthOfYear,
        })

        return this.prisma.$transaction(async (tx) => {
            const expense = await tx.recurringExpense.update({
                where: { id },
                data: merged,
            })

            const today = todayUtc()

            await tx.expenseOccurrence.deleteMany({
                where: {
                    expenseId: id,
                    status: "SCHEDULED",
                    dueDate: { gte: today },
                },
            })

            if (expense.isActive) {
                const dueDates = computeDueDates({
                    start: merged.startDate,
                    end: merged.endDate,
                    rule: {
                        recurrence: merged.recurrence,
                        dayOfMonth: merged.dayOfMonth,
                        dayOfWeek: merged.dayOfWeek,
                        monthOfYear: merged.monthOfYear,
                    },
                    horizonMonths: HORIZON_MONTHS,
                })

                const futureDates = dueDates.filter((d) => d >= today)

                if (futureDates.length > 0) {
                    await tx.expenseOccurrence.createMany({
                        data: futureDates.map((dueDate) => ({
                            expenseId: id,
                            dueDate,
                            expectedAmount: merged.amount,
                            status: "SCHEDULED",
                        })),
                    })
                }
            }

            return expense
        })
    }

    async remove(id: string) {
        await this.findById(id)
        const today = todayUtc()

        return this.prisma.$transaction(async (tx) => {
            await tx.expenseOccurrence.deleteMany({
                where: {
                    expenseId: id,
                    status: "SCHEDULED",
                    dueDate: { gte: today },
                },
            })

            return tx.recurringExpense.update({
                where: { id },
                data: { isActive: false },
            })
        })
    }
}
