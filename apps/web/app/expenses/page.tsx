// 정기 지출 마스터 목록·신규/수정 폼 페이지.
import { getExpenses } from "@/lib/api-client"
import { ExpensesView } from "./ExpensesView"

export const dynamic = "force-dynamic"

export default async function ExpensesPage() {
    try {
        const expenses = await getExpenses()
        return <ExpensesView initial={expenses} />
    } catch (e) {
        return (
            <section>
                <h1>정기 지출</h1>
                <div className="error-box">{(e as Error).message}</div>
                <ExpensesView initial={[]} />
            </section>
        )
    }
}
