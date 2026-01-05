import { Page, expect } from '@playwright/test';

export class CookieDisclaimerComponent {
  constructor(private page: Page) {}

  cookieDialogContainer = this.page.locator('div[id="onetrust-policy"]');
  acceptButton = this.page.locator('button[id="onetrust-accept-btn-handler"]');

  async clickAcceptCookiesButton() {
    await expect(this.cookieDialogContainer).toBeVisible();
    await this.acceptButton.click();
    await expect(this.cookieDialogContainer).not.toBeVisible();
  }
}
