import * as fs from 'fs';
import * as path from 'path';
import { convertMarkdownToPdf } from '../mdToPdf';
import { performanceMonitoringConfig } from '../../config/performanceMonitoringConfig';
import type { OverallMonitoringResult, MonitoringRunScores } from './performanceMonitoring';
import { buildDir } from '../../playwright.config';
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

const MONITORING_REPORT_DIR = path.join(buildDir, 'performance-monitoring-reports');

/**
 * Format a score for report output.
 */
function formatScore(score: number | undefined): string {
  return score !== undefined ? `${score.toFixed(1)}%` : 'N/A';
}

/**
 * Calculate basic statistics for a list of numeric values.
 */
function calculateStatistics(values: number[]): {
  min: number;
  max: number;
  average: number;
  median: number;
  standardDeviation: number;
} | null {
  if (!values.length) return null;

  const sorted = [...values].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  const average = sum / sorted.length;
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  const variance = sorted.reduce((acc, v) => acc + Math.pow(v - average, 2), 0) / sorted.length;
  const stdDev = Math.sqrt(variance);

  return {
    min: Number(min.toFixed(1)),
    max: Number(max.toFixed(1)),
    average: Number(average.toFixed(1)),
    median: Number(median.toFixed(1)),
    standardDeviation: Number(stdDev.toFixed(1)),
  };
}

/**
 * Extract numeric values for a given metric key from all monitoring runs.
 */
function extractRunValues(
  scoresPerRun: MonitoringRunScores[],
  key: keyof MonitoringRunScores
): number[] {
  return scoresPerRun
    .map(run => run[key])
    .filter((v): v is number => v !== undefined && !Number.isNaN(v));
}

function collectAllUsedMonitoringDevicesFromConfig(): PerformanceDeviceKey[] {
  const global = (performanceMonitoringConfig.devices || [
    'desktop',
  ]) as readonly PerformanceDeviceKey[];
  const perUrl = (performanceMonitoringConfig.urlsToMonitor || []).flatMap((u: any) =>
    u.devices ? (u.devices as readonly PerformanceDeviceKey[]) : []
  );

  return Array.from(new Set([...global, ...perUrl]));
}

const allCategoriesDef = [
  { key: 'performance', label: 'Performance' },
  { key: 'accessibility', label: 'Accessibility' },
  { key: 'bestPractices', label: 'Best Practices' },
  { key: 'seo', label: 'SEO' },
  { key: 'pwa', label: 'PWA' },
] as const;

type CategoryKey = (typeof allCategoriesDef)[number]['key'];

type CategoriesKeyString = string;

function stringifyCategoriesKey(categories: readonly string[]): CategoriesKeyString {
  return [...categories].sort().join(',');
}

function getCategoriesUsedInResult(result: OverallMonitoringResult['results'][number]): string[] {
  return Object.entries(result.aggregatedScores)
    .filter(([, v]) => v !== undefined)
    .map(([k]) => k);
}

function computeMainCategoriesKey(): CategoriesKeyString {
  const mainCats = (performanceMonitoringConfig.onlyCategories || []) as readonly string[];
  return stringifyCategoriesKey(mainCats);
}

function computeProfileLabelForCategoriesKey(
  categoriesKey: CategoriesKeyString,
  allCategoryKeys: readonly CategoriesKeyString[]
): string {
  const mainKey = computeMainCategoriesKey();
  if (categoriesKey === mainKey) return 'Main config';

  const overrideKeys = Array.from(new Set(allCategoryKeys))
    .filter(k => k !== mainKey)
    .sort();

  const idx = overrideKeys.indexOf(categoriesKey);
  return idx >= 0 ? `Override profile ${idx + 1}` : 'Override profile';
}

function buildMonitoringConfigSummaryMarkdown(): string {
  const lines: string[] = [];
  const hideSensitive = isHideSensitiveDataEnabled('monitoring');

  lines.push('<div style="page-break-before: always;"></div>');
  lines.push('');
  lines.push('## Configuration summary');
  lines.push('');

  lines.push('### Main config');
  lines.push('');
  lines.push(`- devices: ${(performanceMonitoringConfig.devices || []).join(', ')}`);
  lines.push(`- logs: ${String(performanceMonitoringConfig.logs)}`);
  lines.push(`- numberOfRuns: ${performanceMonitoringConfig.numberOfRuns}`);
  lines.push(`- onlyCategories: ${(performanceMonitoringConfig.onlyCategories || []).join(', ')}`);

  lines.push(
    `- skipAudits: ${((performanceMonitoringConfig as any).skipAudits || []).join(', ') || 'none'}`
  );

  const mainHeaderKeys = Object.keys(performanceMonitoringConfig.extraHeaders || {});
  lines.push(`- extraHeaders: ${formatExtraHeadersKeysForReport(mainHeaderKeys, hideSensitive)}`);

  lines.push(
    `- extraLighthouseFlags: ${formatExtraLighthouseFlagsForReport(
      performanceMonitoringConfig.extraLighthouseFlags || [],
      hideSensitive
    )}`
  );
  lines.push('');

  lines.push('### Per-URL overrides');
  lines.push('');

  const urls = performanceMonitoringConfig.urlsToMonitor as unknown as readonly any[];
  const mainCats = (performanceMonitoringConfig.onlyCategories || []) as readonly string[];

  const allKeysFromConfig = urls.map(u =>
    stringifyCategoriesKey((u.onlyCategories || mainCats) as readonly string[])
  );

  urls.forEach(u => {
    const overrides: string[] = [];

    if (u.devices) overrides.push(`devices: ${(u.devices as any[]).join(', ')}`);
    if (typeof u.logs === 'boolean') overrides.push(`logs: ${u.logs}`);
    if (typeof u.numberOfRuns === 'number') overrides.push(`numberOfRuns: ${u.numberOfRuns}`);
    if (u.onlyCategories)
      overrides.push(`onlyCategories: ${(u.onlyCategories as any[]).join(', ')}`);
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

    const catsForUrl = (u.onlyCategories || mainCats) as readonly string[];
    const key = stringifyCategoriesKey(catsForUrl);
    const label = computeProfileLabelForCategoriesKey(key, allKeysFromConfig);

    if (!overrides.length) return;

    const nameWithProfile = label === 'Main config' ? `${u.name}` : `[${label}] ${u.name}`;

    lines.push(`- **${nameWithProfile}**`);
    overrides.forEach(o => lines.push(`  - ${o}`));
  });

  lines.push('');

  return lines.join('\n');
}

/**
 * Generate a Markdown summary report for performance monitoring (aggregated medians + raw stats).
 */
export function generateMonitoringMarkdownReport(overall: OverallMonitoringResult): string {
  const devices = collectAllUsedMonitoringDevicesFromConfig();

  const lines: string[] = [];

  const dateStr = new Date(overall.finishedAt).toLocaleString();
  lines.push(
    `<h1 style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 20px;">
      <span>Performance Monitoring Summary</span>
      <span style="font-size: 12px; font-weight: normal; color: #555;">${dateStr}</span>
    </h1>`
  );

  lines.push('');

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

  lines.push(`## Aggregated Results (Median Scores) [Environment: ${overall.env}]`);
  lines.push('');

  const groups = new Map<CategoriesKeyString, OverallMonitoringResult['results']>();
  const allCategoryKeysFromResults: CategoriesKeyString[] = [];

  overall.results.forEach(result => {
    const categoriesForResult = getCategoriesUsedInResult(result);
    const key = stringifyCategoriesKey(categoriesForResult);
    allCategoryKeysFromResults.push(key);

    const existing = groups.get(key);
    if (existing) {
      existing.push(result);
    } else {
      groups.set(key, [result]);
    }
  });

  const mainKey = computeMainCategoriesKey();
  const sortedKeys = Array.from(groups.keys()).sort((a, b) => {
    if (a === mainKey && b !== mainKey) return -1;
    if (b === mainKey && a !== mainKey) return 1;
    return a.localeCompare(b);
  });

  for (const categoriesKey of sortedKeys) {
    const results = groups.get(categoriesKey)!;
    const profileLabel = computeProfileLabelForCategoriesKey(
      categoriesKey,
      allCategoryKeysFromResults
    );

    lines.push(`### Aggregated results table (${profileLabel})`);
    lines.push('');

    const categories = categoriesKey ? categoriesKey.split(',').filter(Boolean) : [];
    const activeDefs = allCategoriesDef
      .filter(def => categories.includes(def.key))
      .slice()
      .sort((a, b) => a.label.localeCompare(b.label));

    const headerCells = ['Page', 'Device', ...activeDefs.map(d => d.label)];
    lines.push(`| ${headerCells.join(' | ')} |`);

    const separatorCells = headerCells.map((_, index) => (index < 2 ? '----' : ':---:'));
    lines.push(`| ${separatorCells.join(' | ')} |`);

    const sortedRows = [...results].sort((a, b) => {
      const byName = a.name.localeCompare(b.name);
      return byName !== 0 ? byName : a.device.localeCompare(b.device);
    });

    sortedRows.forEach(result => {
      const { name, url, device, aggregatedScores } = result;

      const rowCells = [`[${name}](${url})`, device];
      activeDefs.forEach(def => {
        rowCells.push(formatScore(aggregatedScores[def.key as CategoryKey]));
      });

      lines.push(`| ${rowCells.join(' | ')} |`);
    });

    lines.push('');
  }

  lines.push('## Raw Data and Statistics');
  lines.push('');

  const rawResultsSorted = [...overall.results].sort((a, b) => {
    const byName = a.name.localeCompare(b.name);
    return byName !== 0 ? byName : a.device.localeCompare(b.device);
  });

  rawResultsSorted.forEach(result => {
    const { name, device, scoresPerRun, aggregatedScores } = result;

    const categoriesForResult = getCategoriesUsedInResult(result);
    const categoryKey = stringifyCategoriesKey(categoriesForResult);
    const profileLabel = computeProfileLabelForCategoriesKey(
      categoryKey,
      allCategoryKeysFromResults
    );

    lines.push(`### ${name} [${device}] [runs:${result.runs}] (${profileLabel})`);
    lines.push('');

    lines.push('| Metric | Values | Median | Min | Max | Average | Std Dev |');
    lines.push('| ------ | ------ | :---: | :---: | :---: | :---: | :---: |');

    const rawCategories = categoriesForResult;
    const rawActiveDefs = allCategoriesDef.filter(def => rawCategories.includes(def.key));

    const rawActiveDefsSorted = [...rawActiveDefs].sort((a, b) => a.label.localeCompare(b.label));

    rawActiveDefsSorted.forEach(def => {
      const key = def.key;
      const values = extractRunValues(scoresPerRun, key);
      if (!values.length) return;
      const stats = calculateStatistics(values);
      if (!stats) return;

      const valuesStr = values.map(v => `[${v.toFixed(1)}]`).join(' ');

      lines.push(
        `| ${def.label} | ${valuesStr} | ${formatScore(aggregatedScores[key as CategoryKey])} | ` +
          `${stats.min.toFixed(1)}% | ${stats.max.toFixed(1)}% | ${stats.average.toFixed(1)}% | ${stats.standardDeviation.toFixed(1)}% |`
      );
    });

    lines.push('');
  });

  lines.push(buildMonitoringConfigSummaryMarkdown());

  return lines.join('\n');
}

/**
 * Generate a JSON summary report for performance monitoring.
 */
export function generateMonitoringJsonReport(overall: OverallMonitoringResult): {
  metadata: unknown;
  results: unknown;
} {
  const usedDevices = collectAllUsedMonitoringDevicesFromConfig();
  const hideSensitive = isHideSensitiveDataEnabled('monitoring');

  const urlsFromConfig = performanceMonitoringConfig.urlsToMonitor as unknown as readonly any[];

  const urlOverridesByName = new Map<string, any>();
  urlsFromConfig.forEach(u => urlOverridesByName.set(u.name, u));

  return {
    metadata: {
      generatedOn: new Date().toISOString(),
      environment: overall.env,
      usedDevices,
      numberOfRuns: performanceMonitoringConfig.numberOfRuns,
      aggregationMethod: 'median',
      categories: performanceMonitoringConfig.onlyCategories,
      skipAudits: (performanceMonitoringConfig as any).skipAudits,
      extraLighthouseFlags: hideSensitive
        ? (performanceMonitoringConfig.extraLighthouseFlags || []).length
          ? 'hidden'
          : []
        : performanceMonitoringConfig.extraLighthouseFlags,
      extraHeadersKeys: hideSensitive
        ? Object.keys(performanceMonitoringConfig.extraHeaders || {}).length
          ? 'hidden'
          : []
        : Object.keys(performanceMonitoringConfig.extraHeaders || {}),
      deviceDetails: usedDevices.map(d => ({
        device: d,
        config: performanceDevicesConfig[d],
      })),
    },
    results: overall.results.map(result => {
      const perMetricStats: Record<string, any> = {};

      (['performance', 'accessibility', 'bestPractices', 'seo', 'pwa'] as const).forEach(key => {
        const values = extractRunValues(result.scoresPerRun, key);
        const stats = calculateStatistics(values);
        if (stats) {
          perMetricStats[key] = stats;
        }
      });

      const u = urlOverridesByName.get(result.name) || {};

      const effective = {
        devices: u.devices ?? performanceMonitoringConfig.devices,
        logs: u.logs ?? performanceMonitoringConfig.logs,
        numberOfRuns: u.numberOfRuns ?? performanceMonitoringConfig.numberOfRuns,
        onlyCategories: u.onlyCategories ?? performanceMonitoringConfig.onlyCategories,
        skipAudits: u.skipAudits ?? (performanceMonitoringConfig as any).skipAudits,
        extraLighthouseFlags: hideSensitive
          ? (u.extraLighthouseFlags ?? performanceMonitoringConfig.extraLighthouseFlags)?.length
            ? 'hidden'
            : []
          : (u.extraLighthouseFlags ?? performanceMonitoringConfig.extraLighthouseFlags),
        extraHeadersKeys: hideSensitive
          ? Object.keys((u.extraHeaders ?? performanceMonitoringConfig.extraHeaders) || {}).length
            ? 'hidden'
            : []
          : Object.keys((u.extraHeaders ?? performanceMonitoringConfig.extraHeaders) || {}),
        chrome: (() => {
          const chrome = u.chrome ?? performanceMonitoringConfig.chrome;
          if (!chrome) return chrome;
          if (!hideSensitive) return chrome;
          const flags = Array.isArray((chrome as any).flags) ? (chrome as any).flags : [];
          return {
            ...chrome,
            flags: flags.length ? 'hidden' : [],
          };
        })(),
      };

      const overrides = {
        devices: u.devices,
        logs: u.logs,
        numberOfRuns: u.numberOfRuns,
        onlyCategories: u.onlyCategories,
        skipAudits: u.skipAudits,
        extraLighthouseFlags: hideSensitive
          ? u.extraLighthouseFlags?.length
            ? 'hidden'
            : undefined
          : u.extraLighthouseFlags,
        extraHeadersKeys: hideSensitive
          ? u.extraHeaders
            ? 'hidden'
            : undefined
          : u.extraHeaders
            ? Object.keys(u.extraHeaders)
            : undefined,
        chrome: (() => {
          if (!u.chrome) return undefined;
          if (!hideSensitive) return u.chrome;
          const flags = Array.isArray((u.chrome as any).flags) ? (u.chrome as any).flags : [];
          return {
            ...u.chrome,
            flags: flags.length ? 'hidden' : [],
          };
        })(),
      };

      return {
        name: result.name,
        url: result.url,
        device: result.device,
        runs: result.runs,
        aggregatedScores: result.aggregatedScores,
        statistics: perMetricStats,
        config: {
          effective,
          overrides,
        },
      };
    }),
  };
}

/**
 * Write monitoring reports (Markdown + JSON + PDF).
 *
 * Files are written under `build/performance-monitoring-reports/`.
 */
export async function writeMonitoringReports(
  overall: OverallMonitoringResult
): Promise<{ markdownPath: string; jsonPath: string; pdfPath: string | null }> {
  if (!fs.existsSync(MONITORING_REPORT_DIR)) {
    fs.mkdirSync(MONITORING_REPORT_DIR, { recursive: true });
  }

  const markdown = generateMonitoringMarkdownReport(overall);
  const markdownPath = path.join(MONITORING_REPORT_DIR, 'performance-monitoring-summary.md');
  fs.writeFileSync(markdownPath, markdown, 'utf-8');

  let pdfPath: string | null = null;
  const cssPath = path.join(__dirname, 'performance-report.css');

  try {
    pdfPath = await convertMarkdownToPdf(markdownPath, { cssPath });
  } catch (err) {
    console.error('Error generating PDF report:', err);
  }

  const json = generateMonitoringJsonReport(overall);
  const jsonPath = path.join(MONITORING_REPORT_DIR, 'performance-monitoring-summary.json');
  fs.writeFileSync(jsonPath, JSON.stringify(json, null, 2), 'utf-8');

  return { markdownPath, jsonPath, pdfPath };
}
