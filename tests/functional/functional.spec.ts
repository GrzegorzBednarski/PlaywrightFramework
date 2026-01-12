import { test } from '../../pageObjects/automationExcercise/pageFixture';
import { expect } from '@playwright/test';
import { assertNoConsoleErrors } from '../../utils/assertNoConsoleErrors';
import { setCookies } from '../../utils/setCookies';
import { checkCookies } from '../../utils/checkCookies';

test('[sanity] homepage cookies behaviour', async ({ homePage, page }) => {
  await setCookies(page, ['TEST_COOKIE_A']);
  await homePage.goto();
  await checkCookies(page, 'test_cookie_a.json');
  await checkCookies(page, 'test_cookie_b.json', undefined, false);
});

test('[prod]homepage should have no console errors', async ({ homePage, page }) => {
  await assertNoConsoleErrors(page, homePage.getPageUrl(), {
    ignoredPatternsOverride: {
      "Mixed Content: The page at 'https://www.automationexercise.com/' was loaded over HTTPS, but requested an insecure stylesheet 'http://fonts.googleapis.com/css?family=Roboto:400,300,400italic,500,700,100'.": true,
      "Mixed Content: The page at 'https://www.automationexercise.com/' was loaded over HTTPS, but requested an insecure stylesheet 'http://fonts.googleapis.com/css?family=Open+Sans:400,800,300,600,700'.": true,
      "Mixed Content: The page at 'https://www.automationexercise.com/' was loaded over HTTPS, but requested an insecure stylesheet 'http://fonts.googleapis.com/css?family=Abel'.": true,
    },
  });
});

test('should close cookie prompt on homepage', async ({ homePage }) => {
  await homePage.goto(false);
  await homePage.cookieDisclaimer.clickAcceptCookiesButton();
  await expect(homePage.cookieDisclaimer.dialog).not.toBeVisible();
});

test('[sanity] should subscribe user to newsletter on homepage', async ({ homePage }) => {
  await homePage.goto();
  await expect(homePage.footer.successAlert).not.toBeVisible();
  await homePage.footer.subscribeEmail('test.user+newsletter@example.com');
  await expect(homePage.footer.successAlert).toBeVisible();
});

test('[deprecated] example test that should be skipped', async () => {
  throw new Error(
    'This [deprecated] example test is not intended to be executed. If you see this, check whether "[deprecated]" is added to grep-exclude in config/testRunnerConfig.ts.'
  );
});
