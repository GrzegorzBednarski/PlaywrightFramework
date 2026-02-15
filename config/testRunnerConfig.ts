export const testRunnerConfig = {
  // ---------------------------------------------------------------------------
  // Test types (maps "type" to folders)
  // ---------------------------------------------------------------------------

  testTypes: {
    accessibility: ['tests/accessibility'],
    analytics: ['tests/analytics'],
    api: ['tests/api'],
    functional: ['tests/functional'],
    quality: ['tests/quality'],
    visual: ['tests/visual'],
  },

  // ---------------------------------------------------------------------------
  // Test groups (named sets of test types)
  // ---------------------------------------------------------------------------

  testGroups: {
    all: ['accessibility', 'analytics', 'api', 'functional', 'quality'],
    critical: ['analytics', 'functional'],
  },

  // ---------------------------------------------------------------------------
  // Grep shortcuts
  // ---------------------------------------------------------------------------

  grepGroups: {
    sanity: '[sanity]',
    smoke: '[smoke]',
    security: '[security]',
    csp: '[csp]',
    securityheaders: '[securityHeaders]',
  },

  // ---------------------------------------------------------------------------
  // Global excludes
  // ---------------------------------------------------------------------------

  grepExclude: ['[deprecated]', '[prod]'],
};
