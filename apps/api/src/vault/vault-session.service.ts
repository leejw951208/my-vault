// 인메모리 세션 키 보관, idle 타임아웃, lock/unlock 전이를 관리한다.
// 단일 사용자·단일 키를 가정해 글로벌 상태로 보유한다. 프로세스 재시작 시 키는 폐기된다.
import { Injectable, OnModuleDestroy } from "@nestjs/common"
import { IDLE_TIMEOUT_MS, LOCK_WINDOW_MS } from "./vault.types"

interface SessionState {
    key: Buffer
    unlockedAt: number
    lastActivityAt: number
    expiresAt: number
}

@Injectable()
export class VaultSessionService implements OnModuleDestroy {
    private state: SessionState | null = null
    private timer: NodeJS.Timeout | null = null
    // lock() 가 진행 중인 동안 동일 promise 를 노출해 inflight 호출자가 같은 결과를 await 하게 한다.
    private lockingPromise: Promise<void> | null = null

    isUnlocked(): boolean {
        if (!this.state) return false
        if (Date.now() >= this.state.expiresAt) {
            void this.lock()
            return false
        }
        return true
    }

    isLocking(): boolean {
        return this.lockingPromise !== null
    }

    getKey(): Buffer | null {
        if (!this.isUnlocked() || !this.state) return null
        this.touch()
        return this.state.key
    }

    setKey(key: Buffer): void {
        this.clearTimer()
        const now = Date.now()
        this.state = {
            key,
            unlockedAt: now,
            lastActivityAt: now,
            expiresAt: now + IDLE_TIMEOUT_MS,
        }
        this.scheduleAutoLock()
    }

    // 활동 발생 시 만료 시각을 갱신한다.
    touch(): void {
        if (!this.state) return
        const now = Date.now()
        this.state.lastActivityAt = now
        this.state.expiresAt = now + IDLE_TIMEOUT_MS
        this.scheduleAutoLock()
    }

    lock(): Promise<void> {
        if (this.lockingPromise) return this.lockingPromise
        const promise = this.runLock().finally(() => {
            this.lockingPromise = null
        })
        this.lockingPromise = promise
        return promise
    }

    idleSecondsRemaining(): number | null {
        if (!this.state) return null
        const remaining = this.state.expiresAt - Date.now()
        return remaining > 0 ? Math.ceil(remaining / 1000) : 0
    }

    onModuleDestroy(): Promise<void> {
        return this.lock()
    }

    // lock 동작 자체는 즉시 끝나지만, 동시 요청이 isLocking() 으로 진행 상태를 관찰할 수 있도록
    // 짧은 macrotask 윈도우(LOCK_WINDOW_MS)를 의도적으로 둔다. spec §"예외 케이스"의
    // "lock 처리 중 inflight 요청 → 423 VAULT_LOCKING" 을 실효화하기 위한 장치다.
    private runLock(): Promise<void> {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (this.state) {
                    this.state.key.fill(0)
                    this.state = null
                }
                this.clearTimer()
                resolve()
            }, LOCK_WINDOW_MS)
        })
    }

    private scheduleAutoLock(): void {
        if (!this.state) return
        this.clearTimer()
        const delay = Math.max(0, this.state.expiresAt - Date.now())
        this.timer = setTimeout(() => this.lock(), delay)
        this.timer.unref?.()
    }

    private clearTimer(): void {
        if (this.timer) {
            clearTimeout(this.timer)
            this.timer = null
        }
    }
}
