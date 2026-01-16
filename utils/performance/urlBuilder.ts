import { performanceMonitoringConfig } from '../../config/performanceMonitoringConfig';
import { performanceTestConfig } from '../../config/performanceTestConfig';
import type { PerformanceDeviceKey } from '../../config/performanceDevicesConfig';

export type PerformanceCategory = 'performance' | 'accessibility' | 'bestPractices' | 'seo' | 'pwa';

export interface PerformanceThresholds {
  performance?: number;
  accessibility?: number;
  bestPractices?: number;
  seo?: number;
  pwa?: number;
}

export interface PerformanceUrlContext {
  env: string;
  baseUrl: string;
}

export interface PerformanceUrlToTestConfig {
  name: string;
  path: string | ((ctx: PerformanceUrlContext) => string);

  devices?: readonly PerformanceDeviceKey[];
  logs?: boolean;
  chrome?: { headless?: boolean; flags?: readonly string[] };
  extraHeaders?: Record<string, string>;
  extraLighthouseFlags?: readonly string[];
  skipAudits?: readonly string[];

  onlyCategories?: PerformanceCategory[];
  thresholds?: PerformanceThresholds;
}

export interface PerformanceTestConfig {
  thresholds: Required<PerformanceThresholds>;
  onlyCategories: PerformanceCategory[];
  urlsToTest: PerformanceUrlToTestConfig[];

  devices?: readonly PerformanceDeviceKey[];
  logs?: boolean;
  chrome?: { headless?: boolean; flags?: readonly string[] };
  extraHeaders?: Record<string, string>;
  extraLighthouseFlags?: readonly string[];
  skipAudits?: readonly string[];
}

export interface PerformanceUrlToMonitorConfig {
  name: string;
  path: string | ((ctx: PerformanceUrlContext) => string);

  devices?: readonly PerformanceDeviceKey[];
  logs?: boolean;
  numberOfRuns?: number;
  chrome?: { headless?: boolean; flags?: readonly string[] };
  extraHeaders?: Record<string, string>;
  extraLighthouseFlags?: readonly string[];
  skipAudits?: readonly string[];

  onlyCategories?: PerformanceCategory[];
}

export interface PerformanceMonitoringConfig {
  numberOfRuns: number;
  onlyCategories: PerformanceCategory[];
  urlsToMonitor: PerformanceUrlToMonitorConfig[];

  devices?: readonly PerformanceDeviceKey[];
  logs?: boolean;
  chrome?: { headless?: boolean; flags?: readonly string[] };
  extraHeaders?: Record<string, string>;
  extraLighthouseFlags?: readonly string[];
  skipAudits?: readonly string[];
}

export interface BuiltPerformanceUrlConfig {
  name: string;
  url: string;

  devices?: readonly PerformanceDeviceKey[];
  logs?: boolean;
  chrome?: { headless?: boolean; flags?: readonly string[] };
  extraHeaders?: Record<string, string>;
  extraLighthouseFlags?: readonly string[];
  skipAudits?: readonly string[];
  numberOfRuns?: number;

  onlyCategories?: string[];
  thresholds?: PerformanceThresholds;
}

/**
 * Build URL resolution context for the given environment.
 *
 * @param env Environment name.
 * @returns Context with environment and resolved base URL (from BASE_URL).
 */
function buildContext(env: string): PerformanceUrlContext {
  const baseUrl = process.env.BASE_URL || '';

  return {
    env,
    baseUrl,
  };
}

/**
 * Resolve a config entry path into a full URL.
 *
 * @param entry URL entry (path may be string or function).
 * @param ctx Context with baseUrl and env.
 * @returns Fully resolved URL.
 */
function resolvePath(
  entry: { path: string | ((ctx: PerformanceUrlContext) => string) },
  ctx: PerformanceUrlContext
): string {
  const rawPath = typeof entry.path === 'function' ? entry.path(ctx) : entry.path;

  if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) {
    return rawPath;
  }

  const normalizedPath = rawPath.startsWith('/') ? rawPath.slice(1) : rawPath;
  const base = ctx.baseUrl.replace(/\/+$/, '');

  return `${base}/${normalizedPath}`;
}

/**
 * Normalize a performance test URL entry by applying defaults from the config.
 *
 * @param entry Per-URL test config.
 * @param config Global test config defaults.
 * @param ctx URL context.
 */
function normalizeTestEntry(
  entry: PerformanceUrlToTestConfig,
  config: PerformanceTestConfig,
  ctx: PerformanceUrlContext
): BuiltPerformanceUrlConfig {
  return {
    name: entry.name,
    url: resolvePath(entry, ctx),

    devices: entry.devices ?? config.devices,
    logs: entry.logs ?? config.logs,
    chrome: entry.chrome ?? config.chrome,
    extraHeaders: entry.extraHeaders ?? config.extraHeaders,
    extraLighthouseFlags: entry.extraLighthouseFlags ?? config.extraLighthouseFlags,
    skipAudits: entry.skipAudits ?? config.skipAudits,

    onlyCategories: entry.onlyCategories || config.onlyCategories,
    thresholds: entry.thresholds || config.thresholds,
  };
}

/**
 * Normalize a performance monitoring URL entry by applying defaults from the config.
 *
 * @param entry Per-URL monitoring config.
 * @param config Global monitoring config defaults.
 * @param ctx URL context.
 */
function normalizeMonitorEntry(
  entry: PerformanceUrlToMonitorConfig,
  config: PerformanceMonitoringConfig,
  ctx: PerformanceUrlContext
): BuiltPerformanceUrlConfig {
  return {
    name: entry.name,
    url: resolvePath(entry, ctx),

    devices: entry.devices ?? config.devices,
    logs: entry.logs ?? config.logs,
    numberOfRuns: entry.numberOfRuns ?? config.numberOfRuns,
    chrome: entry.chrome ?? config.chrome,
    extraHeaders: entry.extraHeaders ?? config.extraHeaders,
    extraLighthouseFlags: entry.extraLighthouseFlags ?? config.extraLighthouseFlags,
    skipAudits: entry.skipAudits ?? config.skipAudits,

    onlyCategories: entry.onlyCategories || config.onlyCategories,
  };
}

/**
 * Build a list of URLs to run Lighthouse against.
 *
 * Rules:
 * - If `path` starts with `http://` or `https://`, it is treated as an absolute URL.
 * - Otherwise `path` is treated as relative and will be joined with `process.env.BASE_URL`.
 *
 * @param env Environment name (for context and report metadata).
 * @param options Select which feature config to use.
 * @returns Normalized URL configs, ready to run.
 */
export function buildPerformanceUrls(
  env: string,
  options:
    | { type: 'test'; config?: typeof performanceTestConfig }
    | { type: 'monitoring'; config?: typeof performanceMonitoringConfig }
): BuiltPerformanceUrlConfig[] {
  const ctx = buildContext(env);

  if (options.type === 'test') {
    const cfg: PerformanceTestConfig = {
      devices: performanceTestConfig.devices as unknown as readonly PerformanceDeviceKey[],
      logs: performanceTestConfig.logs,
      chrome: performanceTestConfig.chrome,
      extraHeaders: performanceTestConfig.extraHeaders,
      extraLighthouseFlags: performanceTestConfig.extraLighthouseFlags,
      skipAudits: (performanceTestConfig as any).skipAudits,

      thresholds: performanceTestConfig.thresholds as Required<PerformanceThresholds>,
      onlyCategories: [...performanceTestConfig.onlyCategories] as PerformanceCategory[],
      urlsToTest: performanceTestConfig.urlsToTest as unknown as PerformanceUrlToTestConfig[],
    };

    return cfg.urlsToTest.map(entry => normalizeTestEntry(entry, cfg, ctx));
  }

  const mcfg: PerformanceMonitoringConfig = {
    devices: performanceMonitoringConfig.devices as unknown as readonly PerformanceDeviceKey[],
    logs: performanceMonitoringConfig.logs,
    chrome: performanceMonitoringConfig.chrome,
    extraHeaders: performanceMonitoringConfig.extraHeaders as any,
    extraLighthouseFlags: performanceMonitoringConfig.extraLighthouseFlags,
    skipAudits: (performanceMonitoringConfig as any).skipAudits,

    numberOfRuns: performanceMonitoringConfig.numberOfRuns,
    onlyCategories: [...performanceMonitoringConfig.onlyCategories] as PerformanceCategory[],
    urlsToMonitor:
      performanceMonitoringConfig.urlsToMonitor as unknown as PerformanceUrlToMonitorConfig[],
  };

  return mcfg.urlsToMonitor.map(entry => normalizeMonitorEntry(entry, mcfg, ctx));
}
