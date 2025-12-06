# Husky

← [Back to main documentation](../README.md)

Husky is used to manage Git hooks and automate tasks like linting and formatting before commits. It helps enforce code quality by running tools such as **[lint-staged](./lintStaged.md)** automatically.

## Setup

After cloning the repository and running `npm install` or `npm ci`, Husky will be set up automatically (thanks to the `prepare` script in `package.json`). No additional manual steps are required for contributors.

## Configuration

### Pre-commit hook for monorepo

The `.husky/pre-commit` script is prepared to support both single-repo and monorepo setups. To add more packages in a monorepo, simply update the `packages` array in `.husky/pre-commit`:

**Example configuration (`.husky/pre-commit`):**

```sh
#!/bin/sh
# === Husky pre-commit hook for lint-staged in (mono)repo ===
# This script runs lint-staged in each defined package directory.
# Add more package paths to the 'packages' array as needed.

# Get the root directory of the repository
root_dir=$(pwd)

# List of package directories to check (add more as needed)
# For single-repo, keep as ("./")
# For monorepo, e.g. ("packages/app1" "packages/app2")
packages=("./")

for package in "${packages[@]}"; do
  cd "$root_dir/$package"
  echo "Starting lint-staged for:"
  pwd
  npx lint-staged
done
```

This configuration runs **[lint-staged](./lintStaged.md)** in each specified package directory before every commit, ensuring code quality across all parts of the monorepo.

## Customization

You can add more hooks or customize existing ones by editing or adding scripts in the `.husky/` directory.

**Common hooks:**
- **`pre-commit`** - runs before commit (currently configured with lint-staged)
- **`pre-push`** - runs before push
- **`commit-msg`** - validates commit messages

## Integration with Lint-staged

Husky and **[lint-staged](./lintStaged.md)** work together to ensure code quality:

1. **Husky** manages the Git hooks and triggers actions at specific Git events
2. **Lint-staged** processes only the staged files with linters and formatters
3. Together they ensure that only properly formatted and linted code gets committed

For more information about Husky, see:

- **[Husky Documentation](https://typicode.github.io/husky/#/)**