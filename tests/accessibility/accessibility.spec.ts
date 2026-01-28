import { test } from '../../pageObjects/automationExcercise/pageFixture';
import runAccessibilityScan from '../../utils/accessibility';

test.describe('accessibility scan', () => {
  test('should have no accessibility violations on example.com', async ({ page }) => {
    await page.goto('https://www.example.com/');
    await runAccessibilityScan(page, {
      ignoredRules: {
        'avoid-inline-spacing': true,
        'button-name': true,
        'color-contrast-enhanced': true,
        'landmark-one-main': true,
        'link-name': true,
        'heading-order': true,
        region: true,
      },
    });
  });
});
