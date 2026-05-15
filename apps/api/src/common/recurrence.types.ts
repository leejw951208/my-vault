// 도메인 상수와 enum 유사 union 타입을 정의한다. Prisma SQLite는 enum을 지원하지 않아 문자열로 다룬다.
export const RecurrenceValues = ['MONTHLY', 'WEEKLY', 'YEARLY'] as const;
export type Recurrence = (typeof RecurrenceValues)[number];

export const OccurrenceStatusValues = ['SCHEDULED', 'PAID', 'SKIPPED'] as const;
export type OccurrenceStatus = (typeof OccurrenceStatusValues)[number];
