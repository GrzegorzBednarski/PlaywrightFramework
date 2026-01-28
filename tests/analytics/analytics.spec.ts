import { test } from '@playwright/test';
import { checkAnalyticsEvent, initAnalyticsSpy } from '../../utils/analytics';

test('google analytics landing page served', async ({ page }) => {
  await initAnalyticsSpy(page);
  await page.goto('https://developers.google.com/analytics');
  await checkAnalyticsEvent(page, 'google_analytics_landingPage_served.json');
});
