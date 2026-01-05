import { Page } from '@playwright/test';

export class FooterComponent {
  constructor(private page: Page) {}

  emailInput = this.page.getByRole('textbox', { name: 'Your email address' });
  submitButton = this.page.locator('button[type="submit"][id="subscribe"]');
  successAlert = this.page.locator('div[class="alert-success alert"]');

  async subscribeEmail(emailAddress: string) {
    await this.emailInput.fill(emailAddress);
    await this.submitButton.click();
  }
}
