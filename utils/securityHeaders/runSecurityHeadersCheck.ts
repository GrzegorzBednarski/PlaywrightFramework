import { APIRequestContext, Page, test as pwt } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

import { buildDir } from '../../playwright.config';
import { securityHeadersConfig } from '../../config/securityHeadersConfig';

export type SecurityHeadersOverrides = {
  /**
   * Headers that must be present (case-insensitive).
   *
   * `true` = enabled, `false` = disabled.
   */
  requiredHeaders?: Record<string, boolean>;

  /**
   * Headers that must NOT be present (case-insensitive).
   *
   * `true` = enabled, `false` = disabled.
   */
  forbiddenHeaders?: Record<string, boolean>;

  /** When `true`, includes all response headers in the JSON report (`headers` field). */
  includeAllHeadersInReport?: boolean;

  /** When true, uses the page navigation response headers when available. */
  preferNavigationResponse?: boolean;
};

/** Normalize header names to a comparable form (lowercase + trimmed). */
function normalizeHeaderName(name: string): string {
  return name.trim().toLowerCase();
}

/** Convert a headers object to a normalized map keyed by lowercase header name. */
function toHeaderMap(headers: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) out[normalizeHeaderName(k)] = v;
  return out;
}

async function fetchHeaders(
  request: APIRequestContext,
  url: string
): Promise<Record<string, string>> {
  const res = await request.get(url, { maxRedirects: 10 });
  return toHeaderMap(res.headers());
}

/**
 * Validates security headers for the current page URL and writes a report under `build/securityHeaders/`.
 *
 * @param page Playwright Page (must already be navigated; page.url() must be non-empty)
 * @param override Optional per-call overrides
 *
 * @throws Error when required headers are missing or forbidden headers are present.
 *
 * @example
 * // Minimal usage
 * await page.goto('https://example.com');
 * await runSecurityHeadersCheck(page);
 *
 * @example
 * // Override rules for a single test
 * await runSecurityHeadersCheck(page, {
 *   requiredHeaders: {
 *     'x-content-type-options': true,
 *     'content-security-policy': true,
 *   },
 *   forbiddenHeaders: {
 *     'x-powered-by': true,
 *   },
 * });
 */
export async function runSecurityHeadersCheck(
  page: Page,
  override?: SecurityHeadersOverrides
): Promise<void> {
  const startUrl = page.url();
  if (!startUrl)
    throw new Error('runSecurityHeadersCheck: url is empty. Did you call page.goto(...) first?');

  const merged = {
    ...securityHeadersConfig,
    ...(override ?? {}),
    requiredHeaders: {
      ...securityHeadersConfig.requiredHeaders,
      ...(override?.requiredHeaders ?? {}),
    },
    forbiddenHeaders: {
      ...securityHeadersConfig.forbiddenHeaders,
      ...(override?.forbiddenHeaders ?? {}),
    },
  };

  await pwt.step(`Security headers check on ${startUrl}`, async () => {
    let headers: Record<string, string> | null = null;

    if (merged.preferNavigationResponse) {
      try {
        const navResp = await page.waitForResponse(
          resp => resp.url() === startUrl && resp.request().resourceType() === 'document',
          { timeout: 1000 }
        );
        headers = toHeaderMap(await navResp.allHeaders());
      } catch {
        // ignore, fallback to request.get
      }
    }

    if (!headers) {
      headers = await fetchHeaders(page.request, startUrl);
    }

    const required = Object.entries(merged.requiredHeaders)
      .filter(([, enabled]) => enabled)
      .map(([h]) => normalizeHeaderName(h));

    const forbidden = Object.entries(merged.forbiddenHeaders)
      .filter(([, enabled]) => enabled)
      .map(([h]) => normalizeHeaderName(h));

    const missingHeaders = required.filter(h => !(h in headers!));
    const forbiddenPresentHeaders = forbidden.filter(h => h in headers!);

    const reportDir = path.join(buildDir, 'securityHeaders');
    fs.mkdirSync(reportDir, { recursive: true });

    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeUrl = startUrl
      .replace(/^https?:\/\//, '')
      .replace(/\/+$/, '')
      .replace(/[^a-zA-Z0-9-_./]/g, '_')
      .replace(/[\/]/g, '_')
      .slice(0, 120);

    const baseName = `security-headers_${safeUrl}_${stamp}`;
    const jsonPath = path.join(reportDir, `${baseName}.json`);
    const mdPath = path.join(reportDir, `${baseName}.md`);

    const reportPayload = {
      startedAt: stamp,
      url: startUrl,
      config: {
        preferNavigationResponse: merged.preferNavigationResponse,
        requiredHeaders: merged.requiredHeaders,
        forbiddenHeaders: merged.forbiddenHeaders,
        includeAllHeadersInReport: merged.includeAllHeadersInReport,
      },
      okCount: required.length - missingHeaders.length,
      missingHeaders,
      forbiddenPresentHeaders,
      headers: merged.includeAllHeadersInReport ? headers : undefined,
    };

    const generatedOn = new Date().toLocaleString('pl-PL');
    const md = [
      `# Security Headers Report  `,
      `*Generated on ${generatedOn}*`,
      ``,
      `## Summary`,
      ``,
      `| Metric | Count |`,
      `|--------|------:|`,
      `| ✅ OK | ${reportPayload.okCount} |`,
      `| ❌ Missing | ${missingHeaders.length} |`,
      `| ⚠️ Forbidden present | ${forbiddenPresentHeaders.length} |`,
      ``,
      `**URL:** ${startUrl}`,
      ``,
      `---`,
      ``,
      `## Missing required headers`,
      missingHeaders.length ? missingHeaders.map(h => `- ${h}`).join('\n') : '✅ _None_',
      ``,
      `## Forbidden headers present`,
      forbiddenPresentHeaders.length
        ? forbiddenPresentHeaders.map(h => `- ${h}`).join('\n')
        : '✅ _None_',
      ``,
    ].join('\n');

    fs.writeFileSync(jsonPath, JSON.stringify(reportPayload, null, 2), 'utf8');
    fs.writeFileSync(mdPath, md, 'utf8');

    if (missingHeaders.length || forbiddenPresentHeaders.length) {
      throw new Error(
        `Security headers issues found on ${startUrl}: missing=${missingHeaders.length}, forbiddenPresent=${forbiddenPresentHeaders.length}\n\nReports saved to:\n  ${jsonPath}\n  ${mdPath}`
      );
    }
  });
}
