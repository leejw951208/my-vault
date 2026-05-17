// Prisma 클라이언트를 전역 공급하는 모듈.
import { Global, Module } from "@nestjs/common"
import { PrismaService } from "./prisma.service"

@Global()
@Module({
    providers: [PrismaService],
    exports: [PrismaService],
})
export class PrismaModule {}
