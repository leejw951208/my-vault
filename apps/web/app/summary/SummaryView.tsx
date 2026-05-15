'use client';
// 합계 페이지 클라이언트 컴포넌트. 기간 입력, 합계 조회, CSV 다운로드를 처리한다.
import { useEffect, useState } from 'react';
import { buildCsvDownloadUrl, getSummary } from '@/lib/api-client';
import { formatCurrency } from '@/lib/format';
import type { SummaryResponse } from '@/lib/types';

export function SummaryView({ defaults }: { defaults: { from: string; to: string } }) {
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);
  const [data, setData] = useState<SummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getSummary(from, to);
      setData(result);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section>
      <h1>합계</h1>
      <div className="card">
        <div className="toolbar">
          <label>
            From{' '}
            <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label>
            To{' '}
            <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </label>
          <button className="btn" onClick={fetchSummary} disabled={loading}>
            조회
          </button>
          <a className="btn secondary" href={buildCsvDownloadUrl(from, to)} download>
            CSV 내보내기
          </a>
        </div>
        {error && <div className="error-box">{error}</div>}
        {data && (
          <div style={{ marginTop: 12 }}>
            <div className="muted">기간 합계</div>
            <div className="amount large">{formatCurrency(data.total)}</div>
            <div className="muted">
              실제 금액이 입력된 항목은 실제 기준, 미입력은 예상 기준이다. 기준 내역. 실제 {data.basisCounts.actual}건 / 예상 {data.basisCounts.expected}건.
            </div>
          </div>
        )}
      </div>

      {data && (
        <>
          <h2 className="section-title">카테고리별</h2>
          <BucketTable rows={data.byCategory} />
          <h2 className="section-title">결제 수단별</h2>
          <BucketTable rows={data.byPaymentMethod} />
          <h2 className="section-title">상태별</h2>
          <BucketTable rows={data.byStatus} />
        </>
      )}
    </section>
  );
}

function BucketTable({ rows }: { rows: { key: string; total: number; count: number }[] }) {
  if (rows.length === 0) {
    return <div className="empty">해당 기간에 데이터가 없습니다.</div>;
  }
  return (
    <table className="table">
      <thead>
        <tr>
          <th>항목</th>
          <th>건수</th>
          <th>합계</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => (
          <tr key={r.key}>
            <td>{r.key}</td>
            <td>{r.count}</td>
            <td className="amount">{formatCurrency(r.total)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
