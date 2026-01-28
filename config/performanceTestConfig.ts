export const performanceTestConfig = {
  /**
   * Hide sensitive data in reports.
   *
   * Global report setting (cannot be overridden per-URL).
   * When enabled, report output will hide:
   * - extraHeaders
   * - chrome.flags
   * - extraLighthouseFlags
   * URLs are NOT hidden.
   */
  hideSensitiveDataInReport: true,

  /** Devices configuration: keys from performanceDevicesConfig to be tested */
  devices: ['desktop', 'mobile'],

  /** Toggle verbose logs from performance tools */
  logs: false,

  /** Categories to include in the performance test */
  onlyCategories: ['performance', 'accessibility', 'bestPractices', 'seo'],

  /** Global thresholds (0-100) for Lighthouse categories */
  thresholds: {
    accessibility: 80,
    bestPractices: 90,
    performance: 60,
    pwa: 50,
    seo: 90,
  },

  /** Audits to skip during Lighthouse runs (example: 'uses-http2') */
  skipAudits: ['uses-http2'],

  // ---------------------------------------------------------------------------
  // Advanced configuration (typically you don't need to change this section)
  // ---------------------------------------------------------------------------

  /** Low-level Lighthouse/Chrome launch options */
  chrome: {
    headless: true,
    flags: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage'],
  },

  /** Optional extra headers (e.g. cookies/consent) */
  extraHeaders: {},

  /** Extra Lighthouse CLI flags (advanced use) */
  extraLighthouseFlags: [],

  // ---------------------------------------------------------------------------
  // URLs to test
  // ---------------------------------------------------------------------------

  /**
   * URLs to test.
   * - `name` is used in logs and report filenames.
   * - `path` is a path relative to BASE_URL or an absolute URL.
   */
  urlsToTest: [
    {
      name: 'checkboxesPage',
      path: '/checkboxes',
    },
    {
      name: 'inputsPage',
      path: '/inputs',
    },
    {
      name: 'homePage',
      path: '/',

      devices: ['desktopWide', 'tablet'] as const,
      onlyCategories: ['performance', 'seo'] as const,
      thresholds: {
        performance: 50,
        seo: 60,
      },
      skipAudits: ['uses-http2', 'is-on-https'] as const,
      chrome: {
        headless: true,
        flags: ['--no-sandbox'],
      },
      extraHeaders: {
        'X-Example-Header': 'example',
      },
      extraLighthouseFlags: ['--throttling-method=provided'] as const,
    },
  ],
} as const;
