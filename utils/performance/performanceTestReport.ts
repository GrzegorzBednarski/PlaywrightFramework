import * as fs from 'fs';
import * as path from 'path';
import { buildDir } from '../../playwright.config';
import type { OverallPerformanceTestResult, CategoryScoreResult } from './performanceTest';
import { convertMarkdownToPdf } from '../mdToPdf';
import { performanceTestConfig } from '../../config/performanceTestConfig';
import {
  performanceDevicesConfig,
  type PerformanceDeviceKey,
} from '../../config/performanceDevicesConfig';
import {
  formatChromeFlagsForReport,
  formatExtraHeadersKeysForReport,
  formatExtraLighthouseFlagsForReport,
  isHideSensitiveDataEnabled,
} from './performanceReportUtils';

const PERFORMANCE_REPORT_DIR = path.join(buildDir, 'performance-test-reports');

/**
 * Format a score cell for Markdown table output.
 */
function formatDetailedScore(categoryRes: CategoryScoreResult | undefined): string {
  if (!categoryRes) return 'N/A';
  const { score, passed } = categoryRes;
  const emoji = passed ? '✅' : '❌';
  const color = passed ? 'green' : 'red';
  return `<span style="color:${color}">${score.toFixed(1)}% ${emoji}</span>`;
}

const allCategoriesDef = [
  { key: 'performance', label: 'Performance' },
  { key: 'accessibility', label: 'Accessibility' },
  { key: 'bestPractices', label: 'Best Practices' },
  { key: 'seo', label: 'SEO' },
  { key: 'pwa', label: 'PWA' },
] as const;

function stringifyProfileKey(
  categories: readonly string[],
  thresholds: Record<string, number>
): string {
  const cats = [...categories].sort().join(',');
  const th = Object.keys(thresholds)
    .sort()
    .map(k => `${k}:${thresholds[k]}`)
    .join(',');
  return `${cats}||${th}`;
}

function computeMainProfileKey(): string {
  const mainCats = (performanceTestConfig.onlyCategories || []) as readonly string[];
  const mainThresholds = performanceTestConfig.thresholds as Record<string, number>;
  const thByCat: Record<string, number> = {};
  mainCats.forEach(c => (thByCat[c] = mainThresholds[c] ?? 0));
  return stringifyProfileKey(mainCats, thByCat);
}

function computeProfileLabelForKey(profileKey: string, allProfileKeys: readonly string[]): string {
  const mainKey = computeMainProfileKey();
  if (profileKey === mainKey) return 'Main config';

  const overrideKeys = Array.from(new Set(allProfileKeys))
    .filter(k => k !== mainKey)
    .sort();

  const idx = overrideKeys.indexOf(profileKey);
  return idx >= 0 ? `Override profile ${idx + 1}` : 'Override profile';
}

function collectAllUsedDevicesFromConfig(): PerformanceDeviceKey[] {
  const global = (performanceTestConfig.devices || ['desktop']) as readonly PerformanceDeviceKey[];
  const perUrl = (performanceTestConfig.urlsToTest || []).flatMap((u: any) =>
    u.devices ? (u.devices as readonly PerformanceDeviceKey[]) : []
  );

  return Array.from(new Set([...global, ...perUrl]));
}

function buildConfigSummaryMarkdown(): string {
  const lines: string[] = [];
  const hideSensitive = isHideSensitiveDataEnabled('test');

  lines.push('<div style="page-break-before: always;"></div>');
  lines.push('');
  lines.push('## Configuration summary');
  lines.push('');

  lines.push('### Main config');
  lines.push('');
  lines.push(`- devices: ${(performanceTestConfig.devices || []).join(', ')}`);
  lines.push(`- logs: ${String(performanceTestConfig.logs)}`);
  lines.push(`- onlyCategories: ${(performanceTestConfig.onlyCategories || []).join(', ')}`);

  const th = performanceTestConfig.thresholds as any;
  lines.push(
    `- thresholds: performance=${th.performance}, accessibility=${th.accessibility}, bestPractices=${th.bestPractices}, seo=${th.seo}, pwa=${th.pwa}`
  );

  lines.push(
    `- skipAudits: ${((performanceTestConfig as any).skipAudits || []).join(', ') || 'none'}`
  );

  const mainHeaderKeys = Object.keys(performanceTestConfig.extraHeaders || {});
  lines.push(`- extraHeaders: ${formatExtraHeadersKeysForReport(mainHeaderKeys, hideSensitive)}`);

  lines.push(
    `- extraLighthouseFlags: ${formatExtraLighthouseFlagsForReport(
      performanceTestConfig.extraLighthouseFlags || [],
      hideSensitive
    )}`
  );

  lines.push('');

  lines.push('### Per-URL overrides');
  lines.push('');

  const mainCats = (performanceTestConfig.onlyCategories || []) as readonly string[];
  const mainThresholds = performanceTestConfig.thresholds as Record<string, number>;

  const allKeysFromConfig = (performanceTestConfig.urlsToTest as unknown as readonly any[]).map(
    u => {
      const cats = (u.onlyCategories || mainCats) as readonly string[];
      const th = (u.thresholds || mainThresholds) as Record<string, number>;
      const thByCat: Record<string, number> = {};
      cats.forEach(c => (thByCat[c] = th[c] ?? 0));
      return stringifyProfileKey(cats, thByCat);
    }
  );

  const profileLabelForKey = (key: string) => computeProfileLabelForKey(key, allKeysFromConfig);

  const urls = performanceTestConfig.urlsToTest as unknown as readonly any[];
  urls.forEach(u => {
    const overrides: string[] = [];

    if (u.devices) overrides.push(`devices: ${(u.devices as any[]).join(', ')}`);
    if (typeof u.logs === 'boolean') overrides.push(`logs: ${u.logs}`);
    if (u.onlyCategories)
      overrides.push(`onlyCategories: ${(u.onlyCategories as any[]).join(', ')}`);

    if (u.thresholds) {
      const t = u.thresholds;
      overrides.push(
        `thresholds: performance=${t.performance}, accessibility=${t.accessibility}, bestPractices=${t.bestPractices}, seo=${t.seo}, pwa=${t.pwa}`
      );
    }

    if (u.skipAudits) overrides.push(`skipAudits: ${(u.skipAudits as any[]).join(', ')}`);

    if (u.extraHeaders) {
      const headerKeys = Object.keys(u.extraHeaders);
      overrides.push(`extraHeaders: ${formatExtraHeadersKeysForReport(headerKeys, hideSensitive)}`);
    }

    if (u.extraLighthouseFlags)
      overrides.push(
        `extraLighthouseFlags: ${formatExtraLighthouseFlagsForReport(
          u.extraLighthouseFlags as any[],
          hideSensitive
        )}`
      );

    if (u.chrome) {
      const headlessText =
        typeof u.chrome.headless === 'boolean' ? `headless=${u.chrome.headless}` : 'headless=?';

      const flags = Array.isArray(u.chrome.flags) ? (u.chrome.flags as string[]) : [];
      const flagsText = formatChromeFlagsForReport(flags, hideSensitive);

      overrides.push(`chrome: ${headlessText}; ${flagsText}`);
    }

    const cats = ((u.onlyCategories || mainCats) as readonly string[]).slice();
    const th = (u.thresholds || mainThresholds) as Record<string, number>;
    const thByCat: Record<string, number> = {};
    cats.forEach(c => (thByCat[c] = th[c] ?? 0));
    const profileKey = stringifyProfileKey(cats, thByCat);
    const profileLabel = profileLabelForKey(profileKey);

    if (!overrides.length) return;

    const nameWithProfile =
      profileLabel === 'Main config' ? `${u.name}` : `[${profileLabel}] ${u.name}`;

    lines.push(`- **${nameWithProfile}**`);
    overrides.forEach(o => lines.push(`  - ${o}`));
  });

  lines.push('');

  return lines.join('\n');
}

/**
 * Generate a Markdown summary report for performance tests.
 *
 * The report is later converted to PDF by {@link writePerformanceTestSummaryReport}.
 */
export function generatePerformanceTestMarkdownReport(
  overall: OverallPerformanceTestResult
): string {
  const devices = collectAllUsedDevicesFromConfig();

  const lines: string[] = [];

  const dateStr = new Date(overall.finishedAt).toLocaleString();
  lines.push(
    `<h1 style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 20px;">
      <span>Performance Test Summary</span>
      <span style="font-size: 12px; font-weight: normal; color: #555;">${dateStr}</span>
    </h1>`
  );

  if (devices.length === 1) {
    const device = devices[0];
    const formFactorConfig = performanceDevicesConfig[device];
    if (formFactorConfig) {
      const screen = formFactorConfig.screenEmulation;
      lines.push(`Screen resolution: ${screen.width}x${screen.height}`);
      lines.push(`Device scale factor: ${screen.deviceScaleFactor}x`);
      lines.push(`Mobile emulation: ${screen.mobile ? 'enabled' : 'disabled'}`);
    }
  } else {
    lines.push('');
    lines.push('Device configurations:');
    devices.forEach(d => {
      const cfg = performanceDevicesConfig[d];
      if (cfg) {
        lines.push(
          `- ${d}: ${cfg.screenEmulation.width}x${cfg.screenEmulation.height} (${
            cfg.screenEmulation.mobile ? 'mobile' : 'desktop'
          })`
        );
      }
    });
  }
  lines.push('');

  lines.push(`## Results [Environment: ${overall.env}]`);
  lines.push('');

  const groups = new Map<
    string,
    {
      categories: string[];
      thresholdsByCategory: Record<string, number>;
      results: typeof overall.results;
    }
  >();

  const allProfileKeys: string[] = [];

  overall.results.forEach(result => {
    const categories = result.categories.map(c => c.category);
    const thresholdsByCategory: Record<string, number> = {};
    result.categories.forEach(c => {
      thresholdsByCategory[c.category] = c.threshold;
    });

    const key = stringifyProfileKey(categories, thresholdsByCategory);
    allProfileKeys.push(key);

    const existing = groups.get(key);
    if (existing) {
      existing.results.push(result);
      return;
    }

    groups.set(key, {
      categories,
      thresholdsByCategory,
      results: [result],
    });
  });

  const mainKey = computeMainProfileKey();
  const sortedKeys = Array.from(groups.keys()).sort((a, b) => {
    if (a === mainKey && b !== mainKey) return -1;
    if (b === mainKey && a !== mainKey) return 1;
    return a.localeCompare(b);
  });

  for (const profileKey of sortedKeys) {
    const group = groups.get(profileKey)!;
    const label = computeProfileLabelForKey(profileKey, allProfileKeys);

    lines.push(`### Results table (${label})`);
    lines.push('');

    const activeDefs = allCategoriesDef
      .filter(def => group.categories.includes(def.key))
      .slice()
      .sort((a, b) => a.label.localeCompare(b.label));

    const headerCells = ['Page', 'Device'];
    activeDefs.forEach(def => {
      const thresholdVal = group.thresholdsByCategory[def.key] ?? 0;
      headerCells.push(`${def.label} (>=${thresholdVal}%)`);
    });
    lines.push(`| ${headerCells.join(' | ')} |`);

    const separatorCells = headerCells.map(title =>
      title === 'Page' || title === 'Device' ? '----' : ':---:'
    );
    lines.push(`| ${separatorCells.join(' | ')} |`);

    const sortedRows = [...group.results].sort((a, b) => {
      const byName = a.name.localeCompare(b.name);
      return byName !== 0 ? byName : a.device.localeCompare(b.device);
    });

    sortedRows.forEach(result => {
      const rowCells = [`[${result.name}](${result.url})`, result.device];

      activeDefs.forEach(def => {
        const catResult = result.categories.find(c => c.category === def.key);
        rowCells.push(formatDetailedScore(catResult));
      });

      lines.push(`| ${rowCells.join(' | ')} |`);
    });

    lines.push('');
  }

  lines.push('## Summary');
  lines.push('');

  const allPassed = overall.allPassed;
  const summaryColor = allPassed ? 'green' : 'red';
  const summaryEmoji = allPassed ? '✅' : '❌';
  const resultPrefix = allPassed ? '[PASS]' : '[FAIL]';
  const summaryText = allPassed
    ? 'All performance tests completed successfully.'
    : 'Some performance tests did not meet the threshold requirements.';

  lines.push(
    `<div style="color:${summaryColor}; font-size:12px; font-weight:bold">${summaryEmoji} ${resultPrefix} ${summaryText}</div>`
  );
  lines.push('');

  const configSummaryMarkdown = buildConfigSummaryMarkdown();
  lines.push(configSummaryMarkdown);

  return lines.join('\n');
}

/**
 * Write performance test summary reports (Markdown + PDF).
 *
 * Files are written under `build/performance-test-reports/`.
 */
export async function writePerformanceTestSummaryReport(
  overall: OverallPerformanceTestResult
): Promise<void> {
  if (!fs.existsSync(PERFORMANCE_REPORT_DIR)) {
    fs.mkdirSync(PERFORMANCE_REPORT_DIR, { recursive: true });
  }

  const markdown = generatePerformanceTestMarkdownReport(overall);
  const markdownPath = path.join(PERFORMANCE_REPORT_DIR, 'performance-test-summary.md');
  fs.writeFileSync(markdownPath, markdown, 'utf-8');

  const cssPath = path.join(__dirname, 'performance-report.css');

  try {
    await convertMarkdownToPdf(markdownPath, { cssPath });
  } catch (err) {
    console.error('Error generating PDF report:', err);
  }
}
