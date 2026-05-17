// vault 가드를 우회하는 메서드를 표시하는 데코레이터. setup/unlock/lock/status 처럼 잠금 상태에서도 호출 가능한 라우트에 부착한다.
import { SetMetadata } from "@nestjs/common"

export const VAULT_PUBLIC_KEY = "vault:public"

export const VaultPublic = () => SetMetadata(VAULT_PUBLIC_KEY, true)
