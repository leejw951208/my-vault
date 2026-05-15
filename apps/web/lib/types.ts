// 백엔드와 공유하는 도메인 타입 정의.
export type Recurrence = 'MONTHLY' | 'WEEKLY' | 'YEARLY';
export type OccurrenceStatus = 'SCHEDULED' | 'PAID' | 'SKIPPED';

export interface RecurringExpense {
  id: string;
  name: string;
  category: string;
  amount: number;
  currency: string;
  recurrence: Recurrence;
  dayOfMonth: number | null;
  dayOfWeek: number | null;
  monthOfYear: number | null;
  startDate: string;
  endDate: string | null;
  paymentMethod: string | null;
  memo: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseOccurrence {
  id: string;
  expenseId: string;
  dueDate: string;
  expectedAmount: number;
  actualAmount: number | null;
  status: OccurrenceStatus;
  paidAt: string | null;
  memo: string | null;
  createdAt: string;
  updatedAt: string;
  expense: RecurringExpense;
}

export interface SummaryBucket {
  key: string;
  total: number;
  count: number;
}

export interface SummaryResponse {
  range: { from: string; to: string };
  total: number;
  basisCounts: { actual: number; expected: number };
  byCategory: SummaryBucket[];
  byPaymentMethod: SummaryBucket[];
  byStatus: SummaryBucket[];
}

export interface CreateExpenseInput {
  name: string;
  category: string;
  amount: number;
  currency?: string;
  recurrence: Recurrence;
  dayOfMonth?: number;
  dayOfWeek?: number;
  monthOfYear?: number;
  startDate: string;
  endDate?: string | null;
  paymentMethod?: string;
  memo?: string;
}

export type UpdateExpenseInput = Partial<CreateExpenseInput> & { isActive?: boolean };

export interface UpdateOccurrenceInput {
  status: OccurrenceStatus;
  actualAmount?: number;
  // null은 메모를 비우려는 명시적 의도. 미지정(undefined)은 기존 메모 유지.
  memo?: string | null;
}
