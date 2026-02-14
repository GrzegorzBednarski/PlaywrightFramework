import { test, session, expect } from '../../pageObjects/theInternet/pageFixture';
import { setCookies } from '../../utils/setCookies';
import { checkCookies } from '../../utils/checkCookies';
import { useBasicAuth } from '../../utils/basicAuth';

test('basic auth: should access protected page (ADMIN)', async ({ basicAuthPage, page }) => {
  await useBasicAuth(page, 'ADMIN');
  await basicAuthPage.goto();
  await basicAuthPage.assertBasicAuthSucceeded();
});

test('basic auth: should access protected page (GLOBAL credentials)', async ({
  basicAuthPage,
  page,
}) => {
  await useBasicAuth(page);
  await basicAuthPage.goto();
  await basicAuthPage.assertBasicAuthSucceeded();
});

test('[sanity] homepage cookies behaviour', async ({ homePage, page }) => {
  await setCookies(page, ['TEST_COOKIE_A']);
  await homePage.goto();
  await checkCookies(page, 'test_cookie_a.json');
  await checkCookies(page, 'test_cookie_b.json', undefined, false);
});

test('[sanity] homepage footer should show Powered by link', async ({ homePage }) => {
  await homePage.goto();
  await homePage.footer.assertPoweredByLink();
});

test('[deprecated] example test that should be skipped', async () => {
  throw new Error(
    'This [deprecated] example test is not intended to be executed. If you see this, check whether "[deprecated]" is added to grep-exclude in config/testRunnerConfig.ts.'
  );
});

test.describe('login', () => {
  test('manual login via loginComponent.login(userKey)', async ({ loginPage, securePage }) => {
    await loginPage.goto();
    await expect(loginPage.submitButton).toBeVisible();

    await loginPage.login('TOM');
    await expect(loginPage.submitButton).not.toBeVisible();
    await securePage.assertUserLoggedIn();
  });

  test('unauthenticated user should not see secure area text on /secure', async ({
    securePage,
    loginPage,
  }) => {
    await securePage.goto();
    await expect(securePage.logoutButton).not.toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
  });

  test.describe('session', () => {
    session('TOM');

    test('session meta should be persisted and reusable', async ({ sessionMeta }) => {
      expect(sessionMeta!.userKey).toBe('TOM');
    });

    for (const run of [1, 2, 3]) {
      test(`session: access secure page (run ${run})`, async ({ securePage }) => {
        await securePage.goto();
        await securePage.assertUserLoggedIn();
      });
    }
  });
});
