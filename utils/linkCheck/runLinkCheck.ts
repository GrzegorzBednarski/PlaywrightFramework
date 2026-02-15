import { Page, test as pwt } from '@playwright/test';
import { LinkChecker } from 'linkinator';
import * as fs from 'fs';
import * as path from 'path';

import { buildDir } from '../../playwright.config';
import { linkCheckConfig } from '../../config/linkCheckConfig';

export type LinkCheckOverrides = {
  /** Crawl beyond the initial page (can make scans much bigger). */
  recurse?: boolean;
  /** Check only links on the same origin as the start URL. */
  sameOriginOnly?: boolean;
  /** Max concurrent link checks. Lower this if you see rate limiting. */
  concurrency?: number;
  /** Per-link timeout in milliseconds. */
  timeoutMs?: number;

  /**
   * Links to skip entirely.
   *
   * Key = substring/pattern used for matching, Value = true to enable, false to disable.
   *
   * @example
   * skippedLinks: {
   *   'mailto:': true,
   *   '/download_secure': true,
   *   '/floating_menu/': true,
   * }
   */
  skippedLinks?: Record<string, boolean>;

  /**
   * Treat these HTTP status codes as acceptable (won't fail the test).
   *
   * @example
   * allowedStatusCodes: { 401: true, 403: true }
   */
  allowedStatusCodes?: Record<number, boolean>;

  /** Include non-broken links in the report output. */
  includeOkLinksInReport?: boolean;
  /** Max number of OK links to include in report (when includeOkLinksInReport=true). */
  okLinksReportLimit?: number;
  /** Max number of broken links to include in report. */
  brokenLinksReportLimit?: number;
};

/**
 * Extract origin (protocol + host + port) from a URL.
 * Used to enforce `sameOriginOnly` filtering.
 */
function toOrigin(url: string): string {
  return new URL(url).origin;
}

/**
 * Returns true when `url` should be skipped based on enabled substring patterns.
 *
 * Matching is a simple `url.includes(pattern)`.
 */
function shouldSkipByPattern(url: string, patterns: Record<string, boolean>): boolean {
  return Object.entries(patterns).some(([pattern, enabled]) => enabled && url.includes(pattern));
}

/**
 * Formats linkinator `failureDetails` into a short, readable suffix for error output.
 *
 * We intentionally avoid printing raw objects to prevent `([object Object])` noise.
 */
function formatFailureDetails(details: unknown): string {
  if (!details) return '';
  if (typeof details === 'string') return details;
  if (Array.isArray(details)) {
    const statuses = details
      .map((d: any) => (typeof d?.status === 'number' ? d.status : undefined))
      .filter((s: any): s is number => typeof s === 'number');
    if (statuses.length) return `status ${statuses.join(', ')}`;
    return '';
  }
  if (typeof details === 'object') return '';
  return String(details);
}

/**
 * Runs link validation for the current page URL and stores per-page report artifacts under:
 * `build/linkCheck/`.
 *
 * It fails the test when any BROKEN links are found (after applying skips/allowed status codes).
 *
 * @param page Playwright Page. Must already be navigated (page.url() must be non-empty).
 * @param override Optional overrides for scanning behaviour (timeouts, skips, allowed status codes, etc.).
 *
 * @throws Error when broken links are found (includes a short list + report paths).
 *
 * @example
 * // Minimal (axe-like) usage
 * await page.goto('https://the-internet.herokuapp.com/');
 * await runLinkCheck(page);
 *
 * @example
 * // Allow auth-protected endpoints (treat 401 as OK)
 * await runLinkCheck(page, {
 *   allowedStatusCodes: {
 *     401: true,
 *   },
 * });
 *
 * @example
 * // Skip a specific link (ignore it completely)
 * await runLinkCheck(page, {
 *   skippedLinks: {
 *     '/download_secure': true,
 *   },
 * });
 */
export async function runLinkCheck(page: Page, override?: LinkCheckOverrides): Promise<void> {
  const startUrl = page.url();
  if (!startUrl) {
    throw new Error('runLinkCheck: page.url() is empty. Did you call page.goto(...) first?');
  }

  const merged = {
    ...linkCheckConfig,
    ...(override ?? {}),
    skippedLinks: {
      ...linkCheckConfig.skippedLinks,
      ...(override?.skippedLinks ?? {}),
    },
    allowedStatusCodes: {
      ...linkCheckConfig.allowedStatusCodes,
      ...(override?.allowedStatusCodes ?? {}),
    },
  };

  await pwt.step(`Link check on ${startUrl}`, async () => {
    const checker = new LinkChecker();
    const startOrigin = toOrigin(startUrl);

    const result = await checker.check({
      path: startUrl,
      recurse: merged.recurse,
      concurrency: merged.concurrency,
      timeout: merged.timeoutMs,
    });

    const okLinks = result.links.filter(l => l.state === 'OK');
    const limitedOk =
      merged.okLinksReportLimit && merged.okLinksReportLimit > 0
        ? okLinks.slice(0, merged.okLinksReportLimit)
        : okLinks;

    const skippedLinks = result.links
      .filter(l => {
        const url = l.url ?? '';
        if (!url) return false;
        return shouldSkipByPattern(url, merged.skippedLinks);
      })
      .map(l => ({
        url: l.url,
        status: l.status,
        state: l.state,
      }));

    const broken = result.links
      .filter(l => l.state === 'BROKEN')
      .filter(l => {
        const url = l.url ?? '';
        if (!url) return true;

        if (shouldSkipByPattern(url, merged.skippedLinks)) return false;

        if (merged.sameOriginOnly) {
          try {
            return toOrigin(url) === startOrigin;
          } catch {
            return true;
          }
        }

        return true;
      })
      .filter(l => {
        const status = typeof l.status === 'number' ? l.status : undefined;
        if (!status) return true;
        return !merged.allowedStatusCodes[status];
      });

    const limitedBroken =
      merged.brokenLinksReportLimit && merged.brokenLinksReportLimit > 0
        ? broken.slice(0, merged.brokenLinksReportLimit)
        : broken;

    const reportDir = path.join(buildDir, 'linkCheck');
    fs.mkdirSync(reportDir, { recursive: true });

    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeUrl = startUrl
      .replace(/^https?:\/\//, '')
      .replace(/\/+$/, '')
      .replace(/[^a-zA-Z0-9-_./]/g, '_')
      .replace(/[\/]/g, '_')
      .slice(0, 120);

    const baseName = `link-check_${safeUrl}_${stamp}`;
    const jsonPath = path.join(reportDir, `${baseName}.json`);
    const mdPath = path.join(reportDir, `${baseName}.md`);

    const reportPayload = {
      startedAt: stamp,
      url: startUrl,
      config: {
        recurse: merged.recurse,
        sameOriginOnly: merged.sameOriginOnly,
        concurrency: merged.concurrency,
        timeoutMs: merged.timeoutMs,
        skippedLinks: merged.skippedLinks,
        allowedStatusCodes: merged.allowedStatusCodes,
        includeOkLinksInReport: merged.includeOkLinksInReport,
        okLinksReportLimit: merged.okLinksReportLimit,
        brokenLinksReportLimit: merged.brokenLinksReportLimit,
      },
      summary: {
        okCount: okLinks.length,
        brokenCount: broken.length,
        skippedCount: skippedLinks.length,
      },
      brokenLinks: limitedBroken.map(l => ({
        url: l.url,
        status: l.status,
        state: l.state,
        failureDetails: l.failureDetails,
      })),
      skippedLinks,
      okLinks: merged.includeOkLinksInReport
        ? limitedOk.map(l => ({
            url: l.url,
            status: l.status,
            state: l.state,
          }))
        : undefined,
    };

    const generatedOn = new Date().toLocaleString('pl-PL');

    const md = [
      `# Link Check Report  `,
      `*Generated on ${generatedOn}*`,
      ``,
      `## Summary`,
      ``,
      `| Metric | Count |`,
      `|--------|------:|`,
      `| ✅ OK | ${okLinks.length} |`,
      `| ❌ Broken | ${broken.length} |`,
      `| ⏭️ Skipped | ${skippedLinks.length} |`,
      ``,
      `**URL:** ${startUrl}`,
      ``,
      `---`,
      ``,
      `## Broken links`,
      broken.length
        ? limitedBroken
            .map(l => {
              const note = formatFailureDetails(l.failureDetails);
              const suffix = note ? ` (${note})` : '';
              return `- ${l.url} -> ${l.status ?? 'unknown'}${suffix}`;
            })
            .join('\n')
        : '✅ _None_',
      broken.length && limitedBroken.length !== broken.length
        ? `\n\n_(showing first ${limitedBroken.length} of ${broken.length})_`
        : '',
      ``,
      skippedLinks.length ? `---\n\n## Skipped links` : undefined,
      skippedLinks.length ? skippedLinks.map(l => `- ${l.url}`).join('\n') : undefined,
      ``,
      merged.includeOkLinksInReport ? `---\n\n## OK links` : undefined,
      merged.includeOkLinksInReport
        ? okLinks.length
          ? limitedOk
              .map(l => `- ${l.url} -> ${typeof l.status === 'number' ? l.status : 'OK'}`)
              .join('\n')
          : '✅ _None_'
        : undefined,
      merged.includeOkLinksInReport && okLinks.length && limitedOk.length !== okLinks.length
        ? `\n\n_(showing first ${limitedOk.length} of ${okLinks.length})_`
        : undefined,
      ``,
    ]
      .filter((x): x is string => typeof x === 'string')
      .join('\n');

    fs.writeFileSync(jsonPath, JSON.stringify(reportPayload, null, 2), 'utf8');
    fs.writeFileSync(mdPath, md, 'utf8');

    if (broken.length > 0) {
      const details = limitedBroken
        .slice(0, 50)
        .map(l => {
          const note = formatFailureDetails(l.failureDetails);
          const suffix = note ? ` (${note})` : '';
          return `  - ${l.url} -> ${l.status ?? 'unknown'}${suffix}`;
        })
        .join('\n');

      const more = broken.length > 50 ? `\n  ...and ${broken.length - 50} more` : '';
      throw new Error(
        `Broken links found on ${startUrl}:\n${details}${more}\n\nReports saved to:\n  ${jsonPath}\n  ${mdPath}`
      );
    }
  });
}
