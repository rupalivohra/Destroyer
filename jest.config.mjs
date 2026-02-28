/** @type {import('jest').Config} */
export default {
    "roots": [
        "./dist"
    ],
    "testMatch": [
        "**/tests/**/*.+(js)",
        "**/?(*.)+(spec|test).+(js)"
    ],
    testPathIgnorePatterns: [
        "./tests/utils.js"
    ],
    "extensionsToTreatAsEsm": [".ts"],
    "moduleFileExtensions": ["ts", "js", "json"],
    "testEnvironment": "jsdom",
};