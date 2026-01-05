import { Page, expect } from '@playwright/test';

export class CookieDisclaimerComponent {
  constructor(private page: Page) {}

  dialog = this.page.locator('div[class="fc-dialog-container"]');
  acceptButton = this.page.locator('button[class*="fc-cta-consent"]');

  async clickAcceptCookiesButton() {
    await expect(this.dialog).toBeVisible();
    await this.acceptButton.click();
  }
}
