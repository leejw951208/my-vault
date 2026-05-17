// NestJS 루트 모듈. 도메인 모듈을 조립하고 전역 Guard를 적용한다.
import { Module } from "@nestjs/common"
import { ConfigModule } from "@nestjs/config"
import { APP_GUARD } from "@nestjs/core"
import { PrismaModule } from "./prisma/prisma.module"
import { ExpensesModule } from "./expenses/expenses.module"
import { OccurrencesModule } from "./occurrences/occurrences.module"
import { SummaryModule } from "./summary/summary.module"
import { ExportModule } from "./export/export.module"
import { VaultModule } from "./vault/vault.module"
import { AuthGuard } from "./auth/auth.guard"

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
        ExpensesModule,
        OccurrencesModule,
        SummaryModule,
        ExportModule,
        VaultModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: AuthGuard,
        },
    ],
})
export class AppModule {}
