// Argon2id 키 도출과 AES-256-GCM 암복호화를 담당하는 서비스.
// 외부 의존성은 argon2 와 node:crypto 뿐이며, kdf 파라미터 버전닝을 통해 후속 강화 경로를 보존한다.
import { Injectable } from "@nestjs/common"
import * as argon2 from "argon2"
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto"
import { KDF_V1, KdfParams } from "./vault.types"

const KEY_LENGTH = 32
const IV_LENGTH = 12
const AUTH_TAG_LENGTH = 16

export interface SealedBlob {
    iv: Buffer
    ciphertext: Buffer
    authTag: Buffer
}

@Injectable()
export class VaultCryptoService {
    generateSalt(length = KDF_V1.saltLength): Buffer {
        return randomBytes(length)
    }

    // master 문자열은 호출자가 NFKC 정규화·trim 을 끝낸 상태여야 한다.
    async deriveKey(
        master: string,
        salt: Buffer,
        params: KdfParams = KDF_V1,
    ): Promise<Buffer> {
        const raw = await argon2.hash(master, {
            type: argon2.argon2id,
            salt,
            memoryCost: params.memoryKiB,
            timeCost: params.iterations,
            parallelism: params.parallelism,
            hashLength: KEY_LENGTH,
            raw: true,
        })
        return raw as Buffer
    }

    seal(key: Buffer, plaintext: Buffer): SealedBlob {
        const iv = randomBytes(IV_LENGTH)
        const cipher = createCipheriv("aes-256-gcm", key, iv)
        const ciphertext = Buffer.concat([
            cipher.update(plaintext),
            cipher.final(),
        ])
        const authTag = cipher.getAuthTag()
        if (authTag.length !== AUTH_TAG_LENGTH) {
            throw new Error("auth tag 길이가 예상과 다릅니다.")
        }
        return { iv, ciphertext, authTag }
    }

    // AEAD 인증 실패 시 평문 0바이트도 노출하지 않기 위해 try/catch 후 null 반환.
    open(key: Buffer, blob: SealedBlob): Buffer | null {
        try {
            const decipher = createDecipheriv("aes-256-gcm", key, blob.iv)
            decipher.setAuthTag(blob.authTag)
            const plain = Buffer.concat([
                decipher.update(blob.ciphertext),
                decipher.final(),
            ])
            return plain
        } catch {
            return null
        }
    }

    sealJson(key: Buffer, payload: unknown): SealedBlob {
        return this.seal(key, Buffer.from(JSON.stringify(payload), "utf8"))
    }

    openJson<T>(key: Buffer, blob: SealedBlob): T | null {
        const plain = this.open(key, blob)
        if (!plain) return null
        try {
            return JSON.parse(plain.toString("utf8")) as T
        } catch {
            return null
        }
    }
}
