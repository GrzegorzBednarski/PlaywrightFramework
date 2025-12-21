import { Page, test as pwt } from '@playwright/test';
import { waitForPageIdle } from './waitForPageIdle';
import { assertNoConsoleErrorsConfig } from '../config/assertNoConsoleErrorsConfig';

/**
 * Assert that no (non-ignored) console errors appear while loading a page.
 *
 * @param page Playwright `Page` instance
 * @param url URL to navigate to
 * @param options Optional per-call overrides for ignored patterns
 * @throws Error when any non-ignored console errors are detected
 *
 * @example
 * await assertNoConsoleErrors(page, 'https://example.com');
 */
export async function assertNoConsoleErrors(
  page: Page,
  url: string,
  options?: { ignoredPatternsOverride?: Record<string, boolean> }
) {
  const stepLabel = url;
  const errors: string[] = [];

  const mergedIgnoredPatterns: Record<string, boolean> = {
    ...assertNoConsoleErrorsConfig.ignoredPatterns,
    ...(options?.ignoredPatternsOverride ?? {}),
  };

  await pwt.step(`Assert no console errors on ${stepLabel}`, async () => {
    page.on('console', msg => {
      if (msg.type() === 'error') {
        const text = msg.text();

        const shouldIgnore = Object.entries(mergedIgnoredPatterns).some(
          ([pattern, enabled]) => enabled && text.includes(pattern)
        );

        if (!shouldIgnore) {
          errors.push(text);
        }
      }
    });

    await page.goto(url);
    await waitForPageIdle(page);

    if (errors.length > 0) {
      const details = errors.map((e, index) => `  [${index + 1}] ${e}`).join('\n');
      throw new Error(`Console errors found on ${stepLabel}:\n${details}`);
    }
  });
}
