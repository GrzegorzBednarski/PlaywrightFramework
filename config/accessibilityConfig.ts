import { buildDir } from '../../PlaywrightStarterKit/global-setup';

const accessibilityConfig = {
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

  ignoredRules: {
    'color-contrast': true, // Reported in [ABC-345] (temporary ignore until fix)
  },

  excludeElements: ['.cookie-banner'], // Optional global element exclusions

  reportConsole: {
    impact: true,
    id: true,
    description: false,
    help: true,
    helpUrl: false,
    nodes: true,
  },

  reportsOutputFolder: `${buildDir}/accessibility-reports`,
};

export default accessibilityConfig;
