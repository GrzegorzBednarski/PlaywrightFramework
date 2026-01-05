import { test as base } from '@playwright/test';
import { HomePage } from './pages/home.page';

type OlxFixtures = {
  homePage: HomePage;
};

export const test = base.extend<OlxFixtures>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
});
