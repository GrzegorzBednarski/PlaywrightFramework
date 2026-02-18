import { buildDir } from '../playwright.config';

const accessibilityConfig = {
  // ---------------------------------------------------------------------------
  // axe-core tags
  // ---------------------------------------------------------------------------

  // WCAG / Section 508 tags used by axe-core
  tags: [
    'wcag2a',
    'wcag2aa',
    'wcag2aaa',
    'wcag21a',
    'wcag21aa',
    'wcag22aa',
    'section508',
    'best-practice',
  ],

  // ---------------------------------------------------------------------------
  // Rule exceptions
  // ---------------------------------------------------------------------------

  ignoredRules: {
    'color-contrast': true, // Reported in [ABC-345] (temporary ignore until fix)
  },

  // ---------------------------------------------------------------------------
  // Global exclusions
  // ---------------------------------------------------------------------------

  excludeElements: ['.cookie-banner'], // Optional global element exclusions

  // ---------------------------------------------------------------------------
  // Console report
  // ---------------------------------------------------------------------------

  reportConsole: {
    impact: true,
    id: true,
    description: false,
    help: true,
    helpUrl: false,
    nodes: true,
  },

  // ---------------------------------------------------------------------------
  // Output
  // ---------------------------------------------------------------------------

  reportsOutputFolder: `${buildDir}/accessibility-reports`,
};

export default accessibilityConfig;
