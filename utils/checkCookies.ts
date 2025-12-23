import { Page, expect, test as pwt } from '@playwright/test';
import * as path from 'path';
import { loadFixtureWithReplacements } from './fixtures';
import { checkCookieConfig } from '../config/checkCookieConfig';

/**
 * Compares a browser cookie with a fixture-defined cookie.
 * Only fields defined in the fixture will be checked.
 *
 * @param page - Playwright Page object
 * @param fixtureName - File name of the JSON fixture located in `fixtures/cookies` (e.g. `cookie_a.json`)
 * @param replacements - Optional placeholder-value map for dynamic substitution
 * @param shouldExist - When true (default), asserts that the cookie exists and matches the fixture.
 *                      When false, asserts that the cookie does NOT exist in the browser context.
 */
export async function checkCookies(
  page: Page,
  fixtureName: string,
  replacements?: Record<string, string | number>,
  shouldExist: boolean = true
) {
  const fixturePath = path.join('cookies', fixtureName);
  const cookieFixture = loadFixtureWithReplacements(fixturePath, replacements);

  const cookieKey = Object.keys(cookieFixture)[0];
  const expected = cookieFixture[cookieKey];
  const stepLabel = shouldExist
    ? `Check cookie exists: ${expected.name} (${fixtureName})`
    : `Check cookie does NOT exist: ${expected.name} (${fixtureName})`;

  await pwt.step(stepLabel, async () => {
    const context = page.context();
    const actualCookies = await context.cookies();
    const actual = actualCookies.find(c => c.name === expected.name);

    const formattedCookies = actualCookies.map(c => `- ${c.name}: ${JSON.stringify(c)}`).join('\n');

    if (!shouldExist) {
      if (actual) {
        if (checkCookieConfig.debugCookies) {
          console.log(
            `${stepLabel}\n` +
              `Expected pattern (from fixture ${fixtureName}): ${JSON.stringify(expected, null, 2)}\n` +
              `Current cookies:\n${formattedCookies}\n` +
              `Result: ❌ Cookie "${expected.name}" WAS FOUND but should NOT exist.\n` +
              `Actual value: ${JSON.stringify(actual, null, 2)}`
          );
        }
        throw new Error(
          `❌ Cookie "${expected.name}" was found in browser context, but it should NOT exist.\n` +
            `Fixture: ${fixtureName}\n` +
            `Actual value: ${JSON.stringify(actual, null, 2)}`
        );
      }

      if (checkCookieConfig.debugCookies) {
        console.log(
          `${stepLabel}\n` +
            `Expected pattern (from fixture ${fixtureName}): ${JSON.stringify(expected, null, 2)}\n` +
            `Current cookies:\n${formattedCookies}\n` +
            `Result: ✅ Cookie "${expected.name}" is not present in browser context as expected.`
        );
      }
      return;
    }

    if (!actual) {
      if (checkCookieConfig.debugCookies) {
        console.log(
          `${stepLabel}\n` +
            `Expected pattern (from fixture ${fixtureName}): ${JSON.stringify(expected, null, 2)}\n` +
            `Current cookies:\n${formattedCookies}\n` +
            `Result: ❌ Cookie "${expected.name}" NOT FOUND but it SHOULD exist.`
        );
      }
      throw new Error(
        `❌ Cookie "${expected.name}" not found in browser context.\n` +
          `Fixture: ${fixtureName}\n` +
          `Expected value: ${expected.value}\n\n` +
          `Available cookies:\n${formattedCookies}`
      );
    }

    if (checkCookieConfig.debugCookies) {
      console.log(
        `${stepLabel}\n` +
          `Expected pattern (from fixture ${fixtureName}): ${JSON.stringify(expected, null, 2)}\n` +
          `Current cookies:\n${formattedCookies}\n` +
          `Result: ✅ Cookie "${expected.name}" found.\n` +
          `Actual value: ${JSON.stringify(actual, null, 2)}`
      );
    }

    for (const key in expected) {
      expect(actual?.[key as keyof typeof actual]).toBe(expected[key]);
    }
  });
}
