// 목록·검색 쿼리 DTO. label 부분 일치와 카테고리 필터를 지원한다.
import { IsEnum, IsOptional, IsString, MaxLength } from "class-validator"
import { VAULT_CATEGORIES, VaultCategory } from "../vault.types"

export class ListEntriesQueryDto {
    @IsOptional()
    @IsEnum(VAULT_CATEGORIES, { message: "허용되지 않은 카테고리입니다." })
    category?: VaultCategory

    @IsOptional()
    @IsString()
    @MaxLength(256)
    q?: string
}
