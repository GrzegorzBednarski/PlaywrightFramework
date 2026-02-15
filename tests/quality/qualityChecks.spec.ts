import { test } from '../../pageObjects/theInternet/pageFixture';
import { assertNoConsoleErrors } from '../../utils/assertNoConsoleErrors';
import { runCspCheck } from '../../utils/cspCheck/runCspCheck';
import { runSecurityHeadersCheck } from '../../utils/securityHeaders/runSecurityHeadersCheck';
import { runLinkCheck } from '../../utils/linkCheck/runLinkCheck';
import { runHtmlValidate } from '../../utils/htmlValidator/runHtmlValidate';

test.describe('quality checks', () => {
  test('[security][csp] homePage - cspCheck', async ({ homePage, page }) => {
    await homePage.goto();
    await runCspCheck(page);
  });

  test('[security][securityHeaders] homePage - securityHeaders', async ({ homePage, page }) => {
    await homePage.goto();
    await runSecurityHeadersCheck(page);
  });

  test('[sanity] homePage - assertNoConsoleErrors', async ({ homePage, page }) => {
    await assertNoConsoleErrors(page, homePage.getPageUrl(), {
      ignoredPatternsOverride: {
        'net::ERR_NAME_NOT_RESOLVED': true,
      },
    });
  });

  test('[sanity] homePage - linkCheck', async ({ homePage, page }) => {
    await homePage.goto();
    await runLinkCheck(page);
  });

  test('[security][htmlValidator] homePage - htmlValidator', async ({ homePage, page }) => {
    await homePage.goto();
    await runHtmlValidate(page);
  });

  test('[security][securityHeaders] largePage - securityHeaders', async ({ largePage, page }) => {
    await largePage.goto();
    await runSecurityHeadersCheck(page);
  });

  test('[sanity] largePage - linkCheck', async ({ largePage, page }) => {
    await largePage.goto();
    await runLinkCheck(page);
  });

  test('[security][htmlValidator] largePage - htmlValidator', async ({ largePage, page }) => {
    await largePage.goto();
    await runHtmlValidate(page);
  });

  test('[security][securityHeaders] floatingMenuPage - securityHeaders', async ({
    floatingMenuPage,
    page,
  }) => {
    await floatingMenuPage.goto();
    await runSecurityHeadersCheck(page);
  });

  test('[sanity] floatingMenuPage - linkCheck', async ({ floatingMenuPage, page }) => {
    await floatingMenuPage.goto();
    await runLinkCheck(page, {
      skippedLinks: {
        '/floating_menu': true,
      },
    });
  });

  test('[security][htmlValidator] floatingMenuPage - htmlValidator', async ({
    floatingMenuPage,
    page,
  }) => {
    await floatingMenuPage.goto();
    await runHtmlValidate(page);
  });

  test('[security][csp] iana - cspCheck', async ({ page }) => {
    await page.goto('https://www.iana.org/domains/reserved');
    await runCspCheck(page);
  });

  test('[security][csp] hackerNews - cspCheck', async ({ page }) => {
    await page.goto('https://news.ycombinator.com/');
    await runCspCheck(page);
  });
});
