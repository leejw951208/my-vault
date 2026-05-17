// 결제 예정 인스턴스 도메인 모듈.
import { Module } from "@nestjs/common"
import { PrismaModule } from "../prisma/prisma.module"
import { OccurrencesController } from "./occurrences.controller"
import { OccurrencesService } from "./occurrences.service"

@Module({
    imports: [PrismaModule],
    controllers: [OccurrencesController],
    providers: [OccurrencesService],
})
export class OccurrencesModule {}
