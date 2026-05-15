// ExpenseService 단위 테스트. Prisma는 인메모리 객체로 대체한다.
import { ExpenseService } from './expense.service';

type Expense = {
  id: string;
  name: string;
  category: string;
  amount: number;
  currency: string;
  recurrence: string;
  dayOfMonth: number | null;
  dayOfWeek: number | null;
  monthOfYear: number | null;
  startDate: Date;
  endDate: Date | null;
  paymentMethod: string | null;
  memo: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type Occurrence = {
  id: string;
  expenseId: string;
  dueDate: Date;
  expectedAmount: number;
  actualAmount: number | null;
  status: string;
  paidAt: Date | null;
  memo: string | null;
  createdAt: Date;
  updatedAt: Date;
};

class FakePrisma {
  expenses: Expense[] = [];
  occurrences: Occurrence[] = [];
  private nextId = 1;

  recurringExpense = {
    create: async ({ data }: { data: Partial<Expense> }) => {
      const expense: Expense = {
        id: `exp-${this.nextId++}`,
        name: data.name!,
        category: data.category!,
        amount: data.amount!,
        currency: data.currency ?? 'KRW',
        recurrence: data.recurrence!,
        dayOfMonth: data.dayOfMonth ?? null,
        dayOfWeek: data.dayOfWeek ?? null,
        monthOfYear: data.monthOfYear ?? null,
        startDate: data.startDate!,
        endDate: data.endDate ?? null,
        paymentMethod: data.paymentMethod ?? null,
        memo: data.memo ?? null,
        isActive: data.isActive ?? true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.expenses.push(expense);
      return expense;
    },
    findUnique: async ({ where }: { where: { id: string } }) =>
      this.expenses.find((e) => e.id === where.id) ?? null,
    findMany: async () => this.expenses.filter((e) => e.isActive),
    update: async ({ where, data }: { where: { id: string }; data: Partial<Expense> }) => {
      const idx = this.expenses.findIndex((e) => e.id === where.id);
      this.expenses[idx] = { ...this.expenses[idx]!, ...data, updatedAt: new Date() } as Expense;
      return this.expenses[idx]!;
    }
  };

  expenseOccurrence = {
    createMany: async ({ data }: { data: Array<Partial<Occurrence>> }) => {
      for (const item of data) {
        this.occurrences.push({
          id: `occ-${this.nextId++}`,
          expenseId: item.expenseId!,
          dueDate: item.dueDate!,
          expectedAmount: item.expectedAmount!,
          actualAmount: item.actualAmount ?? null,
          status: item.status ?? 'SCHEDULED',
          paidAt: item.paidAt ?? null,
          memo: item.memo ?? null,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      return { count: data.length };
    },
    deleteMany: async ({
      where
    }: {
      where: {
        expenseId?: string;
        status?: string;
        dueDate?: { gte?: Date };
      };
    }) => {
      const before = this.occurrences.length;
      this.occurrences = this.occurrences.filter((o) => {
        if (where.expenseId && o.expenseId !== where.expenseId) return true;
        if (where.status && o.status !== where.status) return true;
        if (where.dueDate?.gte && o.dueDate < where.dueDate.gte) return true;
        return false;
      });
      return { count: before - this.occurrences.length };
    }
  };

  async $transaction<T>(fn: (tx: FakePrisma) => Promise<T>): Promise<T> {
    return fn(this);
  }
}

describe('ExpenseService', () => {
  it('생성 시 12개월치 occurrence를 자동 생성한다', async () => {
    const prisma = new FakePrisma();
    const service = new ExpenseService(prisma as never);

    await service.create({
      name: '넷플릭스',
      category: '구독',
      amount: 17000,
      recurrence: 'MONTHLY',
      dayOfMonth: 15,
      startDate: '2026-05-15'
    });

    expect(prisma.expenses).toHaveLength(1);
    expect(prisma.occurrences).toHaveLength(12);
    expect(prisma.occurrences[0]!.expectedAmount).toBe(17000);
    expect(prisma.occurrences[0]!.status).toBe('SCHEDULED');
  });

  it('수정 시 PAID 인스턴스는 보존하고 오늘 이후 SCHEDULED만 재생성한다', async () => {
    const prisma = new FakePrisma();
    const service = new ExpenseService(prisma as never);

    // 시작일을 미래로 두어 모든 인스턴스가 today 이후가 되게 한다.
    const farFuture = new Date(Date.UTC(2099, 0, 1));
    const expense = await service.create({
      name: '카드',
      category: '카드',
      amount: 50000,
      recurrence: 'MONTHLY',
      dayOfMonth: 1,
      startDate: '2099-01-01'
    });

    // 첫 인스턴스를 과거(PAID)로 만든다. dueDate는 today 이전이 되도록 둔다.
    prisma.occurrences[0]!.status = 'PAID';
    prisma.occurrences[0]!.actualAmount = 51000;
    prisma.occurrences[0]!.dueDate = new Date(Date.UTC(2020, 0, 1));

    await service.update(expense.id, { amount: 60000 });

    const paid = prisma.occurrences.find((o) => o.status === 'PAID');
    expect(paid).toBeDefined();
    expect(paid!.actualAmount).toBe(51000);

    const futureScheduled = prisma.occurrences.filter(
      (o) => o.status === 'SCHEDULED' && o.dueDate >= farFuture
    );
    expect(futureScheduled.length).toBeGreaterThan(0);
    expect(futureScheduled.every((o) => o.expectedAmount === 60000)).toBe(true);
  });

  it('삭제 시 isActive=false로 두고 오늘 이후 SCHEDULED만 제거한다', async () => {
    const prisma = new FakePrisma();
    const service = new ExpenseService(prisma as never);

    const expense = await service.create({
      name: '관리비',
      category: '주거',
      amount: 200000,
      recurrence: 'MONTHLY',
      dayOfMonth: 25,
      startDate: '2099-01-25'
    });

    // 첫 인스턴스를 과거(PAID)로 만든다.
    prisma.occurrences[0]!.status = 'PAID';
    prisma.occurrences[0]!.dueDate = new Date(Date.UTC(2020, 0, 25));

    await service.remove(expense.id);

    const updated = prisma.expenses.find((e) => e.id === expense.id);
    expect(updated!.isActive).toBe(false);
    expect(prisma.occurrences.some((o) => o.status === 'PAID')).toBe(true);
    expect(prisma.occurrences.some((o) => o.status === 'SCHEDULED')).toBe(false);
  });

  it('종료일이 시작일 이전이면 BadRequestException', async () => {
    const prisma = new FakePrisma();
    const service = new ExpenseService(prisma as never);

    await expect(
      service.create({
        name: '잘못된 일정',
        category: '기타',
        amount: 1000,
        recurrence: 'MONTHLY',
        dayOfMonth: 1,
        startDate: '2026-06-01',
        endDate: '2026-05-01'
      })
    ).rejects.toThrow('종료일');
  });

  it('update에서 dayOfMonth가 범위 밖이면 BadRequestException', async () => {
    const prisma = new FakePrisma();
    const service = new ExpenseService(prisma as never);

    const expense = await service.create({
      name: '카드',
      category: '카드',
      amount: 1000,
      recurrence: 'MONTHLY',
      dayOfMonth: 5,
      startDate: '2099-01-05'
    });

    await expect(service.update(expense.id, { dayOfMonth: 99 })).rejects.toThrow('결제일');
  });

  it('update에서 endDate에 빈 문자열을 보내면 종료일이 null로 설정된다', async () => {
    const prisma = new FakePrisma();
    const service = new ExpenseService(prisma as never);

    const expense = await service.create({
      name: '카드',
      category: '카드',
      amount: 1000,
      recurrence: 'MONTHLY',
      dayOfMonth: 5,
      startDate: '2099-01-05',
      endDate: '2099-06-05'
    });

    const updated = await service.update(expense.id, { endDate: '' });
    expect(updated.endDate).toBeNull();
  });
});
