// 카테고리/결제 수단/상태별 합계를 계산한다. 실제 금액이 있으면 실제, 없으면 예상 기준이다.
import { Injectable } from "@nestjs/common"
import { PrismaService } from "../prisma/prisma.service"
import { parseIsoDate } from "../common/dates"

export interface Bucket {
    key: string
    total: number
    count: number
}

@Injectable()
export class SummaryService {
    constructor(private readonly prisma: PrismaService) {}

    async summarize(from: string, to: string) {
        const occurrences = await this.prisma.expenseOccurrence.findMany({
            where: {
                dueDate: {
                    gte: parseIsoDate(from),
                    lte: parseIsoDate(to),
                },
            },
            include: { expense: true },
        })

        const byCategory = new Map<string, Bucket>()
        const byPaymentMethod = new Map<string, Bucket>()
        const byStatus = new Map<string, Bucket>()
        let total = 0
        const basisCounts = { actual: 0, expected: 0 }

        for (const occ of occurrences) {
            const amount = occ.actualAmount ?? occ.expectedAmount
            total += amount
            if (occ.actualAmount === null) {
                basisCounts.expected += 1
            } else {
                basisCounts.actual += 1
            }

            const cat = occ.expense.category || "미분류"
            const pm = occ.expense.paymentMethod || "미지정"
            const status = occ.status

            addBucket(byCategory, cat, amount)
            addBucket(byPaymentMethod, pm, amount)
            addBucket(byStatus, status, amount)
        }

        return {
            range: { from, to },
            total,
            basisCounts,
            byCategory: Array.from(byCategory.values()).sort(
                (a, b) => b.total - a.total,
            ),
            byPaymentMethod: Array.from(byPaymentMethod.values()).sort(
                (a, b) => b.total - a.total,
            ),
            byStatus: Array.from(byStatus.values()),
        }
    }
}

function addBucket(map: Map<string, Bucket>, key: string, amount: number) {
    const existing = map.get(key)
    if (existing) {
        existing.total += amount
        existing.count += 1
    } else {
        map.set(key, { key, total: amount, count: 1 })
    }
}
