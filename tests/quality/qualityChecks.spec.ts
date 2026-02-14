import { test } from '../../pageObjects/theInternet/pageFixture';
import { assertNoConsoleErrors } from '../../utils/assertNoConsoleErrors';
import { runLinkCheck } from '../../utils/linkCheck/runLinkCheck';

test.describe('quality checks', () => {
  test('homepage should have no console errors', async ({ homePage, page }) => {
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
