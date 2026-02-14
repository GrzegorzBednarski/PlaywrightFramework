# ESLint

← [Back to main documentation](../README.md)

## Overview

ESLint is used for static code analysis and enforcing code quality. It helps catch potential bugs, enforce coding standards, and maintain consistent code style across the project.

---

## Configuration

ESLint configuration is located in the `eslint.config.js` file using the modern flat config format.

Note: ESLint uses a dedicated TypeScript config file `tsconfig.eslint.json` via `parserOptions.project`. This keeps type-aware linting fast and scoped, and prevents mixing build-specific settings with linting.

**Configuration (`eslint.config.js`):**

```javascript
const tseslint = require('@typescript-eslint/eslint-plugin');
const tsParser = require('@typescript-eslint/parser');
const playwrightPlugin = require('eslint-plugin-playwright');
const importPlugin = require('eslint-plugin-import');
const prettierPlugin = require('eslint-plugin-prettier');
const noOnlyTestsPlugin = require('eslint-plugin-no-only-tests');
const unusedImportsPlugin = require('eslint-plugin-unused-imports');

/** @type {import('eslint').FlatConfig[]} */
module.exports = [
  {
    ignores: ['node_modules/', 'dist/', '*.min.js', 'eslint.config.js'],
  },
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: __dirname,
        ecmaVersion: 2021,
        sourceType: 'module',
      },
      globals: {
        NodeJS: 'readonly',
        require: 'readonly',
        module: 'readonly',
        process: 'readonly',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
      import: importPlugin,
      'no-only-tests': noOnlyTestsPlugin,
      playwright: playwrightPlugin,
      prettier: prettierPlugin,
      'unused-imports': unusedImportsPlugin,
    },
    rules: {
      '@typescript-eslint/no-unused-expressions': 'error',
      'import/no-extraneous-dependencies': 'warn',
      'no-only-tests/no-only-tests': 'error',
      'prettier/prettier': 'warn',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          varsIgnorePattern: '^_',
          args: 'after-used',
          argsIgnorePattern: '^_',
        },
      ],
    },
  },
];
```

**Key configuration features:**

- Flat config format: modern ESLint flat configuration
- TypeScript support: full TypeScript parsing and rules via `@typescript-eslint`
- Playwright integration: specific rules for Playwright test files
- Import validation: checks for proper import/export usage
- Test quality: prevents committing `test.only()` calls
- Prettier integration: ensures code formatting consistency
- Unused code cleanup: detects and errors on unused imports; warns on unused vars with underscore-ignore patterns

**Plugins used:**
- **`@typescript-eslint`** - TypeScript-specific linting rules
- **`eslint-plugin-playwright`** - Playwright test best practices
- **`eslint-plugin-import`** - Import/export validation
- **`eslint-plugin-no-only-tests`** - Prevents `.only()` in tests
- **`eslint-plugin-prettier`** - Integration with **[Prettier](./prettier.md)**
- **`eslint-plugin-unused-imports`** - Detects and removes unused imports/vars

---

## Usage

To manually run ESLint and automatically fix issues, use:

```sh
npm run test:eslint
```

---

## Integration with other tools

ESLint works seamlessly with:
- **[Husky](./husky.md)** - Git hooks for automated linting
- **[Lint-Staged](./lintStaged.md)** - Pre-commit linting
- **[Prettier](./prettier.md)** - Code formatting
- **[TypeScript](./typescript.md)** - Type checking and TS-specific rules

Automatic linting: ESLint runs automatically on staged files before commits thanks to
**[lint-staged](./lintStaged.md)** and **[Husky](./husky.md)** integration.

For more information about ESLint, see:

- **[ESLint Documentation](https://eslint.org/docs/user-guide/configuring/rules)**