export const cspCheckConfig = {
  // ---------------------------------------------------------------------------
  // Scope
  // ---------------------------------------------------------------------------

  /**
   * When true, checks CSP header on the document navigation response if available.
   * When false, always uses `page.request.get(page.url())`.
   */
  preferNavigationResponse: false,

  // ---------------------------------------------------------------------------
  // Rules
  // ---------------------------------------------------------------------------

  /** If true, requires that a CSP policy is present (either header or meta). */
  requireCsp: true,

  /** Rules applied to the effective CSP string (basic heuristic checks). */
  rules: {
    disallowUnsafeInline: true,
    disallowUnsafeEval: true,
    disallowWildcardSources: true,
    requireDefaultSrc: true,
  } as Record<string, boolean>,

  // ---------------------------------------------------------------------------
  // Reporting
  // ---------------------------------------------------------------------------

  includeDirectivesInReport: true,
} as const;
