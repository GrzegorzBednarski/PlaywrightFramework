import * as fs from 'fs';
import * as path from 'path';
import { spawnSync } from 'child_process';
import { buildDir } from '../../playwright.config';
import { performanceMonitoringConfig } from '../../config/performanceMonitoringConfig';
import {
  performanceDevicesConfig,
  type PerformanceDeviceKey,
} from '../../config/performanceDevicesConfig';
import {
  buildPerformanceUrls,
  type BuiltPerformanceUrlConfig,
  type PerformanceCategory,
} from './urlBuilder';
import { writeMonitoringReports } from './performanceMonitoringReport';

const MONITORING_REPORT_DIR = path.join(buildDir, 'performance-monitoring-reports');
const MONITORING_DETAILED_DIR = path.join(MONITORING_REPORT_DIR, 'detailed-results');

interface LighthouseCategory {
  score: number | null;
}

interface LighthouseResultLike {
  categories?: Record<string, LighthouseCategory>;
}

interface RunLighthouseResult {
  lhr: LighthouseResultLike;
  jsonReportPath?: string;
  htmlReportPath?: string;
}

export interface MonitoringRunScores {
  performance?: number;
  accessibility?: number;
  bestPractices?: number;
  seo?: number;
  pwa?: number;
}

export interface UrlMonitoringAggregateResult {
  name: string;
  url: string;
  device: PerformanceDeviceKey;
  runs: number;
  scoresPerRun: MonitoringRunScores[];
  aggregatedScores: MonitoringRunScores;
}

export interface OverallMonitoringResult {
  env: string;
  startedAt: string;
  finishedAt: string;
  results: UrlMonitoringAggregateResult[];
}

/**
 * Ensure the monitoring report directories exist.
 */
function ensureMonitoringReportDirectory(): void {
  if (!fs.existsSync(MONITORING_REPORT_DIR)) {
    fs.mkdirSync(MONITORING_REPORT_DIR, { recursive: true });
  }
  if (!fs.existsSync(MONITORING_DETAILED_DIR)) {
    fs.mkdirSync(MONITORING_DETAILED_DIR, { recursive: true });
  }
}

/**
 * Remove monitoring reports from previous executions.
 */
export function cleanMonitoringReportDirectory(): void {
  if (!fs.existsSync(MONITORING_REPORT_DIR)) {
    return;
  }

  const entries = fs.readdirSync(MONITORING_REPORT_DIR);
  for (const entry of entries) {
    const fullPath = path.join(MONITORING_REPORT_DIR, entry);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      fs.rmSync(fullPath, { recursive: true, force: true });
    } else {
      fs.unlinkSync(fullPath);
    }
  }
}

/**
 * Sanitize a string for use as a filename segment.
 *
 * @param name Raw name.
 * @returns Sanitized filename-safe string.
 */
function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '');
}

/**
 * Build Lighthouse CLI args for monitoring runs.
 *
 * @param urlConfig Built URL config.
 * @param baseFilePath Base output path (without .report.* suffix).
 * @param deviceKey Device preset key.
 * @returns Array of CLI args for Lighthouse.
 */
function buildMonitoringLighthouseArgs(
  urlConfig: BuiltPerformanceUrlConfig,
  baseFilePath: string,
  deviceKey: PerformanceDeviceKey
): string[] {
  const args = [urlConfig.url];

  const logs = urlConfig.logs ?? performanceMonitoringConfig.logs;
  const chrome = urlConfig.chrome ?? performanceMonitoringConfig.chrome;
  const extraHeaders = urlConfig.extraHeaders ?? performanceMonitoringConfig.extraHeaders;
  const extraFlags =
    urlConfig.extraLighthouseFlags ?? performanceMonitoringConfig.extraLighthouseFlags;
  const skipAudits = urlConfig.skipAudits ?? (performanceMonitoringConfig as any).skipAudits;

  if (chrome?.headless) {
    const chromeFlags = ['--headless=new', ...((chrome.flags as string[]) || [])];
    args.push(`--chrome-flags=${chromeFlags.join(' ')}`);
  } else if (chrome?.flags?.length) {
    args.push(`--chrome-flags=${chrome.flags.join(' ')}`);
  }

  const formFactorConfig = performanceDevicesConfig[deviceKey];
  if (formFactorConfig) {
    args.push(`--form-factor=${formFactorConfig.formFactor}`);
    const screen = formFactorConfig.screenEmulation;
    args.push(`--screenEmulation.mobile=${screen.mobile}`);
    args.push(`--screenEmulation.width=${screen.width}`);
    args.push(`--screenEmulation.height=${screen.height}`);
    args.push(`--screenEmulation.deviceScaleFactor=${screen.deviceScaleFactor}`);
    args.push('--screenEmulation.disabled=false');
  }

  if (!logs) {
    args.push('--quiet');
  }

  const normalizedPath = baseFilePath.replace(/\\/g, '/');
  args.push('--output=html,json');
  args.push(`--output-path=${normalizedPath}`);

  const categories = (
    urlConfig.onlyCategories ||
    performanceMonitoringConfig.onlyCategories ||
    []
  ).map(cat => (cat === 'bestPractices' ? 'best-practices' : cat));
  if (categories.length > 0) {
    args.push(`--only-categories=${categories.join(',')}`);
  }

  if (skipAudits?.length) {
    args.push(`--skip-audits=${skipAudits.join(',')}`);
  }

  if (extraHeaders && Object.keys(extraHeaders as any).length > 0) {
    args.push(`--extra-headers=${JSON.stringify(extraHeaders)}`);
  }

  if (extraFlags?.length) {
    args.push(...extraFlags);
  }

  return args;
}

/**
 * Run Lighthouse for a single monitoring run.
 *
 * @param urlConfig Built URL config.
 * @param baseFilePath Base output path (without .report.* suffix).
 * @param deviceKey Device preset key.
 * @returns Lighthouse result-like object with parsed categories (from JSON report).
 */
function runMonitoringLighthouse(
  urlConfig: BuiltPerformanceUrlConfig,
  baseFilePath: string,
  deviceKey: PerformanceDeviceKey
): RunLighthouseResult {
  const args = buildMonitoringLighthouseArgs(urlConfig, baseFilePath, deviceKey);

  const lighthouseCliPath = require.resolve('lighthouse/cli/index.js');

  try {
    const logs = urlConfig.logs ?? performanceMonitoringConfig.logs;
    const stdio: 'inherit' | 'ignore' = logs ? 'inherit' : 'ignore';

    spawnSync(process.execPath, [lighthouseCliPath, ...args], {
      shell: false,
      encoding: 'utf8',
      stdio,
    });

    const jsonReportPath = `${baseFilePath}.report.json`;
    const htmlReportPath = `${baseFilePath}.report.html`;

    let lhr: LighthouseResultLike = {};

    if (fs.existsSync(jsonReportPath)) {
      try {
        const json = fs.readFileSync(jsonReportPath, 'utf8');
        lhr = JSON.parse(json);
      } catch (e) {
        console.error(`Error parsing Lighthouse JSON report for ${urlConfig.name}:`, e);
      }
    } else {
      console.error(`JSON report for ${urlConfig.name} not found at ${jsonReportPath}`);
    }

    return {
      lhr,
      jsonReportPath: fs.existsSync(jsonReportPath) ? jsonReportPath : undefined,
      htmlReportPath: fs.existsSync(htmlReportPath) ? htmlReportPath : undefined,
    };
  } catch (error) {
    console.error(`Error running Lighthouse for ${urlConfig.name} (${urlConfig.url}):`, error);
    return {
      lhr: {},
    };
  }
}

/**
 * Extract Lighthouse category scores as percentages (0-100).
 *
 * @param lhr Lighthouse result.
 */
function extractMonitoringScores(lhr: LighthouseResultLike): MonitoringRunScores {
  const categoryMap: Record<string, PerformanceCategory> = {
    performance: 'performance',
    accessibility: 'accessibility',
    'best-practices': 'bestPractices',
    seo: 'seo',
    pwa: 'pwa',
  };

  const scores: MonitoringRunScores = {};

  if (!lhr || !lhr.categories) {
    return scores;
  }

  for (const [key, category] of Object.entries(lhr.categories)) {
    const mapped = categoryMap[key];
    if (mapped && category.score != null) {
      scores[mapped] = Number((category.score * 100).toFixed(1));
    }
  }

  return scores;
}

/**
 * Calculate median of numeric values.
 *
 * @param values Values to aggregate.
 */
function calculateMedian(values: number[]): number | undefined {
  if (!values.length) return undefined;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

/**
 * Aggregate multiple runs into a single per-category result using median.
 *
 * @param runs Scores from each run.
 */
function aggregateScores(runs: MonitoringRunScores[]): MonitoringRunScores {
  const aggregated: MonitoringRunScores = {};

  const keys = ['performance', 'accessibility', 'bestPractices', 'seo', 'pwa'] as const;

  const sortedKeys: PerformanceCategory[] = [...keys].sort((a, b) => a.localeCompare(b));

  for (const key of sortedKeys) {
    const values = runs
      .map(run => run[key])
      .filter((v): v is number => v !== undefined && !Number.isNaN(v));

    const median = calculateMedian(values);
    if (median !== undefined) {
      aggregated[key] = Number(median.toFixed(1));
    }
  }

  return aggregated;
}

/**
 * Write an ephemeral status line (progress) to stdout.
 *
 * @param text Status text.
 */
function writeStatusLine(text: string) {
  const clearBuffer = ' '.repeat(150);
  process.stdout.write(`\r${clearBuffer}\r${text}`);
}

/** Clear the current status line. */
function clearStatusLine() {
  process.stdout.write('\r' + ' '.repeat(150) + '\r');
}

/**
 * Render a simple progress bar string for the current/total count.
 *
 * @param current Current index.
 * @param total Total count.
 */
function createProgressBar(current: number, total: number): string {
  const percentage = Math.round((current / total) * 100);
  const barLength = 20;
  const filledLength = Math.round((current / total) * barLength);
  const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
  return `  Running: [${bar}] ${current}/${total} (${percentage}%)`;
}

/**
 * Print a stable summary table for a single monitored URL.
 *
 * @param result Aggregated monitoring result.
 * @param categoriesToShow Categories to print.
 */
function printMonitoringResultTable(
  result: UrlMonitoringAggregateResult,
  categoriesToShow: ReadonlyArray<PerformanceCategory>
): void {
  const nameWidth = 25;
  const scoreWidth = 13; // "MEDIAN SCORE" label
  const totalWidth = nameWidth + scoreWidth + 5; // separators padding

  const deviceLabel = result.device;

  console.log(`Monitoring results for ${result.name} [${deviceLabel}] (${result.runs} runs):`);
  console.log(`URL: ${result.url}`);
  console.log('─'.repeat(totalWidth));

  console.log(`${'METRIC'.padEnd(nameWidth)} | ` + `${'MEDIAN SCORE'.padEnd(scoreWidth)}`);
  console.log('─'.repeat(totalWidth));

  categoriesToShow.forEach(category => {
    const value = result.aggregatedScores[category];
    const displayName =
      category === 'bestPractices'
        ? 'Best Practices'
        : category.charAt(0).toUpperCase() + category.slice(1);

    const medianText = value !== undefined ? `${value.toFixed(1)}%` : 'N/A';

    console.log(`${displayName.padEnd(nameWidth)} | ` + `${medianText.padEnd(scoreWidth)}`);
  });

  console.log('─'.repeat(totalWidth));
  console.log();
}

/**
 * Run monitoring for one URL on one device.
 *
 * Executes Lighthouse `numberOfRuns` times, aggregates scores (median), prints a console table,
 * and returns the aggregated result.
 *
 * @param urlConfig Built URL config.
 * @param deviceKey Device preset key.
 * @param numberOfRuns Number of Lighthouse runs.
 * @param index Progress index.
 * @param total Total runs to execute.
 * @returns Aggregated monitoring result for the URL and device.
 */
export async function runPerformanceMonitoringForUrl(
  urlConfig: BuiltPerformanceUrlConfig,
  deviceKey: PerformanceDeviceKey,
  numberOfRuns: number,
  index: number,
  total: number
): Promise<UrlMonitoringAggregateResult> {
  ensureMonitoringReportDirectory();

  const scoresPerRun: MonitoringRunScores[] = [];

  const deviceLabel = deviceKey;
  const runText = numberOfRuns === 1 ? 'run' : 'runs';
  const indexText = `[${index}/${total}]`;

  for (let runIndex = 0; runIndex < numberOfRuns; runIndex++) {
    const header = `${indexText} Monitoring page: ${urlConfig.name} [${deviceLabel}] (${numberOfRuns} ${runText})`;
    const progress = createProgressBar(runIndex, numberOfRuns);
    writeStatusLine(`${header}  ${progress}`);

    const fileBase = path.join(
      MONITORING_DETAILED_DIR,
      `${sanitizeFileName(urlConfig.name)}-${deviceKey}-run-${runIndex + 1}-${Date.now()}`
    );

    const { lhr } = runMonitoringLighthouse(urlConfig, fileBase, deviceKey);
    const scores = extractMonitoringScores(lhr);
    scoresPerRun.push(scores);

    const updatedProgress = createProgressBar(runIndex + 1, numberOfRuns);
    writeStatusLine(`${header}  ${updatedProgress}`);
  }

  const completedHeader = `${indexText} Monitoring page: ${urlConfig.name} [${deviceLabel}] (${numberOfRuns} ${runText})`;
  writeStatusLine(
    `${completedHeader}  ✅ Completed: [████████████████████] ${numberOfRuns}/${numberOfRuns} (100%)`
  );

  clearStatusLine();

  const aggregatedScores = aggregateScores(scoresPerRun);

  const result: UrlMonitoringAggregateResult = {
    name: urlConfig.name,
    url: urlConfig.url,
    device: deviceKey,
    runs: numberOfRuns,
    scoresPerRun,
    aggregatedScores,
  };

  const categoriesToShow = (
    performanceMonitoringConfig.onlyCategories as ReadonlyArray<PerformanceCategory>
  )
    .slice()
    .sort((a, b) => a.localeCompare(b));

  printMonitoringResultTable(result, categoriesToShow);

  return result;
}

/**
 * Run monitoring for all configured URLs across all configured devices.
 *
 * @param env Environment name (used for report metadata).
 * @returns Overall monitoring result.
 */
export async function runPerformanceMonitoringAll(env: string): Promise<OverallMonitoringResult> {
  const startedAt = new Date().toISOString();

  cleanMonitoringReportDirectory();
  ensureMonitoringReportDirectory();

  const urls = buildPerformanceUrls(env, { type: 'monitoring' });
  const globalDevices = [
    ...(performanceMonitoringConfig.devices || ['desktop']),
  ] as PerformanceDeviceKey[];

  const results: UrlMonitoringAggregateResult[] = [];

  const totalRuns = urls.reduce((acc, u) => acc + (u.devices?.length || globalDevices.length), 0);
  let currentIndex = 0;

  for (const urlConfig of urls) {
    const devices = (
      urlConfig.devices?.length ? urlConfig.devices : globalDevices
    ) as PerformanceDeviceKey[];
    const runs = urlConfig.numberOfRuns ?? performanceMonitoringConfig.numberOfRuns;

    for (const deviceKey of devices) {
      currentIndex += 1;
      const urlResult = await runPerformanceMonitoringForUrl(
        urlConfig,
        deviceKey,
        runs,
        currentIndex,
        totalRuns
      );
      results.push(urlResult);
    }
  }

  const finishedAt = new Date().toISOString();

  const overall: OverallMonitoringResult = {
    env,
    startedAt,
    finishedAt,
    results,
  };

  await writeMonitoringReports(overall);

  return overall;
}
