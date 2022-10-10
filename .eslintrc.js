module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    extends: 'prettier',
    plugins: ['prettier'],
    overrides: [],
    parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json',
    },
    rules: {
        'prettier/prettier': ['error'],
    },
}
