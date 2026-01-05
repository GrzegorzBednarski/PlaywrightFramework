import { Page } from '@playwright/test';
import { CookieDisclaimerComponent } from './components/cookieDisclaimer.component';
import { FooterComponent } from './components/footer.component';
import { waitForPageIdle } from '../../utils/waitForPageIdle';
import { setCookies } from '../../utils/setCookies';

export abstract class BasePage {
  protected abstract pageUrl: string;

  constructor(protected page: Page) {}

  cookieDisclaimer = new CookieDisclaimerComponent(this.page);
  footer = new FooterComponent(this.page);

  /**
   * Expose the configured URL for this page object.
   */
  getPageUrl(): string {
    return this.pageUrl;
  }

  /**
   * Navigate to this page, optionally injecting a cookie to hide the cookie prompt,
   * and wait until the page is idle.
   *
   * @param autoAcceptCookies Inject a cookie that hides the cookie prompt (default: true).
   * @example
   * // open with cookie prompt visible
   * await pageObject.goto(false);
   */
  async goto(autoAcceptCookies = true) {
    if (autoAcceptCookies) {
      await setCookies(this.page, ['AE_CLOSE_COOKIE_PROMPT']);
    }
    await this.page.goto(this.pageUrl);

    await waitForPageIdle(this.page);
  }
}
