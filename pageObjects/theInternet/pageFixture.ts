import { test as baseTest, expect, session, apiProfile } from '../../utils/baseTest';
import type { Page } from '@playwright/test';
import { BasicAuthPage } from './pages/basicAuth.page';
import { FloatingMenuPage } from './pages/floatingMenu.page';
import { HomePage } from './pages/home.page';
import { LargePage } from './pages/large.page';
import { LoginPage } from './pages/login.page';
import { SecurePage } from './pages/secure.page';

// ---------------------------------------------------------------------------
// POM fixtures types
// ---------------------------------------------------------------------------

type Fixtures = {
  basicAuthPage: BasicAuthPage;
  floatingMenuPage: FloatingMenuPage;
  homePage: HomePage;
  largePage: LargePage;
  loginPage: LoginPage;
  securePage: SecurePage;
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

const test = baseTest.extend<Fixtures>({
  // ---------------------------------------------------------------------------
  // POM fixtures (add new pages/components here)
  // ---------------------------------------------------------------------------
  basicAuthPage: async ({ page }: { page: Page }, use: (v: BasicAuthPage) => Promise<void>) => {
    await use(new BasicAuthPage(page));
  },
  floatingMenuPage: async (
    { page }: { page: Page },
    use: (v: FloatingMenuPage) => Promise<void>
  ) => {
    await use(new FloatingMenuPage(page));
  },
  homePage: async ({ page }: { page: Page }, use: (v: HomePage) => Promise<void>) => {
    await use(new HomePage(page));
  },
  largePage: async ({ page }: { page: Page }, use: (v: LargePage) => Promise<void>) => {
    await use(new LargePage(page));
  },
  loginPage: async ({ page }: { page: Page }, use: (v: LoginPage) => Promise<void>) => {
    await use(new LoginPage(page));
  },
  securePage: async ({ page }: { page: Page }, use: (v: SecurePage) => Promise<void>) => {
    await use(new SecurePage(page));
  },
});

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

export { test, expect, session, apiProfile };
