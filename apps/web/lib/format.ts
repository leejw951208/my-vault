// 통화·날짜 포맷 헬퍼.
export function formatCurrency(amount: number, currency: string = 'KRW'): string {
  if (currency === 'KRW') {
    return `₩${amount.toLocaleString('ko-KR')}`;
  }
  return `${amount.toLocaleString('ko-KR')} ${currency}`;
}

export function formatDate(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDateShort(value: string | Date): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  return `${m}월 ${d}일`;
}

export function todayIso(): string {
  return formatDate(new Date());
}

export function addDaysIso(base: string, days: number): string {
  const [y, m, d] = base.split('-').map(Number);
  const next = new Date(Date.UTC(y!, m! - 1, d! + days));
  return formatDate(next);
}
