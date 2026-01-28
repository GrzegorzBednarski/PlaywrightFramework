export const performanceMonitoringConfig = {
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

  /** Devices configuration: keys from performanceDevicesConfig to be monitored */
  devices: ['desktop', 'mobile'] as const,

  /** Toggle verbose logs from performance monitoring */
  logs: false,

  /** Number of Lighthouse runs per URL */
  numberOfRuns: 2,

  /** Categories to include in monitoring */
  onlyCategories: ['performance', 'accessibility', 'bestPractices', 'seo'],

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
  extraHeaders: {
    // Example: Cookie: 'OptanonAlertBoxClosed=1',
  },

  /** Extra Lighthouse CLI flags (advanced use) */
  extraLighthouseFlags: [],

  // ---------------------------------------------------------------------------
  // URLs to monitor
  // ---------------------------------------------------------------------------

  /**
   * URLs to monitor.
   * - `name` is used in logs and report.
   * - `path` is a path relative to BASE_URL or an absolute URL.
   */
  urlsToMonitor: [
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
      numberOfRuns: 1,
      onlyCategories: ['performance', 'seo'] as const,
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
