import { test } from '../../pageObjects/theInternet/pageFixture';
import { assertNoConsoleErrors } from '../../utils/assertNoConsoleErrors';
import { runCspCheck } from '../../utils/cspCheck/runCspCheck';
import { runSecurityHeadersCheck } from '../../utils/securityHeaders/runSecurityHeadersCheck';
import { runLinkCheck } from '../../utils/linkCheck/runLinkCheck';

test.describe('quality checks', () => {
  test('[security][csp] homepage should have no CSP issues', async ({ homePage, page }) => {
    await homePage.goto();
    await runCspCheck(page);
  });

  test('[security][csp] https://www.iana.org/domains/reserved', async ({ page }) => {
    await page.goto('https://www.iana.org/domains/reserved');
    await runCspCheck(page);
  });

  test('[security][csp] https://news.ycombinator.com', async ({ page }) => {
    await page.goto('https://news.ycombinator.com/');
    await runCspCheck(page);
  });

  test('[security][securityHeaders] homepage should have baseline security headers', async ({
    homePage,
    page,
  }) => {
    await homePage.goto();
    await runSecurityHeadersCheck(page);
  });

  test('[security][securityHeaders] /large should have baseline security headers', async ({
    largePage,
    page,
  }) => {
    await largePage.goto();
    await runSecurityHeadersCheck(page);
  });

  test('[security][securityHeaders] /floating_menu should have baseline security headers', async ({
    floatingMenuPage,
    page,
  }) => {
    await floatingMenuPage.goto();
    await runSecurityHeadersCheck(page);
  });

  test('[sanity] homepage should have no console errors', async ({ homePage, page }) => {
    await assertNoConsoleErrors(page, homePage.getPageUrl(), {
      ignoredPatternsOverride: {
        'net::ERR_NAME_NOT_RESOLVED': true,
      },
    });
  });

  test('[sanity] homepage should have no broken internal links', async ({ homePage, page }) => {
    await homePage.goto();
    await runLinkCheck(page);
  });

  test('[sanity] /large should have no broken internal links', async ({ largePage, page }) => {
    await largePage.goto();
    await runLinkCheck(page);
  });

  test('[sanity] /floating_menu should have no broken internal links', async ({
    floatingMenuPage,
    page,
  }) => {
    await floatingMenuPage.goto();
    await runLinkCheck(page, {
      skippedLinks: {
        '/floating_menu': true,
      },
    });
  });
});
