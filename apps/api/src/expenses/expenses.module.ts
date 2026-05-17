// 정기 지출 도메인 모듈. 마스터 CRUD 컨트롤러와 서비스를 묶는다.
import { Module } from "@nestjs/common"
import { PrismaModule } from "../prisma/prisma.module"
import { ExpensesController } from "./expenses.controller"
import { ExpenseService } from "./expense.service"

@Module({
    imports: [PrismaModule],
    controllers: [ExpensesController],
    providers: [ExpenseService],
    exports: [ExpenseService],
})
export class ExpensesModule {}
