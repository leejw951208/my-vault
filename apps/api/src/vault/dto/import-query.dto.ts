// import 시 conflict 발생 시 동작을 결정하는 mode 쿼리 DTO.
// reject(기본). 첫 충돌에서 트랜잭션 롤백 + 409 응답.
// skip. 충돌 entry 를 건너뛰고 나머지 import.
// replace. 충돌 entry 를 새 내용으로 덮어쓴다.
import { IsEnum, IsOptional } from "class-validator"

export type ImportMode = "reject" | "skip" | "replace"

export class ImportQueryDto {
    @IsOptional()
    @IsEnum(["reject", "skip", "replace"])
    mode?: ImportMode
}
