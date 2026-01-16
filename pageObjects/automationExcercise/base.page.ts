import { Page } from '@playwright/test';
import { CookieDisclaimerComponent } from './components/cookieDisclaimer.component';
import { FooterComponent } from './components/footer.component';
import { waitForPageIdle } from '../../utils/waitForPageIdle';
import { setCookies } from '../../utils/setCookies';

export abstract class BasePage {
  protected abstract pageUrl: string;
  protected urlPattern?: string;

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
   * Alias for getPageUrl() for convenience.
   */
  getUrl(): string {
    return this.pageUrl;
  }

  /**
   * Resolve dynamic URL by replacing placeholders in urlPattern.
   * @param params Object with values to replace in urlPattern (e.g. { id: 123 })
   */
  getDynamicUrl(params: Record<string, string | number>): string {
    if (!this.urlPattern) {
      throw new Error(`urlPattern is not defined for ${this.constructor.name}`);
    }
    let url = this.urlPattern;
    for (const [key, value] of Object.entries(params)) {
      url = url.replace(`{${key}}`, encodeURIComponent(String(value)));
    }
    return url;
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

  /**
   * Navigate to a dynamic page using named parameters.
   */
  async gotoDynamicPage(params: Record<string, string | number>, autoAcceptCookies = true) {
    const url = this.getDynamicUrl(params);
    if (autoAcceptCookies) {
      await setCookies(this.page, ['AE_CLOSE_COOKIE_PROMPT']);
    }
    await this.page.goto(url);
    await waitForPageIdle(this.page);
  }
}
