# Data

← [Back to main documentation](../README.md)

Central place for shared test data (users, products, etc.) to keep specs clean and avoid duplicated hardcoded values (IDs, emails, SKUs).

## Configuration

Data is stored in a single file: `data/data.ts`.

If values differ between environments (dev/stg), define separate datasets and export the one matching `process.env.ENV`.

Example (`data/data.ts`):

```ts
const dev = {
  users: {
    user_1: {
      email: 'user_1.dev@example.com',
      password: 'devPass123',
    },
    user_2: {
      email: 'user_2.dev@example.com',
      password: 'devPass123',
    },
  },
  products: {
    product_1: {
      id: 'dev-123',
      name: 'Product 1 [DEV]',
    },
    product_2: {
      id: 'dev-456',
      name: 'Product 2 [DEV]',
    },
  },
} as const;

const stg = {
  users: {
    user_1: {
      email: 'user_1.stg@example.com',
      password: 'stgPass123',
    },
    user_2: {
      email: 'user_2.stg@example.com',
      password: 'stgPass123',
    },
  },
  products: {
    product_1: {
      id: 'stg-123',
      name: 'Product 1 [STG]',
    },
    product_2: {
      id: 'stg-456',
      name: 'Product 2 [STG]',
    },
  },
} as const;

const byEnv = {
  dev,
  stg,
  qa: stg, // QA uses same data as staging
  local: dev, // local uses dev data
} as const;

type EnvKey = keyof typeof byEnv;
const env = process.env.ENV as EnvKey;

export const data = byEnv[env];
```

## Usage

```ts
import { data } from '../../data/data';

const user_1 = data.users.user_1;
const product_2 = data.products.product_2;

await page.goto(`/products/${product_2.id}/details`);
```
