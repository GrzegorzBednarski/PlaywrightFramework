import { test } from '../../pageObjects/olx/pageFixture';
import { checkAnalyticsEvent, initAnalyticsSpy } from '../../utils/analytics';

test('olx cookie consent analytics - accepted', async ({ homePage, page }) => {
  await initAnalyticsSpy(page);
  await homePage.goto();
  await checkAnalyticsEvent(page, 'olx_cookie_consent_accepted.json');
});

test('olx homepage analytics - banner viewed', async ({ homePage, page }) => {
  await initAnalyticsSpy(page);
  await homePage.goto();
  await checkAnalyticsEvent(page, 'olx_homepage_banner_viewed.json');
});
