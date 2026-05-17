// 카테고리별 메타데이터 JSON 스키마. 평문 검증을 거친 뒤 AEAD 로 암호화되어 저장된다.
import {
    ArrayMaxSize,
    ArrayMinSize,
    IsArray,
    IsEnum,
    IsOptional,
    IsString,
    MaxLength,
    MinLength,
    ValidateNested,
    registerDecorator,
    ValidationOptions,
    ValidationArguments,
} from "class-validator"
import { Type } from "class-transformer"
import { VAULT_CATEGORIES, VaultCategory } from "../vault.types"

const LABEL_MAX = 1024

export class KeyValueDto {
    @IsString()
    @MinLength(1, { message: "key 는 1자 이상이어야 합니다." })
    @MaxLength(128)
    key!: string

    @IsString()
    @MaxLength(4096)
    value!: string
}

export function UniqueKeys(validationOptions?: ValidationOptions) {
    return function (object: object, propertyName: string) {
        registerDecorator({
            name: "uniqueKeys",
            target: object.constructor,
            propertyName,
            options: validationOptions,
            validator: {
                validate(value: unknown): boolean {
                    if (!Array.isArray(value)) return true
                    const keys = value
                        .map((item) => (item as KeyValueDto)?.key)
                        .filter((k) => typeof k === "string")
                    return new Set(keys).size === keys.length
                },
                defaultMessage(args: ValidationArguments): string {
                    return `${args.property} 의 key 가 중복되었습니다.`
                },
            },
        })
    }
}

export class CategoryPayloadDto {
    @IsEnum(VAULT_CATEGORIES, { message: "허용되지 않은 카테고리입니다." })
    category!: VaultCategory

    @IsString()
    @MinLength(1, { message: "label 은 1자 이상이어야 합니다." })
    @MaxLength(LABEL_MAX)
    label!: string

    // BANK
    @IsOptional() @IsString() @MaxLength(256) bankName?: string
    @IsOptional() @IsString() @MaxLength(64) accountNumber?: string
    @IsOptional() @IsString() @MaxLength(256) loginId?: string
    @IsOptional() @IsString() @MaxLength(256) loginPassword?: string
    @IsOptional() @IsString() @MaxLength(256) otpSeed?: string

    // CARD
    @IsOptional() @IsString() @MaxLength(256) cardIssuer?: string
    @IsOptional() @IsString() @MaxLength(32) cardNumber?: string
    @IsOptional() @IsString() @MaxLength(7) cardExpiry?: string
    @IsOptional() @IsString() @MaxLength(4) cardCvc?: string
    @IsOptional() @IsString() @MaxLength(16) cardPassword?: string

    // SECURITIES
    @IsOptional() @IsString() @MaxLength(256) brokerage?: string
    @IsOptional() @IsString() @MaxLength(256) certificatePassword?: string

    // SHOPPING
    @IsOptional() @IsString() @MaxLength(256) siteName?: string
    @IsOptional() @IsString() @MaxLength(2048) siteUrl?: string

    // OTHER
    @IsOptional()
    @IsArray()
    @ArrayMinSize(0)
    @ArrayMaxSize(10, { message: "key-value 쌍은 최대 10개까지 허용됩니다." })
    @ValidateNested({ each: true })
    @Type(() => KeyValueDto)
    @UniqueKeys()
    customFields?: KeyValueDto[]

    @IsOptional() @IsString() @MaxLength(4096) memo?: string
}

export class CreateEntryDto extends CategoryPayloadDto {}

export class UpdateEntryDto extends CategoryPayloadDto {}
