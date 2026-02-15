export const securityHeadersConfig = {
  // ---------------------------------------------------------------------------
  // Scope
  // ---------------------------------------------------------------------------

  /**
   * When true, validates security headers on the last navigation response.
   * When false, uses a separate request (Playwright request context) to given URL.
   */
  preferNavigationResponse: true,

  // ---------------------------------------------------------------------------
  // Rules
  // ---------------------------------------------------------------------------

  /** Required headers (case-insensitive). */
  requiredHeaders: {
    'x-content-type-options': true,
    'x-frame-options': true,
    'referrer-policy': false,
    'permissions-policy': false,
    'strict-transport-security': false,
    'content-security-policy': false,
  } as Record<string, boolean>,

  /** Headers that must NOT be present. */
  forbiddenHeaders: {
    'x-powered-by': true,
    server: false,
  } as Record<string, boolean>,

  // ---------------------------------------------------------------------------
  // Reporting
  // ---------------------------------------------------------------------------

  includeAllHeadersInReport: true,
} as const;
