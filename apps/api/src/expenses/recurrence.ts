// 반복 규칙으로부터 결제일 배열을 계산하는 순수 함수.
import { Recurrence } from '../common/recurrence.types';

export interface RecurrenceRule {
  recurrence: Recurrence;
  dayOfMonth?: number | null;
  dayOfWeek?: number | null;
  monthOfYear?: number | null;
}

export interface ComputeDatesInput {
  start: Date;
  end?: Date | null;
  rule: RecurrenceRule;
  horizonMonths: number;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function utcDate(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month, day));
}

function startOfDayUtc(date: Date): Date {
  return utcDate(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function lastDayOfMonth(year: number, monthIndex: number): number {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

function clampDayOfMonth(year: number, monthIndex: number, day: number): number {
  return Math.min(day, lastDayOfMonth(year, monthIndex));
}

export function computeDueDates(input: ComputeDatesInput): Date[] {
  const start = startOfDayUtc(input.start);
  const explicitEnd = input.end ? startOfDayUtc(input.end) : null;
  // 최대 인스턴스 개수는 매월=horizon, 매주=horizon*5, 매년=horizon으로 단순화한다.
  const maxCount = computeMaxCount(input.rule.recurrence, input.horizonMonths);

  switch (input.rule.recurrence) {
    case 'MONTHLY':
      return computeMonthly(start, explicitEnd, input.rule.dayOfMonth ?? start.getUTCDate(), maxCount);
    case 'WEEKLY':
      return computeWeekly(start, explicitEnd, input.rule.dayOfWeek ?? start.getUTCDay(), maxCount);
    case 'YEARLY':
      return computeYearly(
        start,
        explicitEnd,
        input.rule.monthOfYear ?? start.getUTCMonth() + 1,
        input.rule.dayOfMonth ?? start.getUTCDate(),
        maxCount
      );
  }
}

function computeMaxCount(recurrence: 'MONTHLY' | 'WEEKLY' | 'YEARLY', horizonMonths: number): number {
  if (recurrence === 'MONTHLY') return horizonMonths;
  if (recurrence === 'WEEKLY') return horizonMonths * 5;
  return Math.max(1, Math.ceil(horizonMonths / 12));
}

function computeMonthly(start: Date, end: Date | null, dayOfMonth: number, maxCount: number): Date[] {
  const results: Date[] = [];
  let year = start.getUTCFullYear();
  let monthIndex = start.getUTCMonth();
  for (let safety = 0; safety < 240 && results.length < maxCount; safety += 1) {
    const due = utcDate(year, monthIndex, clampDayOfMonth(year, monthIndex, dayOfMonth));
    if (end && due > end) {
      break;
    }
    if (due >= start) {
      results.push(due);
    }
    monthIndex += 1;
    if (monthIndex > 11) {
      monthIndex = 0;
      year += 1;
    }
  }
  return results;
}

function computeWeekly(start: Date, end: Date | null, dayOfWeek: number, maxCount: number): Date[] {
  const results: Date[] = [];
  const normalizedDow = ((dayOfWeek % 7) + 7) % 7;
  const startDow = start.getUTCDay();
  const offset = (normalizedDow - startDow + 7) % 7;
  let cursor = new Date(start.getTime() + offset * MS_PER_DAY);
  while (results.length < maxCount) {
    if (end && cursor > end) break;
    results.push(new Date(cursor.getTime()));
    cursor = new Date(cursor.getTime() + 7 * MS_PER_DAY);
  }
  return results;
}

function computeYearly(
  start: Date,
  end: Date | null,
  monthOfYear: number,
  dayOfMonth: number,
  maxCount: number
): Date[] {
  const results: Date[] = [];
  const monthIndex = Math.max(0, Math.min(11, monthOfYear - 1));
  let year = start.getUTCFullYear();
  for (let safety = 0; safety < 120 && results.length < maxCount; safety += 1) {
    const due = utcDate(year, monthIndex, clampDayOfMonth(year, monthIndex, dayOfMonth));
    if (end && due > end) {
      break;
    }
    if (due >= start) {
      results.push(due);
    }
    year += 1;
  }
  return results;
}
