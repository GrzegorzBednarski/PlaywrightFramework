import { Page, test as pwt } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';
import { HtmlValidate } from 'html-validate';
import type { RuleConfig } from 'html-validate';

import { buildDir } from '../../playwright.config';
import { htmlValidatorConfig } from '../../config/htmlValidatorConfig';

export type HtmlValidateOverrides = {
  /** Override html-validate presets used as `extends`. */
  presets?: string[];

  /** Override html-validate rules (`true`=enabled, `false`=disabled). */
  rules?: Record<string, boolean>;

  /** Ignore selected ruleIds in reporting/failing (`true` = ignore). */
  ignoredRules?: Record<string, boolean>;

  /** Include full HTML in JSON report (can be large). */
  includeHtmlInReport?: boolean;
};

type HtmlValidateIssue = {
  ruleId: string;
  message: string;
  severity: 'error' | 'warning';
  line?: number;
  column?: number;
  selector?: string;
};

function buildMarkdown(url: string, createdAt: string, issues: HtmlValidateIssue[]): string {
  const generatedOn = new Date().toLocaleString('pl-PL');

  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');

  const rows = issues
    .map(i => {
      const loc = typeof i.line === 'number' ? `${i.line}:${i.column ?? 0}` : '—';
      return `| ${i.severity.toUpperCase()} | ${i.ruleId} | ${loc} | ${i.message} |`;
    })
    .join('\n');

  return [
    `# HTML Validation Report  `,
    `*Generated on ${generatedOn}*`,
    ``,
    `**URL:** ${url}`,
    ``,
    `## Summary`,
    ``,
    `| Metric | Count |`,
    `|--------|------:|`,
    `| ❌ Errors | ${errors.length} |`,
    `| ⚠️ Warnings | ${warnings.length} |`,
    `| Total | ${issues.length} |`,
    ``,
    `---`,
    ``,
    `## Issues`,
    issues.length
      ? [
          `| Severity | Rule | Location | Message |`,
          `|----------|------|----------|---------|`,
          rows,
        ].join('\n')
      : '✅ _None_',
    ``,
  ].join('\n');
}

/**
 * Validate rendered HTML for the current page and write a report under `build/htmlValidator/`.
 *
 * @param page Playwright Page. Must already be navigated (page.url() must be non-empty).
 * @param overrides Optional per-test overrides.
 *
 * @throws Error when validation issues with severity "error" are found.
 *
 * @example
 * await page.goto('https://example.com');
 * await runHtmlValidate(page);
 */
export async function runHtmlValidate(
  page: Page,
  overrides?: HtmlValidateOverrides
): Promise<void> {
  const url = page.url();
  if (!url) throw new Error('runHtmlValidate: url is empty. Did you call page.goto(...) first?');

  const merged = {
    ...htmlValidatorConfig,
    ...(overrides ?? {}),
    presets: overrides?.presets ?? htmlValidatorConfig.presets,
    rules: {
      ...htmlValidatorConfig.rules,
      ...(overrides?.rules ?? {}),
    },
    ignoredRules: {
      ...htmlValidatorConfig.ignoredRules,
      ...(overrides?.ignoredRules ?? {}),
    },
  };

  await pwt.step(`HTML validate on ${url}`, async () => {
    const html = await page.content();

    // html-validate expects rule config as severities.
    const rules = Object.fromEntries(
      Object.entries(merged.rules).map(([ruleId, enabled]) => [ruleId, enabled ? 'error' : 'off'])
    ) as RuleConfig;

    // The `HtmlValidate` constructor typing differs between versions.
    // Creating the validator without a config is compatible across versions.
    const validator = new HtmlValidate();

    const report = await validator.validateString(html, {
      extends: [...(merged.presets ?? ['html-validate:recommended'])],
      rules,
    });
    const allIssues: HtmlValidateIssue[] = report.results
      .flatMap(r => r.messages)
      .map(m => ({
        ruleId: String(m.ruleId ?? 'unknown'),
        message: String(m.message ?? ''),
        severity: m.severity === 2 ? 'error' : 'warning',
        line: m.line,
        column: m.column,
        selector: typeof (m as any).selector === 'string' ? (m as any).selector : undefined,
      }));

    const issues = allIssues.filter(i => !merged.ignoredRules?.[i.ruleId]);

    const errors = issues.filter(i => i.severity === 'error');

    const reportDir = path.join(buildDir, 'htmlValidator');
    fs.mkdirSync(reportDir, { recursive: true });

    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const safeUrl = url
      .replace(/^https?:\/\//, '')
      .replace(/\/+$/, '')
      .replace(/[^a-zA-Z0-9-_./]/g, '_')
      .replace(/[\/]/g, '_')
      .slice(0, 120);

    const baseName = `html-validate_${safeUrl}_${stamp}`;
    const jsonPath = path.join(reportDir, `${baseName}.json`);
    const mdPath = path.join(reportDir, `${baseName}.md`);

    const payload = {
      startedAt: stamp,
      url,
      config: {
        presets: merged.presets,
        rules: merged.rules,
        ignoredRules: merged.ignoredRules,
        includeHtmlInReport: merged.includeHtmlInReport,
      },
      summary: {
        errors: errors.length,
        warnings: issues.length - errors.length,
        total: issues.length,
      },
      issues,
      html: merged.includeHtmlInReport ? html : undefined,
    };

    fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2), 'utf8');
    fs.writeFileSync(mdPath, buildMarkdown(url, stamp, issues), 'utf8');

    if (errors.length) {
      const lines = issues.map((i, idx) => {
        const loc = typeof i.line === 'number' ? `${i.line}:${i.column ?? 0}` : '—';
        return `${idx + 1}) [${i.severity}] ${i.ruleId} @ ${loc} - ${i.message}`;
      });

      throw new Error(
        `HTML validation errors found on ${url}: errors=${errors.length}, warnings=${issues.length - errors.length}` +
          `\n\nIssues:\n${lines.join('\n')}` +
          `\n\nDetailed reports saved to:\n  ${jsonPath}\n  ${mdPath}`
      );
    }
  });
}
