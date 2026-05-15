-- CreateTable
CREATE TABLE "RecurringExpense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'KRW',
    "recurrence" TEXT NOT NULL,
    "dayOfMonth" INTEGER,
    "dayOfWeek" INTEGER,
    "monthOfYear" INTEGER,
    "startDate" DATETIME NOT NULL,
    "endDate" DATETIME,
    "paymentMethod" TEXT,
    "memo" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ExpenseOccurrence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "expenseId" TEXT NOT NULL,
    "dueDate" DATETIME NOT NULL,
    "expectedAmount" INTEGER NOT NULL,
    "actualAmount" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "paidAt" DATETIME,
    "memo" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ExpenseOccurrence_expenseId_fkey" FOREIGN KEY ("expenseId") REFERENCES "RecurringExpense" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "ExpenseOccurrence_dueDate_idx" ON "ExpenseOccurrence"("dueDate");

-- CreateIndex
CREATE INDEX "ExpenseOccurrence_expenseId_idx" ON "ExpenseOccurrence"("expenseId");

-- CreateIndex
CREATE INDEX "ExpenseOccurrence_status_idx" ON "ExpenseOccurrence"("status");
