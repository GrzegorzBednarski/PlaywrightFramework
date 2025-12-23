import { Page } from '@playwright/test';
import { COOKIES, COOKIE_SCENARIOS } from '../data/cookies';
import { setCookies } from './setCookies';

/**
 * Injects cookies for a predefined scenario from `COOKIE_SCENARIOS`.
 *
 * @param page - Playwright page instance
 * @param scenarioKey - Key of the scenario defined in `COOKIE_SCENARIOS`
 *
 * @example
 * import { setCookiesScenario } from '../utils/setCookiesScenario';
 *
 * await setCookiesScenario(page, 'scenario1');
 */
export async function setCookiesScenario(page: Page, scenarioKey: keyof typeof COOKIE_SCENARIOS) {
  const cookieKeys = COOKIE_SCENARIOS[scenarioKey] as Array<keyof typeof COOKIES>;
  await setCookies(page, cookieKeys);
}
