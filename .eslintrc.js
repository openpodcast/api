module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'prettier',
    ],
    parser: '@typescript-eslint/parser',
    plugins: ['@typescript-eslint', 'prettier'],
    root: true,
    overrides: [],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
    },
    ignorePatterns: [
        '**/*.test.ts',
        '**/*.spec.ts',
        'tests/**/*',
        'dist/**/*'
    ],
    rules: {
        'prettier/prettier': ['error'],
    },
}
