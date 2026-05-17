// 인증 Guard 자리. 이번 단계에선 모든 요청을 통과시키며, 후속 비밀번호 기능에서 교체된다.
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common"

@Injectable()
export class AuthGuard implements CanActivate {
    canActivate(_context: ExecutionContext): boolean {
        return true
    }
}
