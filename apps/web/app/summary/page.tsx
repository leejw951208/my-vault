// 카테고리·기간별 합계와 CSV 내보내기 페이지.
import { SummaryView } from "./SummaryView"
import { todayIso } from "@/lib/format"

function monthRange(today: string): { from: string; to: string } {
    const [y, m] = today.split("-").map(Number)
    const from = `${String(y!).padStart(4, "0")}-${String(m!).padStart(2, "0")}-01`
    const lastDay = new Date(Date.UTC(y!, m!, 0)).getUTCDate()
    const to = `${String(y!).padStart(4, "0")}-${String(m!).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`
    return { from, to }
}

export default function SummaryPage() {
    const today = todayIso()
    return <SummaryView defaults={monthRange(today)} />
}
