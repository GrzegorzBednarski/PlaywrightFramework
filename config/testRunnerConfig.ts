export const testRunnerConfig = {
  testTypes: {
    accessibility: ['tests/accessibility'],
    analytics: ['tests/analytics'],
    functional: ['tests/functional'],
    visual: ['tests/visual'],
  },

  testGroups: {
    all: ['accessibility', 'analytics', 'functional'],
    critical: ['analytics', 'functional'],
  },

  grepGroups: {
    sanity: '[sanity]',
    smoke: '[smoke]',
  },

  grepExclude: ['[deprecated]', '[prod]'],
};
