# Set Cookies Scenario

← [Back to main documentation](../README.md)

## Overview

Helper for applying predefined cookie scenarios from `COOKIE_SCENARIOS` – a scenario injects a named set of cookies in one call.

---

## Configuration

Scenarios are defined centrally in **[Cookies](./cookies.md)** (`data/cookies.ts`), under the `COOKIE_SCENARIOS` object.
Use keys from `COOKIE_SCENARIOS` as the second argument.

Function signature:

- **`setCookiesScenario(page, scenarioKey)`**
  - **`page`** – Playwright `Page`
  - **`scenarioKey`** – key from `COOKIE_SCENARIOS` (e.g. `'privacyMinimal'`)

---

## Usage

```ts
import { test } from '@playwright/test';
import { setCookiesScenario } from '../utils/setCookiesScenario';

// privacyMinimal = ['COOKIE_BANNER_ACCEPTED']
// fullTracking   = ['COOKIE_BANNER_ACCEPTED', 'MARKETING_CONSENT_GIVEN', 'REMEMBER_ME_ENABLED']

test('use minimal privacy scenario', async ({ page }) => {
  await setCookiesScenario(page, 'privacyMinimal');
  await page.goto('/');
});
```

For injecting individual cookies instead of scenarios, see **[Set Cookies](./setCookies.md)**.
