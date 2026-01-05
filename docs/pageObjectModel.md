# Page Object Model

← [Back to main documentation](../README.md)

Guidelines for structuring page objects, components, and fixtures in this starter.

## Configuration

Typical setup for a new domain:

1. **Create a base page** – shared navigation and common behaviour. See [Base page](#base-page).
2. **Create concrete pages** – e.g. `HomePage`, `ContactUsPage`, `ProductPage`, each extending the base page. See [Pages](#pages).
3. **Create components** – reusable UI pieces such as headers or dialogs. See [Components](#components).
4. **Wire fixtures** – expose page objects (and optionally components) via Playwright fixtures. See [Fixtures](#fixtures).

> Each page should extend `BasePage`. Components are typically created in `BasePage` so they are available on every page.

## Structure

POM files live under **`pageObjects/`** and are grouped by domain.
Example structure (domain anonymised as `example`):

- **`pageObjects/`**
  - **`example/`**
    - **`base.page.ts`** – shared base class for all pages in the domain
    - **`components/`** – reusable UI building blocks
      - `cookieDisclaimer.component.ts`
      - `header.component.ts`
      - `footer.component.ts`
    - **`pages/`** – concrete pages
      - `home.page.ts`
      - `contactUs.page.ts`
      - `product.page.ts`
    - **`pageFixture.ts`** – Playwright fixture exposing strongly typed page objects

## Base page

The base page encapsulates common behaviour such as navigation and waiting for idle state.
All concrete pages extend this class and only define their URL and page‑specific helpers.

Example (`pageObjects/example/base.page.ts`):

```ts
import { Page } from '@playwright/test';
import { waitForPageIdle } from '../../utils/waitForPageIdle';

export abstract class BasePage {
  protected abstract pageUrl: string;

  constructor(protected page: Page) {}

  /**
   * Navigate to this page and wait for it to become idle.
   *
   * @example
   * await pageObject.goto();
   */
  async goto() {
    await this.page.goto(this.pageUrl);
    await waitForPageIdle(this.page);
  }
}
```

## Pages

Each page extends `BasePage` and only defines its `pageUrl` and page‑specific helpers/selectors.

Example (`pageObjects/example/pages/home.page.ts`):

```ts
import { BasePage } from '../base.page';

export class HomePage extends BasePage {
  protected pageUrl = 'https://www.example.com/';
}
```

Example (`pageObjects/example/pages/contactUs.page.ts`):

```ts
import { BasePage } from '../base.page';
import { expect } from '@playwright/test';

export class ContactUsPage extends BasePage {
  protected pageUrl = 'https://www.example.com/contact-us';

  nameInput = this.page.getByLabel('Your name');
  messageInput = this.page.getByLabel('Your message');
  submitButton = this.page.getByRole('button', { name: 'Send' });
  successMessage = this.page.getByText('Thank you for your message');

  /**
   * Submit the contact form with a given message.
   *
   * @param message Text to send in the contact form.
   * @example
   * await contactUsPage.submitMessage('I would like to know more.');
   */
  async submitMessage(message: string) {
    await this.messageInput.fill(message);
    await this.submitButton.click();
  }

  /**
   * Assert that the success message is visible.
   */
  async expectSuccessMessageVisible() {
    await expect(this.successMessage).toBeVisible();
  }
}
```

### Dynamic URLs (e.g. product pages)

For pages where part of the URL is dynamic (like product detail pages with an `id`), keep `pageUrl` as the base path and add a dedicated helper that accepts the dynamic part.

Example (`pageObjects/example/pages/product.page.ts`):

```ts
import { BasePage } from '../base.page';
import { expect } from '@playwright/test';

export class ProductPage extends BasePage {
  protected pageUrl = 'https://www.example.com/product_details';

  /**
   * Navigate to the product details page for a specific product ID.
   *
   * @param productId ID of the product to open (e.g. 3).
   * @example
   * await productPage.gotoProduct(3, false);
   */
  async gotoProduct(productId: number | string, autoAcceptCookies = true) {
    const url = `${this.pageUrl}/${productId}`;

    // Optionally reuse shared cookie/idle logic here if needed
    // e.g. a shared helper from BasePage
    await this.page.goto(url);
  }

  /**
   * Assert that the current URL matches the expected product ID.
   */
  async expectOnProduct(productId: number | string) {
    await expect(this.page).toHaveURL(`${this.pageUrl}/${productId}`);
  }
}
```

In tests you can keep the flow readable while still being explicit about the product ID:

```ts
import { test } from '../pageObjects/example/pageFixture';

test('user views product details', async ({ productPage }) => {
  await productPage.gotoProduct(3, false);
  await productPage.expectOnProduct(3);
});
```

## Components

Components model reusable parts of the UI (headers, footers, dialogs, cookie prompts, etc.).
They are created with a `Page` instance and expose locators and small helper methods.

Example (`pageObjects/example/components/cookieDisclaimer.component.ts`):

```ts
import { Page, expect } from '@playwright/test';

export class CookieDisclaimerComponent {
  constructor(private page: Page) {}

  dialog = this.page.locator('div[data-testid="cookie-dialog"]');
  acceptButton = this.page.locator('button[data-testid="cookie-accept"]');

  /**
   * Accept the cookie dialog by clicking the accept button.
   */
  async acceptCookies() {
    await expect(this.dialog).toBeVisible();
    await this.acceptButton.click();
    await expect(this.dialog).toHaveCount(0);
  }
}
```

Components are usually created in `BasePage` and reused across concrete pages:

```ts
import { CookieDisclaimerComponent } from './components/cookieDisclaimer.component';

export abstract class BasePage {
  constructor(protected page: Page) {}

  cookieDisclaimer = new CookieDisclaimerComponent(this.page);
}
```

## Fixtures

Fixtures expose page objects to tests in a strongly typed way.
They extend Playwright's `test` object and create page instances per test.

Example (`pageObjects/example/pageFixture.ts`):

```ts
import { test as base } from '@playwright/test';
import { HomePage } from './pages/home.page';
import { ContactUsPage } from './pages/contactUs.page';

export const test = base.extend<{
  homePage: HomePage;
  contactUsPage: ContactUsPage;
}>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  contactUsPage: async ({ page }, use) => {
    await use(new ContactUsPage(page));
  },
});
```

## Usage

Example test that uses page objects at a business level while keeping low‑level details and assertions in POM helpers:

```ts
import { test } from '../pageObjects/example/pageFixture';

test('user sends contact message', async ({ contactUsPage }) => {
  await contactUsPage.goto();

  // high‑level action: send message using the page object helper
  await contactUsPage.submitMessage('I would like to know more about your product.');

  // assertion: verify that success message is shown
  await contactUsPage.expectSuccessMessageVisible();
});
```

## Advanced tips

Advanced patterns in POM can help keep tests focused on behaviour while hiding repetitive technical details. Common use cases include, for example:

- automatically handling cookie prompts,
- injecting cookies to simulate accepted banners,
- adding shared logging or tracing for all pages.

### Automatically handling cookie prompts with cookies in `BasePage.goto`

Instead of clicking the cookie banner in every test, you can centralise this logic by injecting a cookie in the component and calling it from `BasePage.goto`.

Example component helper (`CookieDisclaimerComponent`):

```ts
import { Page } from '@playwright/test';
import { setCookies } from '../../utils/setCookies';

export class CookieDisclaimerComponent {
  constructor(private page: Page) {}

  /** Inject cookie that marks the cookie banner as accepted. */
  async acceptByCookie() {
    await setCookies(this.page, ['COOKIE_BANNER_ACCEPTED']);
  }
}
```

Example usage in `BasePage.goto`:

```ts
import { Page } from '@playwright/test';
import { waitForPageIdle } from '../../utils/waitForPageIdle';
import { CookieDisclaimerComponent } from './components/cookieDisclaimer.component';

export abstract class BasePage {
  protected abstract pageUrl: string;

  constructor(protected page: Page) {}

  cookieDisclaimer = new CookieDisclaimerComponent(this.page);

  /**
   * Navigate to this page, optionally injecting a cookie that hides the cookie prompt,
   * and wait for it to become idle.
   *
   * @param autoAcceptCookies Inject cookie that hides the cookie prompt (default: true).
   * @example
   * await homePage.goto(); // auto-accept cookie prompt
   * await homePage.goto(false); // open with cookie prompt visible
   */
  async goto(autoAcceptCookies = true) {
    if (autoAcceptCookies) {
      await this.cookieDisclaimer.acceptByCookie();
    }

    await this.page.goto(this.pageUrl);
    await waitForPageIdle(this.page);
  }
}
```

Usage:

```ts
// Auto‑accept cookie prompt via cookie injection (default)
await homePage.goto();

// Open the page with cookie prompt visible (e.g. for dedicated cookie tests)
await homePage.goto(false);
```

## Recommendations

- Keep page objects thin: URLs + page‑specific helpers.
- Put shared behaviour (navigation, waiting, cookie handling) into `BasePage`.
- Model repeated UI fragments as components.
- Use fixtures to avoid manual `new PageObject(page)` in tests and to keep tests readable.
