# TypeScript

← [Back to main documentation](../README.md)

This project uses TypeScript for writing tests and configuration files. TypeScript provides static typing and improved code quality.

## Configuration

TypeScript configuration is located in the `tsconfig.json` file. You can adjust compiler options there to fit your needs.

**Example configuration (`tsconfig.json`):**

```json
{
  "compilerOptions": {
    "lib": ["ES2017", "DOM"],
    "module": "es2020",
    "moduleResolution": "node",
    "strict": true,
    "target": "ES2017"
  },
  "include": ["**/*.ts"],
  "exclude": ["**/*.js", "build", "node_modules"]
}
```

**Key configuration options for Playwright projects:**

- **`lib`**: Includes ES2017 features and DOM types needed for browser automation
- **`module`**: Uses ES2020 module system for modern JavaScript features
- **`moduleResolution`**: Node.js-style module resolution for npm packages
- **`strict`**: Enables all strict type checking options for better code quality
- **`target`**: Compiles to ES2017 for good browser compatibility
- **`include`**: Includes all TypeScript files in the project
- **`exclude`**: Tells the compiler what to skip. Common entries:
    - `**/*.js` — avoid picking up compiled JS alongside TS
    - `build` — exclude emitted artifacts
    - `node_modules` — always exclude third-party deps

### Tips for `exclude`

- Keep `exclude` minimal and focused on generated or external content. If you accidentally exclude source folders (e.g., `tests/`), TypeScript won’t type-check those files.
- Prefer excluding top-level output dirs rather than broad patterns that may hide real source files.
- If you use a separate tsconfig for tooling (e.g., codegen), you can tailor `exclude` per tsconfig.

## Usage

All test files should use the `.ts` extension (e.g., `sample-functional.spec.ts`).

For more information about TypeScript, see:

- **[TypeScript Documentation](https://www.typescriptlang.org/docs/)**
- **[Playwright & TypeScript](https://playwright.dev/docs/test-typescript)**