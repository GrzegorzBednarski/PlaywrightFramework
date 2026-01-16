import * as fs from 'fs';
import * as path from 'path';
import { spawnSync } from 'child_process';
import { buildDir } from '../../playwright.config';
import { performanceTestConfig } from '../../config/performanceTestConfig';
import {
  performanceDevicesConfig,
  type PerformanceDeviceKey,
} from '../../config/performanceDevicesConfig';
import {
  type BuiltPerformanceUrlConfig,
  type PerformanceThresholds,
  type PerformanceCategory,
} from './urlBuilder';

export interface CategoryScoreResult {
  category: PerformanceCategory;
  score: number;
  threshold: number;
  passed: boolean;
}

export interface UrlPerformanceResult {
  name: string;
  url: string;
  device: PerformanceDeviceKey;
  categories: CategoryScoreResult[];
  allPassed: boolean;
  htmlReportPath?: string;
  jsonReportPath?: string;
}

interface BaseUrlPerformanceResult {
  name: string;
  url: string;
  device: PerformanceDeviceKey;
  categories: CategoryScoreResult[];
  allPassed: boolean;
}

export interface OverallPerformanceTestResult {
  env: string;
  startedAt: string;
  finishedAt: string;
  allPassed: boolean;
  results: UrlPerformanceResult[];
}

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

const PERFORMANCE_REPORT_DIR = path.join(buildDir, 'performance-test-reports');
const PERFORMANCE_DETAILED_DIR = path.join(PERFORMANCE_REPORT_DIR, 'detailed-results');

/**
 * Ensure the performance test report directories exist.
 */
function ensureReportDirectory(): void {
  if (!fs.existsSync(PERFORMANCE_REPORT_DIR)) {
    fs.mkdirSync(PERFORMANCE_REPORT_DIR, { recursive: true });
  }
  if (!fs.existsSync(PERFORMANCE_DETAILED_DIR)) {
    fs.mkdirSync(PERFORMANCE_DETAILED_DIR, { recursive: true });
  }
}

/**
 * Clean the performance test report directory.
 *
 * Used by the runner to remove reports from previous executions.
 */
export function cleanReportDirectory(): void {
  if (!fs.existsSync(PERFORMANCE_REPORT_DIR)) {
    return;
  }

  const entries = fs.readdirSync(PERFORMANCE_REPORT_DIR);
  for (const entry of entries) {
    const fullPath = path.join(PERFORMANCE_REPORT_DIR, entry);
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
 */
function sanitizeFileName(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '');
}

/**
 * Build CLI arguments for Lighthouse based on config and device emulation.
 */
function buildLighthouseArgs(
  urlConfig: BuiltPerformanceUrlConfig,
  baseFilePath: string,
  deviceKey: PerformanceDeviceKey
): string[] {
  const args = [urlConfig.url];

  const logs = urlConfig.logs ?? performanceTestConfig.logs;
  const chrome = urlConfig.chrome ?? performanceTestConfig.chrome;
  const extraHeaders = urlConfig.extraHeaders ?? performanceTestConfig.extraHeaders;
  const extraFlags = urlConfig.extraLighthouseFlags ?? performanceTestConfig.extraLighthouseFlags;
  const skipAudits = urlConfig.skipAudits ?? (performanceTestConfig as any).skipAudits;

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

  const categories = (urlConfig.onlyCategories || performanceTestConfig.onlyCategories || []).map(
    cat => (cat === 'bestPractices' ? 'best-practices' : cat)
  );
  if (categories.length > 0) {
    args.push(`--only-categories=${categories.join(',')}`);
  }

  if (skipAudits?.length) {
    args.push(`--skip-audits=${skipAudits.join(',')}`);
  }

  if (extraHeaders && Object.keys(extraHeaders).length > 0) {
    args.push(`--extra-headers=${JSON.stringify(extraHeaders)}`);
  }

  if (extraFlags?.length) {
    args.push(...extraFlags);
  }

  return args;
}

/**
 * Execute Lighthouse and return a lightweight result object with parsed categories.
 */
function runLighthouse(
  urlConfig: BuiltPerformanceUrlConfig,
  baseFilePath: string,
  deviceKey: PerformanceDeviceKey
): RunLighthouseResult {
  const args = buildLighthouseArgs(urlConfig, baseFilePath, deviceKey);
  const lighthouseCliPath = require.resolve('lighthouse/cli/index.js');

  try {
    const logs = urlConfig.logs ?? performanceTestConfig.logs;
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
 */
function extractScores(lhr: LighthouseResultLike): Record<PerformanceCategory, number | undefined> {
  const categoryMap: Record<string, PerformanceCategory> = {
    performance: 'performance',
    accessibility: 'accessibility',
    'best-practices': 'bestPractices',
    seo: 'seo',
    pwa: 'pwa',
  };

  const scores: Record<PerformanceCategory, number | undefined> = {
    performance: undefined,
    accessibility: undefined,
    bestPractices: undefined,
    seo: undefined,
    pwa: undefined,
  };

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
 * Resolve thresholds for a URL by merging global config with per-URL overrides.
 */
function resolveThresholds(urlConfig: BuiltPerformanceUrlConfig): Required<PerformanceThresholds> {
  const globalThresholds = performanceTestConfig.thresholds;
  const local = (urlConfig.thresholds || {}) as PerformanceThresholds;

  return {
    performance: local.performance ?? globalThresholds.performance,
    accessibility: local.accessibility ?? globalThresholds.accessibility,
    bestPractices: local.bestPractices ?? globalThresholds.bestPractices,
    seo: local.seo ?? globalThresholds.seo,
    pwa: local.pwa ?? globalThresholds.pwa,
  };
}

/**
 * Evaluate pass/fail for configured categories for a single URL+device run.
 */
function evaluateResult(
  urlConfig: BuiltPerformanceUrlConfig,
  scores: Record<PerformanceCategory, number | undefined>,
  device: PerformanceDeviceKey
): BaseUrlPerformanceResult {
  const thresholds = resolveThresholds(urlConfig);
  const categoriesToTest = (
    (urlConfig.onlyCategories || performanceTestConfig.onlyCategories) as PerformanceCategory[]
  )
    .slice()
    .sort((a, b) => a.localeCompare(b));

  const categories: CategoryScoreResult[] = categoriesToTest.map(category => {
    const score = scores[category] ?? 0;
    const threshold = (thresholds[category] as number) ?? 0;
    const passed = score >= threshold;

    return {
      category,
      score,
      threshold,
      passed,
    };
  });

  const allPassed = categories.every(c => c.passed);

  return {
    name: urlConfig.name,
    url: urlConfig.url,
    device,
    categories,
    allPassed,
  };
}

/**
 * Run Lighthouse for one normalized URL config and one device.
 *
 * Lighthouse is executed via Node (`process.execPath`) against the local lighthouse CLI entry
 * to avoid shell-related artefacts (especially on Windows) and to keep args handling safe.
 */
export function runPerformanceTestForUrl(
  urlConfig: BuiltPerformanceUrlConfig,
  deviceKey: PerformanceDeviceKey
) {
  ensureReportDirectory();

  const fileBase = path.join(
    PERFORMANCE_DETAILED_DIR,
    `${sanitizeFileName(urlConfig.name)}-${deviceKey}-${Date.now()}`
  );

  const { lhr, htmlReportPath, jsonReportPath } = runLighthouse(urlConfig, fileBase, deviceKey);
  const scores = extractScores(lhr);
  const baseResult = evaluateResult(urlConfig, scores, deviceKey);

  return {
    ...baseResult,
    htmlReportPath,
    jsonReportPath,
  };
}
