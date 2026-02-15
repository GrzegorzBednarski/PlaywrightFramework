import { Page, test as pwt } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

import { buildDir } from '../../playwright.config';
import { cspCheckConfig } from '../../config/cspCheckConfig';

export type CspCheckOverrides = {
  /** When true, tries to read CSP from the document navigation response (when available). */
  preferNavigationResponse?: boolean;

  /** When true, fails if CSP is missing (header or meta). */
  requireCsp?: boolean;

  /** Enable/disable heuristic checks. */
  rules?: Partial<Record<keyof typeof cspCheckConfig.rules, boolean>>;

  /** When `true`, includes parsed directives in the per-page JSON report. */
  includeDirectivesInReport?: boolean;
};

type CspIssue = {
  code:
    | 'CSP_MISSING'
    | 'DEFAULT_SRC_MISSING'
    | 'UNSAFE_INLINE'
    | 'UNSAFE_EVAL'
    | 'WILDCARD_SOURCE'
    | 'NONCE_OR_HASH_MISSING';
  message: string;
};

/** Read a header value case-insensitively from a headers map. */
function safeGetHeader(headers: Record<string, string>, name: string): string | undefined {
  const key = name.toLowerCase();
  for (const [k, v] of Object.entries(headers)) {
    if (k.toLowerCase() === key) return v;
  }
  return undefined;
}

/** Parse CSP string (semicolon-separated directives) into a map of directive -> values. */
function parseDirectives(csp: string): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  for (const part of csp.split(';')) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    const [name, ...rest] = trimmed.split(/\s+/g);
    out[name.toLowerCase()] = rest.filter(Boolean);
  }
  return out;
}

/** Apply enabled heuristic rules and return human-readable issues. */
function findIssues(
  csp: string | null,
  directives: Record<string, string[]>,
  cfg: {
    requireCsp: boolean;
    rules: Record<string, boolean>;
  }
): CspIssue[] {
  const issues: CspIssue[] = [];

  if (!csp) {
    if (cfg.requireCsp) {
      issues.push({
        code: 'CSP_MISSING',
        message: 'Missing Content-Security-Policy (header or meta).',
      });
    }
    return issues;
  }

  if (cfg.rules.requireDefaultSrc && !directives['default-src']) {
    issues.push({
      code: 'DEFAULT_SRC_MISSING',
      message: 'CSP is missing default-src directive.',
    });
  }

  const allValues = Object.values(directives).flat();
  const hasUnsafeInline = allValues.includes("'unsafe-inline'");
  const hasUnsafeEval = allValues.includes("'unsafe-eval'");
  const hasWildcard = allValues.includes('*');

  if (cfg.rules.disallowUnsafeInline && hasUnsafeInline) {
    issues.push({
      code: 'UNSAFE_INLINE',
      message: "CSP contains 'unsafe-inline'.",
    });
  }

  if (cfg.rules.disallowUnsafeEval && hasUnsafeEval) {
    issues.push({
      code: 'UNSAFE_EVAL',
      message: "CSP contains 'unsafe-eval'.",
    });
  }

  if (cfg.rules.disallowWildcardSources && hasWildcard) {
    issues.push({
      code: 'WILDCARD_SOURCE',
      message: 'CSP contains wildcard source (*).',
    });
  }

  // Heuristic: if script-src exists and unsafe-inline is disallowed, encourage nonce/hash.
  if (cfg.rules.disallowUnsafeInline && directives['script-src']) {
    const scriptValues = directives['script-src'];
    const hasNonceOrHash = scriptValues.some(
      v =>
        v.startsWith("'nonce-") ||
        v.startsWith("'sha256-") ||
        v.startsWith("'sha384-") ||
        v.startsWith("'sha512-")
    );
    if (!hasNonceOrHash) {
      issues.push({
        code: 'NONCE_OR_HASH_MISSING',
        message: "script-src is present but doesn't contain nonce/hash sources (heuristic).",
      });
    }
  }

  return issues;
}

/**
 * Reads CSP from response headers for the current page URL.
 * Falls back to meta tag when response header is not present.
 */
async function getCspFromPage(
  page: Page,
  preferNavigationResponse: boolean
): Promise<string | null> {
  const url = page.url();

  if (preferNavigationResponse) {
    try {
      const navResp = await page.waitForResponse(
        resp => resp.url() === url && resp.request().resourceType() === 'document',
        { timeout: 1000 }
      );
      const headers = await navResp.allHeaders();
      const csp = safeGetHeader(headers as any, 'content-security-policy');
      if (csp) return csp;
    } catch {
      // ignore
    }
  }

  // Fallback: separate request
  const res = await page.request.get(url, { maxRedirects: 10 });
  const cspHeader = safeGetHeader(res.headers() as any, 'content-security-policy');
  if (cspHeader) return cspHeader;

  // Fallback: meta tag
  try {
    const meta = await page.locator('meta[http-equiv="Content-Security-Policy"]').first();
    if (await meta.count()) {
      const content = await meta.getAttribute('content');
      if (content) return content;
    }
  } catch {
    // ignore
  }

  return null;
}

/**
 * Runs a basic CSP evaluation on the current page and writes a report under `build/cspCheck/`.
 *
 * It reads CSP from the `Content-Security-Policy` response header (fallback: meta tag) and applies
 * basic heuristic rules (configurable).
 *
 * @param page Playwright Page. Must already be navigated (page.url() must be non-empty).
 * @param overrides Optional per-test overrides (rules, requireCsp, etc.).
 *
 * @throws Error when CSP issues are found (based on enabled rules).
 *
 * @example
 * await page.goto('https://example.com');
 * await runCspCheck(page);
 *
 * @example
 * // Strict mode (typical for production apps)
 * await runCspCheck(page, {
 *   requireCsp: true,
 *   rules: {
 *     disallowUnsafeInline: true,
 *     disallowUnsafeEval: true,
 *     disallowWildcardSources: true,
 *     requireDefaultSrc: true,
 *   },
 * });
 */
export async function runCspCheck(page: Page, overrides?: CspCheckOverrides): Promise<void> {
  const url = page.url();
  if (!url) throw new Error('runCspCheck: url is empty. Did you call page.goto(...) first?');

  const merged = {
    ...cspCheckConfig,
    ...(overrides ?? {}),
    rules: {
      ...cspCheckConfig.rules,
      ...(overrides?.rules ?? {}),
    },
  };

  await pwt.step(`CSP check on ${url}`, async () => {
    const csp = await getCspFromPage(page, merged.preferNavigationResponse);
    const directives = csp ? parseDirectives(csp) : {};

    const issues = findIssues(csp, directives, {
      requireCsp: merged.requireCsp,
      rules: merged.rules as any,
    });

    const reportDir = path.join(buildDir, 'cspCheck');
    fs.mkdirSync(reportDir, { recursive: true });

    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeUrl = url
      .replace(/^https?:\/\//, '')
      .replace(/\/+$/, '')
      .replace(/[^a-zA-Z0-9-_./]/g, '_')
      .replace(/[\/]/g, '_')
      .slice(0, 120);

    const baseName = `csp_${safeUrl}_${stamp}`;
    const jsonPath = path.join(reportDir, `${baseName}.json`);
    const mdPath = path.join(reportDir, `${baseName}.md`);

    const payload = {
      startedAt: stamp,
      url,
      config: {
        preferNavigationResponse: merged.preferNavigationResponse,
        requireCsp: merged.requireCsp,
        rules: merged.rules,
        includeDirectivesInReport: merged.includeDirectivesInReport,
      },
      hasCsp: Boolean(csp),
      issues,
      directives: merged.includeDirectivesInReport ? directives : undefined,
      csp: csp ?? undefined,
    };

    const generatedOn = new Date().toLocaleString('pl-PL');
    const md = [
      `# CSP Report  `,
      `*Generated on ${generatedOn}*`,
      ``,
      `**URL:** ${url}`,
      ``,
      `## Summary`,
      ``,
      `| Metric | Count |`,
      `|--------|------:|`,
      `| Issues | ${issues.length} |`,
      ``,
      `---`,
      ``,
      `## Issues`,
      issues.length ? issues.map(i => `- **${i.code}** – ${i.message}`).join('\n') : '✅ _None_',
      ``,
    ].join('\n');

    fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2), 'utf8');
    fs.writeFileSync(mdPath, md, 'utf8');

    if (issues.length) {
      const details = issues.map((i, idx) => `${idx + 1}) ${i.code} - ${i.message}`).join('\n');
      throw new Error(
        `CSP issues found on ${url}: issues=${issues.length}` +
          `\n\nIssues:\n${details}` +
          `\n\nDetailed reports saved to:\n  ${jsonPath}\n  ${mdPath}`
      );
    }
  });
}
