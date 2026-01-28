import { SessionLoginConfig } from '../utils/sessionManager/loginTypes';
import { LoginPage } from '../pageObjects/theInternet/pages/login.page';
import { SecurePage } from '../pageObjects/theInternet/pages/secure.page';

export const sessionLoginConfig: SessionLoginConfig = {
  // ---------------------------------------------------------------------------
  // Session save options (what will be persisted in build/sessions/*.session.json)
  // ---------------------------------------------------------------------------

  saveCookies: true,
  saveLocalStorage: true,
  saveSessionStorage: true,

  // ---------------------------------------------------------------------------
  // Login flow (creates the authenticated browser state)
  // ---------------------------------------------------------------------------

  async loginFlow({ page, userKey, saveMeta }) {
    const loginPage = new LoginPage(page);
    const securePage = new SecurePage(page);

    await loginPage.login(userKey);
    await securePage.assertUserLoggedIn();

    // ---------------------------------------------------------------------------
    // Save additional session data (session meta)
    // ---------------------------------------------------------------------------

    saveMeta({ userKey });
  },
};
