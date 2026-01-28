import { BasePage } from '../base.page';
import { resolveCreds } from '../../../utils/sessionManager/envCreds';
import { waitForPageIdle } from '../../../utils/waitForPageIdle';

export class LoginPage extends BasePage {
  protected pageUrl = '/login';

  usernameInput = this.page.locator('input[id="username"]');
  passwordInput = this.page.locator('input[id="password"]');
  submitButton = this.page.locator('button[type="submit"]');

  /**
   * Logs in using credentials resolved from env vars for the given `userKey`.
   * Navigates to `/login`, submits the form, then waits until the secure page is loaded.
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

    await waitForPageIdle(this.page);
    await this.page.waitForURL('**/secure');
  }
}
