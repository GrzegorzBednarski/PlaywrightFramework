import { performanceMonitoringConfig } from '../../config/performanceMonitoringConfig';
import { performanceTestConfig } from '../../config/performanceTestConfig';

/**
 * Decide whether sensitive data should be hidden in reports.
 *
 * This is a global report setting (not per-URL).
 */
export function isHideSensitiveDataEnabled(type: 'test' | 'monitoring'): boolean {
  if (type === 'test') return Boolean((performanceTestConfig as any).hideSensitiveDataInReport);
  return Boolean((performanceMonitoringConfig as any).hideSensitiveDataInReport);
}

/**
 * Format extra headers for report output.
 *
 * When hiding sensitive data, this returns:
 * - "hidden" if there are any headers
 * - "none" if there are no headers
 */
export function formatExtraHeadersKeysForReport(
  headerKeys: readonly string[],
  hideSensitive: boolean
): string {
  if (hideSensitive) return headerKeys.length ? 'hidden' : 'none';
  return headerKeys.length ? headerKeys.join(', ') : 'none';
}

/**
 * Format extra lighthouse flags for report output.
 */
export function formatExtraLighthouseFlagsForReport(
  flags: readonly string[],
  hideSensitive: boolean
): string {
  if (hideSensitive) return flags.length ? 'hidden' : 'none';
  return flags.length ? flags.join(', ') : 'none';
}

/**
 * Format chrome flags for report output.
 */
export function formatChromeFlagsForReport(
  flags: readonly string[],
  hideSensitive: boolean
): string {
  if (hideSensitive) return flags.length ? 'flags=hidden' : 'flags=none';
  return flags.length ? `flags=${flags.join(' ')}` : 'flags=none';
}
