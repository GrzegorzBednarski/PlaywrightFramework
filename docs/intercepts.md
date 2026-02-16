# Intercepts

← [Back to main documentation](../README.md)

## Overview

Centralized configuration for HTTP intercept URL patterns used across tests.

---

## Configuration

This framework doesn't ship with a predefined `INTERCEPTS` map.
Create it in your project to keep URL patterns reusable and consistent, e.g. `data/intercepts.ts`:

```typescript
export const INTERCEPTS = {
  API_SEARCH: '*/api/search/*',
  USER_PROFILE_REGEXP: /\/api\/users\/[0-9]+\/profile/,
  USER_LOGIN: '*/api/login/orgUsers/*',
} as const;
```

Supported pattern types:

- **`string pattern`** – plain string with optional wildcards (`*`), internally converted to a `RegExp` (e.g. `'*/api/search/*'`)
- **`RegExp`** – full regular expression for advanced matching (e.g. `/\/api\/users\/[0-9]+\/profile/`).  \
  See **[`RegexOne tutorial`](https://regexone.com/)** for interactive RegExp training.

Naming conventions:

- **`UPPER_SNAKE_CASE keys`** – e.g. `USER_LOGIN`, `API_SEARCH` for readability and reuse
- **`Group patterns logically`** – by feature/domain, and reflect URL structure.  \
  e.g.: `PRIVATE_USERS_USERID_PROFILE: '*/private/users/*/profile'`

---

## Usage

Use intercept patterns in helpers and tests, for example with `waitForIntercept`:

```typescript
import { waitForIntercept } from '../../utils/waitForIntercept';
import { INTERCEPTS } from '../../data/intercepts';

const request = await waitForIntercept(page, INTERCEPTS.USER_LOGIN);
```