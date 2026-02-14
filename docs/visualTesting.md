# Visual Testing

← [Back to main documentation](../README.md)

## Overview

Utility for running visual regression tests with [Percy](https://percy.io) on top of Playwright snapshots.

---

## Configuration

Percy is configured via a `.percy.yml` file in the project root. This file defines default viewport widths and global settings used for all snapshots.

Example:

```yaml
version: 2
snapshot:
  widths:
    - 375
    - 768
    - 1024
    - 1440
  percy-css: |
    /* Hide dynamic ad banner from visual diffs */
    .ad-banner {
      display: none !important;
      visibility: hidden !important;
    }

    /* Hide chat widget globally */
    #chat-widget {
      display: none !important;
      visibility: hidden !important;
    }
discovery:
  disable-cache: true
  network-idle-timeout: 250
```

For full configuration options, see the official [Percy documentation](https://www.browserstack.com/docs/percy/references/config-options).

### Environment variables

Percy relies on a small set of environment variables:

- **`PERCY_TOKEN`** – project access token used to authenticate with Percy.
- **`PERCY_BRANCH`** – branch or pipeline name used to group visual builds.

These values should be stored in `.env` files for each environment (for example in `.env.dev` or `.env.stg`).

See **[Environments](./environments.md)** for an example `.env` file and more details on how environment files are structured.

Function signature:

- **`percySnapshot(page, name, options?)`**
  - **`page`** – Playwright `Page` instance
  - **`name`** – snapshot name as shown in Percy dashboard
  - **`options`** – optional Percy options (e.g. `widths`, `percyCSS`, etc.)

### Overwriting config options

You can override defaults from `.percy.yml` per snapshot by passing options to `percySnapshot`, for example to change widths or add extra Percy CSS.

```ts
await percySnapshot(page, 'Product page - desktop only', {
  widths: [1280],
  percyCSS: `
    /* Hide chat widget only for this snapshot */
    #chat-widget { display: none !important; }
  `,
});
```

---

## Usage

### Basic usage

```ts
import { test } from '@playwright/test';
import percySnapshot from '@percy/playwright';

test('Homepage visual test', async ({ page }) => {
  await page.goto('/');
  await percySnapshot(page, 'Homepage');
});
```

### Running visual tests

Visual tests are located in the `tests/visual/` directory.

1. **Set `PERCY_TOKEN`**

   - bash / macOS / Linux:

     ```bash
     export PERCY_TOKEN=your_project_token
     ```

   - Windows PowerShell:

     ```powershell
     $env:PERCY_TOKEN="your_project_token"
     ```

2. **Run visual tests with Percy**

   Once `PERCY_TOKEN` is set in your shell, run Playwright tests wrapped by Percy:

   ```bash
   npx percy exec -- npx playwright test tests/visual
   ```

---

## Advanced usage

### Handling lazy loading

For pages with lazy-loaded content, scroll and wait for network to become idle before taking snapshots:

```ts
import { waitForPageIdle } from '../utils/waitForPageIdle';

test('Page with lazy loading', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await waitForPageIdle(page);
  await percySnapshot(page, 'Fully Loaded Page');
});
```

### Handling dynamic content

See **[Replace Text](./replaceText.md)** for more details on stabilizing dynamic text content.

#### Replacing dynamic text

```ts
import { test } from '@playwright/test';
import percySnapshot from '@percy/playwright';
import { waitForPageIdle } from '../utils/waitForPageIdle';
import replaceText from '../utils/replaceText';

test('Dashboard with stable date', async ({ page }) => {
  await page.goto('/dashboard');
  await waitForPageIdle(page);

  await replaceText(page, '.current-date', 'January 1, 2025');

  await percySnapshot(page, 'Dashboard with stable date');
});
```

#### Replacing dynamic images

```ts
import { test } from '@playwright/test';
import percySnapshot from '@percy/playwright';
import { waitForPageIdle } from '../utils/waitForPageIdle';

test('Dashboard with stable image', async ({ page }) => {
  await page.goto('/dashboard');
  await waitForPageIdle(page);

  await page.evaluate(() => {
    const el = document.querySelector('.random-image');
    if (el) {
      el.setAttribute('src', 'https://stable-image-url.com/image.jpg');
    }
  });

  await percySnapshot(page, 'Dashboard with stable image');
});
```

### Ignoring elements

You can exclude specific elements from snapshot comparisons using Percy CSS:

- **Global ignore** – via `percy-css` in `.percy.yml` (see [Configuration](#configuration)).
- **Per-snapshot ignore** – via the `percyCSS` option in `percySnapshot` (example below).

```ts
await percySnapshot(page, 'Page with ignored elements', {
  percyCSS: `
    /* Hide dynamic ad banner only for this snapshot */
    .ad-banner { display: none !important; }
    /* Hide timestamps only for this snapshot */
    .timestamp { visibility: hidden !important; }
  `,
});
```

---

## Viewing Results

After running visual tests from the CLI, Percy prints a link to the generated build in your Percy dashboard. Open the link in your browser to review visual changes and approve or reject them as needed.

> **Note:** Percy only captures screenshots when running tests via the command line. It will not capture screenshots when running tests in Playwright's UI mode.
