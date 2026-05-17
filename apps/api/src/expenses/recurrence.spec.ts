// recurrence.ts 단위 테스트. 매월/매주/매년 규칙과 말일 보정을 검증한다.
import { computeDueDates } from "./recurrence"

function ymd(d: Date): string {
    const y = d.getUTCFullYear()
    const m = String(d.getUTCMonth() + 1).padStart(2, "0")
    const day = String(d.getUTCDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
}

describe("computeDueDates", () => {
    it("매월 1일 반복, 시작일이 5월 15일이면 5월 1일은 제외하고 6월 1일부터 12개월", () => {
        const result = computeDueDates({
            start: new Date(Date.UTC(2026, 4, 15)),
            rule: { recurrence: "MONTHLY", dayOfMonth: 1 },
            horizonMonths: 12,
        })

        expect(result.map(ymd)).toEqual([
            "2026-06-01",
            "2026-07-01",
            "2026-08-01",
            "2026-09-01",
            "2026-10-01",
            "2026-11-01",
            "2026-12-01",
            "2027-01-01",
            "2027-02-01",
            "2027-03-01",
            "2027-04-01",
            "2027-05-01",
        ])
    })

    it("매월 31일 반복은 2월에 28/29일로 보정된다", () => {
        const result = computeDueDates({
            start: new Date(Date.UTC(2026, 0, 31)),
            rule: { recurrence: "MONTHLY", dayOfMonth: 31 },
            horizonMonths: 14,
        })

        const map = result.map(ymd)
        expect(map[0]).toBe("2026-01-31")
        expect(map[1]).toBe("2026-02-28")
        expect(map[2]).toBe("2026-03-31")
        expect(map[3]).toBe("2026-04-30")
        expect(map).toContain("2027-02-28")
    })

    it("윤년 2028년 2월은 29일로 보정된다", () => {
        const result = computeDueDates({
            start: new Date(Date.UTC(2028, 0, 31)),
            rule: { recurrence: "MONTHLY", dayOfMonth: 31 },
            horizonMonths: 2,
        })

        expect(result.map(ymd)).toEqual(["2028-01-31", "2028-02-29"])
    })

    it("매주 수요일 반복은 시작일 이후 가장 가까운 수요일부터 시작한다", () => {
        const result = computeDueDates({
            start: new Date(Date.UTC(2026, 4, 15)),
            rule: { recurrence: "WEEKLY", dayOfWeek: 3 },
            horizonMonths: 1,
        })

        expect(result[0]).toBeDefined()
        expect(result[0]!.getUTCDay()).toBe(3)
        expect(ymd(result[0]!)).toBe("2026-05-20")
    })

    it("매년 12월 25일 반복", () => {
        const result = computeDueDates({
            start: new Date(Date.UTC(2026, 4, 15)),
            rule: { recurrence: "YEARLY", monthOfYear: 12, dayOfMonth: 25 },
            horizonMonths: 36,
        })

        expect(result.map(ymd)).toEqual([
            "2026-12-25",
            "2027-12-25",
            "2028-12-25",
        ])
    })

    it("종료일이 horizon 이전이면 종료일까지만 생성한다", () => {
        const result = computeDueDates({
            start: new Date(Date.UTC(2026, 0, 1)),
            end: new Date(Date.UTC(2026, 2, 31)),
            rule: { recurrence: "MONTHLY", dayOfMonth: 1 },
            horizonMonths: 12,
        })

        expect(result.map(ymd)).toEqual([
            "2026-01-01",
            "2026-02-01",
            "2026-03-01",
        ])
    })
})
