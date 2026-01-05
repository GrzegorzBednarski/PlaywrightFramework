import { test as base } from '@playwright/test';
import { HomePage } from './pages/home.page';
import { CartPage } from './pages/cart.page';

export const test = base.extend<{
  homePage: HomePage;
  cartPage: CartPage;
}>({
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
});
