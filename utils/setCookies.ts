import { Page } from '@playwright/test';
import { COOKIES } from '../data/cookies';

/**
 * Injects predefined cookies into the current browser context.
 *
 * @remarks
 * - Cookie definitions live in `data/cookies.ts` under the `COOKIES` object.
 * - Call this helper before `page.goto()` or `page.reload()` so cookies
 *   are applied before the request is made.
 *
 * @param page - Playwright page instance
 * @param cookieKeys - Keys of cookies defined in the `COOKIES` object
 *
 * @example
 * import { setCookies } from '../utils/setCookies';
 *
 * await setCookies(page, ['COOKIE_BANNER_CLOSED']);
 * await page.goto('/');
 */
export async function setCookies(page: Page, cookieKeys: Array<keyof typeof COOKIES>) {
  const context = page.context();
  const cookieObjects = cookieKeys.map(key => COOKIES[key]);
  await context.addCookies(cookieObjects);
}
