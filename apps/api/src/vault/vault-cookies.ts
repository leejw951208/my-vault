// vault CSRF 마커 쿠키 상수와 발행/제거 헬퍼.
import type { Response } from "express"

export const VAULT_CSRF_COOKIE = "vault_session"

const baseOptions = {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: false,
    path: "/",
}

export function issueCsrfMarker(res: Response): void {
    res.cookie(VAULT_CSRF_COOKIE, "1", baseOptions)
}

export function clearCsrfMarker(res: Response): void {
    res.clearCookie(VAULT_CSRF_COOKIE, baseOptions)
}
