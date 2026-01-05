import { test } from '../../pageObjects/automationExcercise/pageFixture';
import percySnapshot from '@percy/playwright';

test('cart visual snapshot', async ({ cartPage, page }) => {
  await cartPage.goto();
  await percySnapshot(page, 'Cart');
});
