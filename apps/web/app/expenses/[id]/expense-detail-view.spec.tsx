// ExpenseDetailView view↔edit 토글 회귀 테스트. 수정 클릭 → 저장 → view 복귀 흐름을 보호한다.
import { act, fireEvent, render, screen } from "@testing-library/react"
import { ExpenseDetailView } from "./ExpenseDetailView"
import type { RecurringExpense } from "@/lib/types"

const refresh = jest.fn()
const push = jest.fn()

jest.mock("next/navigation", () => ({
    useRouter: () => ({
        push,
        refresh,
        replace: jest.fn(),
        back: jest.fn(),
        forward: jest.fn(),
        prefetch: jest.fn(),
    }),
}))

jest.mock("next/link", () => ({
    __esModule: true,
    default: ({
        children,
        href,
        ...rest
    }: { children: React.ReactNode; href: string } & Record<
        string,
        unknown
    >) => (
        <a href={href} {...rest}>
            {children}
        </a>
    ),
}))

const updateExpenseMock = jest.fn()
const deleteExpenseMock = jest.fn()

jest.mock("@/lib/api-client", () => ({
    updateExpense: (...args: unknown[]) => updateExpenseMock(...args),
    deleteExpense: (...args: unknown[]) => deleteExpenseMock(...args),
}))

function makeExpense(
    overrides: Partial<RecurringExpense> = {},
): RecurringExpense {
    return {
        id: "exp-1",
        name: "넷플릭스",
        category: "구독",
        amount: 17000,
        currency: "KRW",
        recurrence: "MONTHLY",
        dayOfMonth: 5,
        dayOfWeek: null,
        monthOfYear: null,
        startDate: "2026-01-05",
        endDate: null,
        paymentMethod: "신한카드",
        memo: null,
        isActive: true,
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
        ...overrides,
    }
}

describe("ExpenseDetailView view↔edit 토글", () => {
    beforeEach(() => {
        refresh.mockClear()
        push.mockClear()
        updateExpenseMock.mockReset()
        deleteExpenseMock.mockReset()
    })

    it("수정 버튼을 누르면 폼이 열리고, 저장하면 view 로 복귀하며 새 값이 반영된다", async () => {
        updateExpenseMock.mockResolvedValue(
            makeExpense({ name: "넷플릭스 프리미엄", amount: 19000 }),
        )

        render(<ExpenseDetailView initial={makeExpense()} />)

        expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
            "넷플릭스",
        )
        expect(screen.queryByRole("button", { name: "저장" })).toBeNull()

        fireEvent.click(screen.getByRole("button", { name: "수정" }))
        expect(screen.getByRole("button", { name: "저장" })).not.toBeNull()

        await act(async () => {
            fireEvent.submit(
                screen.getByRole("button", { name: "저장" }).closest("form")!,
            )
        })

        expect(updateExpenseMock).toHaveBeenCalledTimes(1)
        expect(updateExpenseMock).toHaveBeenCalledWith(
            "exp-1",
            expect.objectContaining({ name: "넷플릭스" }),
        )
        expect(screen.queryByRole("button", { name: "저장" })).toBeNull()
        expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
            "넷플릭스 프리미엄",
        )
    })

    it("수정 모드에서 취소를 누르면 폼이 닫히고 view 로 복귀한다", () => {
        render(<ExpenseDetailView initial={makeExpense()} />)

        fireEvent.click(screen.getByRole("button", { name: "수정" }))
        expect(screen.queryByRole("button", { name: "저장" })).not.toBeNull()

        fireEvent.click(screen.getByRole("button", { name: "취소" }))

        expect(screen.queryByRole("button", { name: "저장" })).toBeNull()
        expect(screen.queryByRole("button", { name: "수정" })).not.toBeNull()
        expect(updateExpenseMock).not.toHaveBeenCalled()
    })
})
