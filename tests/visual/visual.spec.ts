import { test } from '../../pageObjects/theInternet/pageFixture';
import percySnapshot from '@percy/playwright';

test('homePage visual snapshot', async ({ homePage, page }) => {
  await homePage.goto();
  await percySnapshot(page, 'HomePage');
});
