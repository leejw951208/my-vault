// apps/web 의 jest 멀티 프로젝트 설정. 헬퍼는 node, React 컴포넌트는 jsdom 에서 실행한다.
module.exports = {
    projects: [
        {
            displayName: "node",
            moduleFileExtensions: ["js", "json", "ts"],
            rootDir: "app",
            testRegex: ".*\\.spec\\.ts$",
            moduleNameMapper: {
                "^@/(.*)$": "<rootDir>/../$1",
            },
            transform: {
                "^.+\\.(t|j)s$": [
                    "ts-jest",
                    {
                        tsconfig: {
                            module: "commonjs",
                            target: "ES2022",
                            esModuleInterop: true,
                        },
                    },
                ],
            },
            testEnvironment: "node",
        },
        {
            displayName: "jsdom",
            moduleFileExtensions: ["js", "json", "ts", "tsx"],
            rootDir: "app",
            testRegex: ".*\\.spec\\.tsx$",
            moduleNameMapper: {
                "^@/(.*)$": "<rootDir>/../$1",
            },
            transform: {
                "^.+\\.(t|j)sx?$": [
                    "ts-jest",
                    {
                        tsconfig: {
                            module: "commonjs",
                            target: "ES2022",
                            jsx: "react-jsx",
                            esModuleInterop: true,
                        },
                    },
                ],
            },
            testEnvironment: "jsdom",
        },
    ],
}
