# Pages

← [Back to main documentation](../../README.md)
↑ [Back to Page Object Model](./index.md)

## Overview

Pages are concrete page objects that extend your `BasePage` (or `AppPage`).

## Configuration

Pages typically extend `BasePage` (or `AppPage` if the page is behind a login wall).

Create page files in: `pageObjects/${domain}/pages/${name}.page.ts` e.g. `login.page.ts`

```ts
import { BasePage } from '../base.page';
import { resolveCreds } from '../../../utils/sessionManager/envCreds';
import { expect } from '@playwright/test';

export class LoginPage extends BasePage {
  protected pageUrl = '/login';

  // ---------------------------------------------------------------------------
  // Locators
  // ---------------------------------------------------------------------------
  usernameInput = this.page.locator('#username');
  passwordInput = this.page.locator('#password');
  submitButton = this.page.locator('button[type="submit"]');

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------
  /**
   * Logs in using credentials resolved from env vars for the given `userKey`.
   *
   * @param userKey - User identifier used to resolve credentials (e.g. `ADMIN`).
   * @returns Promise<void>
   *
   * @example
   * await loginPage.login('ADMIN');
   */
  async login(userKey: string) {
    const { username, password } = resolveCreds(userKey);

    await this.goto();
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.submitButton.click();

    await this.assertLoggedIn();
  }

  // ---------------------------------------------------------------------------
  // Assertions
  // ---------------------------------------------------------------------------
  /**
   * Asserts that the login succeeded.
   *
   * @returns Promise<void>
   *
   * @example
   * await loginPage.login('ADMIN');
   * await loginPage.assertLoggedIn();
   */
  async assertLoggedIn() {
    await expect(this.submitButton).toBeHidden();
  }
}
```

### Static vs Dynamic pages

#### Static pages require:

- `pageUrl` - static path for the page object (e.g. `/login`, `/secure`).

```ts
import { BasePage } from '../base.page';

export class LoginPage extends BasePage {
  protected pageUrl = '/login';
}
```

#### Dynamic pages require:

- `pageUrl` (required by `BasePage` contract)
- `urlPattern` (used by `getDynamicPageUrl()` / `gotoDynamicPage()`)

`urlPattern` should contain placeholders wrapped in `{...}`.

Examples of patterns:

- `/my-profile/users/{id}`

  ```ts
  import { AppPage } from '../app.page';

  type Params = {
    id: number;
  };

  export class UserDetailsPage extends AppPage {
    protected pageUrl = '/my-profile/users';
    protected urlPattern = '/my-profile/users/{id}';

    async gotoDynamicPage(params: Params) {
      return super.gotoDynamicPage(params);
    }

    getDynamicPageUrl(params: Params) {
      return super.getDynamicPageUrl(params);
    }
  }

  // Use it in a test as:
  // await userDetailsPage.gotoDynamicPage({ id: 123 });
  ```

- `/products/{id}/details`

  ```ts
  import { AppPage } from '../app.page';

  type Params = {
    id: string;
  };

  export class ProductDetailsPage extends AppPage {
    protected pageUrl = '/products';
    protected urlPattern = '/products/{id}/details';

    async gotoDynamicPage(params: Params) {
      return super.gotoDynamicPage(params);
    }

    getDynamicPageUrl(params: Params) {
      return super.getDynamicPageUrl(params);
    }
  }

  // Use it in a test as:
  // await productDetailsPage.gotoDynamicPage({ id: 'a1b2c3d4' });
  ```

- `/users/{userId}/orders/{orderId}`

  ```ts
  import { AppPage } from '../app.page';

  type Params = {
    userId: number;
    orderId: string;
  };

  export class UserOrderDetailsPage extends AppPage {
    protected pageUrl = '/users';
    protected urlPattern = '/users/{userId}/orders/{orderId}';

    async gotoDynamicPage(params: Params) {
      return super.gotoDynamicPage(params);
    }

    getDynamicPageUrl(params: Params) {
      return super.getDynamicPageUrl(params);
    }
  }

  // Use it in a test as:
  // await userOrderDetailsPage.gotoDynamicPage({ userId: 10, orderId: 'ord_500A' });
  ```

## Usage

Pages are exposed through fixtures, so tests stay simple.

See: **[Fixtures - POM fixtures (add new pages/components here)](./fixtures.md#pom-fixtures-add-new-pagescomponents-here)**.

```ts
import { test } from '../../pageObjects/${domain}/pageFixture';

test('user can login', async ({ loginPage }) => {
  await loginPage.login('TOM');
});
```
