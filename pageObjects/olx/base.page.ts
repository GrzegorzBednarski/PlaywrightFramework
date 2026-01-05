import { Page } from '@playwright/test';
import { CookieDisclaimerComponent } from './components/cookieDisclaimerComponent';
import { waitForPageIdle } from '../../utils/waitForPageIdle';

export abstract class BasePage {
  protected abstract pageUrl: string;

  constructor(protected page: Page) {}

  cookieDisclaimer = new CookieDisclaimerComponent(this.page);

  /**
   * Expose the configured URL for this page object.
   */
  getPageUrl(): string {
    return this.pageUrl;
  }

  /**
   * Navigate to this page and wait for the page to become idle.
   *
   * @param autoAcceptCookies Automatically accept the cookie banner (default: true).
   * @example
   * // Navigate without accepting cookies automatically
   * await pageObject.goto(false);
   */
  async goto(autoAcceptCookies = true) {
    await this.page.goto(this.pageUrl);
    await waitForPageIdle(this.page);

    if (autoAcceptCookies) {
      await this.cookieDisclaimer.clickAcceptCookiesButton();
    }
  }
}
