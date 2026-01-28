import { Page } from '@playwright/test';
import { waitForPageIdle } from '../../utils/waitForPageIdle';
import { FooterComponent } from './components/footer.component';

export abstract class BasePage {
  protected abstract pageUrl: string;
  public footer: FooterComponent;

  constructor(protected page: Page) {
    this.footer = new FooterComponent(page);
  }

  /**
   * Expose the configured URL for this page object.
   */
  getPageUrl(): string {
    return this.pageUrl;
  }

  /**
   * Navigate to this page and wait until the page is idle.
   */
  async goto() {
    await this.page.goto(this.pageUrl);
    await waitForPageIdle(this.page);
  }
}
