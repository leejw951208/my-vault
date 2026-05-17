// 합계 HTTP 엔드포인트.
import { Controller, Get, Query } from "@nestjs/common"
import { SummaryService } from "./summary.service"
import { SummaryQueryDto } from "./dto/summary-query.dto"

@Controller("summary")
export class SummaryController {
    constructor(private readonly service: SummaryService) {}

    @Get()
    summarize(@Query() query: SummaryQueryDto) {
        return this.service.summarize(query.from, query.to)
    }
}
