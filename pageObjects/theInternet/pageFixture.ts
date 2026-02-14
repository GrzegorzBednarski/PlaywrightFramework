import { test as baseTest, expect, session, apiProfile } from '../../utils/baseTest';
import type { Page } from '@playwright/test';
import { BasicAuthPage } from './pages/basicAuth.page';
import { HomePage } from './pages/home.page';
import { LoginPage } from './pages/login.page';
import { SecurePage } from './pages/secure.page';

// ---------------------------------------------------------------------------
// POM fixtures types
// ---------------------------------------------------------------------------

type Fixtures = {
  basicAuthPage: BasicAuthPage;
  homePage: HomePage;
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
  homePage: async ({ page }: { page: Page }, use: (v: HomePage) => Promise<void>) => {
    await use(new HomePage(page));
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
