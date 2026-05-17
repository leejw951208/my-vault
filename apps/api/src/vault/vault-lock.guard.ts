// vault 보호 엔드포인트 가드. setup/unlock/lock/status 외 vault 라우트는 unlock 상태일 때만 통과시킨다.
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from "@nestjs/common"
import { Reflector } from "@nestjs/core"
import type { Request } from "express"
import { VaultSessionService } from "./vault-session.service"
import { VAULT_ERRORS } from "./vault.types"
import { VAULT_PUBLIC_KEY } from "./vault-public.decorator"

@Injectable()
export class VaultLockGuard implements CanActivate {
    constructor(
        private readonly session: VaultSessionService,
        private readonly reflector: Reflector,
    ) {}

    canActivate(context: ExecutionContext): boolean {
        const req = context.switchToHttp().getRequest<Request>()
        const url = req.baseUrl + req.path
        if (!url.startsWith("/vault")) return true

        const isPublic = this.reflector.getAllAndOverride<boolean>(
            VAULT_PUBLIC_KEY,
            [context.getHandler(), context.getClass()],
        )
        if (isPublic) return true

        if (!this.session.isUnlocked()) {
            throw new UnauthorizedException({
                code: VAULT_ERRORS.VAULT_LOCKED,
                message: "vault 가 잠겨 있습니다.",
            })
        }
        return true
    }
}
