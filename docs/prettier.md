# Prettier

← [Back to main documentation](../README.md)

Prettier is a code formatter tool that ensures consistent code formatting across the project.

## Configuration

Prettier configuration is located in the `.prettierrc` file. You can adjust these settings to fit your team's preferences.

**Example configuration (`.prettierrc`):**

```json
{
  "arrowParens": "avoid",
  "bracketSpacing": true,
  "endOfLine": "auto",
  "printWidth": 100,
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "useTabs": false
}
```

**Key configuration options:**

- **`arrowParens`**: Avoids parentheses around single arrow function parameters
- **`bracketSpacing`**: Adds spaces inside object literals (e.g., `{ foo: bar }`)
- **`endOfLine`**: Auto-detects line endings for cross-platform compatibility
- **`printWidth`**: Sets maximum line length to 100 characters
- **`semi`**: Requires semicolons at the end of statements
- **`singleQuote`**: Uses single quotes instead of double quotes
- **`tabWidth`**: Sets indentation to 2 spaces
- **`trailingComma`**: Adds trailing commas where valid in ES5 (objects, arrays)
- **`useTabs`**: Uses spaces for indentation instead of tabs

## Usage

To manually format all `.js` and `.ts` files, run:

```sh
npm run test:prettier
```

**Automatic formatting:** Prettier runs automatically on staged files before commits thanks to lint-staged and Husky integration.

For more information about Prettier, see:

- **[Prettier Documentation](https://prettier.io/docs/)**
