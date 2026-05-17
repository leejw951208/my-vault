// CSV 내보내기 모듈.
import { Module } from "@nestjs/common"
import { PrismaModule } from "../prisma/prisma.module"
import { ExportController } from "./export.controller"

@Module({
    imports: [PrismaModule],
    controllers: [ExportController],
})
export class ExportModule {}
