import js from "@eslint/js"
import globals from "globals"
import tseslint from "typescript-eslint"

export default [
    {
        ignores: [
            "**/node_modules/**",
            "**/dist/**",
            "**/.next/**",
            "**/coverage/**",
            "apps/api/src/generated/prisma/**",
            "apps/api/data/**",
            "apps/web/next-env.d.ts",
            "docs/**",
            ".agents/**",
            ".claude/**",
        ],
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ["apps/api/**/*.{ts,tsx}", "apps/web/**/*.{ts,tsx}"],
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
            globals: {
                ...globals.node,
                ...globals.browser,
                ...globals.jest,
            },
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                },
            ],
        },
    },
    {
        files: ["apps/**/*.js", "apps/**/*.mjs", "*.mjs"],
        languageOptions: {
            globals: {
                ...globals.node,
            },
        },
    },
]
