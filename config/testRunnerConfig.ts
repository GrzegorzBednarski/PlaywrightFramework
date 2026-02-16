export const testRunnerConfig = {
  // ---------------------------------------------------------------------------
  // Optional modes (feature flags)
  // ---------------------------------------------------------------------------

  optionalModes: {
    visual: true,
    performanceTest: true,
    performanceMonitoring: true,
  },

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
    csp: '[csp]',
    htmlvalidator: '[htmlValidator]',
    sanity: '[sanity]',
    security: '[security]',
    securityheaders: '[securityHeaders]',
    smoke: '[smoke]',
  },

  // ---------------------------------------------------------------------------
  // Global excludes
  // ---------------------------------------------------------------------------

  grepExclude: ['[deprecated]', '[prod]'],
};
