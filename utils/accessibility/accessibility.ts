import { Page, expect, test as pwt } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import accessibilityConfig from '../../config/accessibilityConfig';
import { generateAccessibilityReport } from './accessibilityReport';
import { AxeResults } from 'axe-core';

type AccessibilityOverride = {
  tags?: string[];
  ignoredRules?: Record<string, boolean>;
  excludeElements?: string[];
};

/**
 * Run an accessibility scan on the current page using axe-core and project defaults.
 *
 * @param page Playwright `Page` to scan
 * @param override Optional overrides for tags, ignored rules and excluded elements
 * @param override.tags WCAG tags to test against (replaces config defaults)
 * @param override.ignoredRules Rules to ignore during scan (merged with config defaults)
 * @param override.excludeElements CSS selectors to exclude from scan (merged with config defaults)
 *
 * @throws Error when any accessibility violations are found
 *
 * @example
 * await runAccessibilityScan(page, { tags: ['wcag2a', 'wcag2aa'] });
 */
export default async function runAccessibilityScan(
  page: Page,
  override?: AccessibilityOverride
): Promise<void> {
  const stepLabel = `Accessibility scan on ${page.url() || 'current page'}`;

  await pwt.step(stepLabel, async () => {
    const configTags: string[] = accessibilityConfig.tags ?? [];
    const configIgnoredRules: Record<string, boolean> = accessibilityConfig.ignoredRules ?? {};
    const configExcludeElements: string[] = accessibilityConfig.excludeElements ?? [];

    const finalTags: string[] =
      override?.tags && override.tags.length > 0 ? override.tags : configTags;

    const mergedIgnoredRules: Record<string, boolean> = {
      ...configIgnoredRules,
      ...(override?.ignoredRules ?? {}),
    };

    const mergedExcludeElements: string[] = [
      ...configExcludeElements,
      ...(override?.excludeElements ?? []),
    ];

    const disabledRules: string[] = Object.entries(mergedIgnoredRules)
      .filter(([_, ignore]) => ignore)
      .map(([ruleName]) => ruleName);

    const axeBuilder = new AxeBuilder({ page }).withTags(finalTags).disableRules(disabledRules);

    if (mergedExcludeElements.length > 0) {
      for (const selector of mergedExcludeElements) {
        axeBuilder.exclude(selector);
      }
    }

    const results: AxeResults = await axeBuilder.analyze();

    generateAccessibilityReport(results, accessibilityConfig, page.url());

    expect(results.violations.length, `Accessibility violations on ${page.url()}`).toBe(0);
  });
}
