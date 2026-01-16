import { buildPerformanceUrls } from '../performance/urlBuilder';
import { runPerformanceTestForUrl, cleanReportDirectory } from '../performance/performanceTest';
import { writePerformanceTestSummaryReport } from '../performance/performanceTestReport';
import type { OverallPerformanceTestResult } from '../performance/performanceTest';
import { performanceTestConfig } from '../../config/performanceTestConfig';
import {
  performanceDevicesConfig,
  type PerformanceDeviceKey,
} from '../../config/performanceDevicesConfig';
import { buildDir } from '../../playwright.config';
import { performanceMonitoringConfig } from '../../config/performanceMonitoringConfig';
import { runPerformanceMonitoringAll } from '../performance/performanceMonitoring';

/**
 * Convert a device key (from performanceDevicesConfig) into a nicer label for console output.
 *
 * @param device Device preset key.
 * @returns Human-friendly label.
 */
function formatDeviceLabel(device: PerformanceDeviceKey): string {
  const withSpaces = device.replace(/[_-]+/g, ' ');
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}

/**
 * Print/overwrite a single status line (used for lightweight progress output).
 *
 * @param text Status text.
 */
function writeStatusLine(text: string) {
  process.stdout.write('\r' + text);
}

/**
 * Clear the current status line.
 */
function clearStatusLine() {
  process.stdout.write('\r' + ' '.repeat(120) + '\r');
}

/**
 * Validate device keys provided in config and return them as typed keys.
 *
 * @param devicesFromConfig Raw device keys from config.
 * @param label Config location label used in error messages.
 * @returns Typed device keys or null if configuration is invalid.
 */
function validateDevices(
  devicesFromConfig: readonly string[],
  label: string
): PerformanceDeviceKey[] | null {
  const availableDevices = Object.keys(performanceDevicesConfig);

  if (!devicesFromConfig || devicesFromConfig.length === 0) {
    console.error(`No devices configured for ${label}.`);
    console.error('Set at least one device key in config, for example:');
    console.error(`  - ${label}: ['desktop']`);
    console.error('\nAvailable devices are:');
    availableDevices.forEach(d => console.error(`  - ${d}`));
    return null;
  }

  const invalidDevices = devicesFromConfig.filter(d => !availableDevices.includes(d));

  if (invalidDevices.length > 0) {
    console.error(`Invalid device key(s) in ${label}:`);
    invalidDevices.forEach(d => {
      console.error(`  - "${d}" (no matching entry in performanceDevicesConfig)`);
    });
    console.error('\nAvailable devices are:');
    availableDevices.forEach(d => console.error(`  - ${d}`));
    console.error('\nAborting due to invalid device configuration.');

    return null;
  }

  return devicesFromConfig as PerformanceDeviceKey[];
}

/**
 * Print a compact per-URL category score table to the console.
 *
 * @param urlResult Lighthouse result computed for a single URL.
 * @param deviceKey Device preset used for the run.
 */
function printUrlResultTable(
  urlResult: Awaited<ReturnType<typeof runPerformanceTestForUrl>>,
  deviceKey: PerformanceDeviceKey
) {
  const nameWidth = 25;
  const scoreWidth = 12;
  const thresholdWidth = 12;
  const statusWidth = 8;
  const totalWidth = nameWidth + scoreWidth + thresholdWidth + statusWidth + 12; // + separators

  const overallStatus = urlResult.allPassed ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mFAIL\x1b[0m';
  const deviceLabel = formatDeviceLabel(deviceKey);

  console.log(`\nResults for ${urlResult.name} [${deviceLabel}]: ${overallStatus}`);
  console.log(`URL: ${urlResult.url}`);
  console.log('─'.repeat(totalWidth));

  console.log(
    `${'METRIC'.padEnd(nameWidth)} | ` +
      `${'SCORE'.padEnd(scoreWidth)} | ` +
      `${'THRESHOLD'.padEnd(thresholdWidth)} | ` +
      `${'STATUS'.padEnd(statusWidth)}`
  );
  console.log('─'.repeat(totalWidth));

  urlResult.categories.forEach(cat => {
    const displayName =
      cat.category === 'bestPractices'
        ? 'Best Practices'
        : cat.category.charAt(0).toUpperCase() + cat.category.slice(1);

    const color = cat.passed ? '\x1b[32m' : '\x1b[31m';
    const reset = '\x1b[0m';
    const status = cat.passed ? `${color}PASS${reset}` : `${color}FAIL${reset}`;
    const scoreText = `${color}${cat.score.toFixed(1)}%${reset}`;
    const thresholdText = `${cat.threshold}%`;

    console.log(
      `${displayName.padEnd(nameWidth)} | ` +
        `${scoreText.padEnd(scoreWidth + 9)} | ` +
        `${thresholdText.padEnd(thresholdWidth)} | ` +
        `${status.padEnd(statusWidth + 9)}`
    );
  });

  console.log('─'.repeat(totalWidth));
}

/**
 * Run Lighthouse performance tests for the given environment.
 *
 * @param env Environment name (used to load env/.env.<env> and for report metadata).
 */
export async function runPerformanceTest(env: string) {
  const startedAt = new Date().toISOString();
  cleanReportDirectory();

  console.log('==================================================================');
  console.log('PERFORMANCE TESTS');
  console.log('==================================================================');

  const urls = buildPerformanceUrls(env, { type: 'test' });
  const globalDevicesFromConfig = performanceTestConfig.devices || ['desktop'];
  const globalDevices = validateDevices(globalDevicesFromConfig, 'performanceTestConfig.devices');

  if (!globalDevices || globalDevices.length === 0) {
    process.exitCode = 1;
    return;
  }

  const results: Awaited<ReturnType<typeof runPerformanceTestForUrl>>[] = [];

  const totalRuns = urls.reduce(
    (acc, u) => acc + (u.devices?.length ? u.devices.length : globalDevices.length),
    0
  );

  let runIndex = 0;

  for (const urlConfig of urls) {
    const devicesForUrl = validateDevices(
      (urlConfig.devices?.length ? urlConfig.devices : globalDevices) as readonly string[],
      `urlsToTest[${urlConfig.name}].devices`
    );

    if (!devicesForUrl || devicesForUrl.length === 0) {
      process.exitCode = 1;
      return;
    }

    for (const deviceKey of devicesForUrl) {
      runIndex += 1;
      const deviceLabel = formatDeviceLabel(deviceKey);
      const indexText = `[${runIndex}/${totalRuns}]`;
      writeStatusLine(`${indexText} Performing tests for: ${urlConfig.name} [${deviceLabel}]...`);

      const urlResult = await runPerformanceTestForUrl(urlConfig, deviceKey);
      results.push(urlResult);

      clearStatusLine();
      printUrlResultTable(urlResult, deviceKey);
    }
  }

  const finishedAt = new Date().toISOString();
  const allPassed = results.every(r => r.allPassed);
  const separatorLine = '='.repeat(80);
  console.log('\n' + separatorLine);
  if (allPassed) {
    console.log('\x1b[32m✅ OVERALL RESULT: All performance tests PASSED.\x1b[0m');
  } else {
    console.log('\x1b[31m❌ OVERALL RESULT: Some performance tests FAILED.\x1b[0m');
  }
  console.log(separatorLine);

  const overall: OverallPerformanceTestResult = {
    env,
    startedAt,
    finishedAt,
    allPassed,
    results,
  };

  await writePerformanceTestSummaryReport(overall);

  const reportsDir = `${buildDir}/performance-test-reports`;
  console.log(`Detailed Lighthouse reports are stored in: ${reportsDir}`);

  if (!allPassed) {
    process.exitCode = 1;
  }
}

/**
 * Run Lighthouse performance monitoring for the given environment.
 *
 * @param env Environment name (used to load env/.env.<env> and for report metadata).
 */
export function runPerformanceMonitoring(env: string) {
  console.log('==================================================================');
  console.log('PERFORMANCE MONITORING');
  console.log('==================================================================');
  console.log();

  const devicesFromConfig = performanceMonitoringConfig.devices || ['desktop'];
  const devices = validateDevices(devicesFromConfig, 'performanceMonitoringConfig.devices');

  if (!devices || devices.length === 0) {
    process.exitCode = 1;
    return;
  }

  const monitoringReportsDir = `${buildDir}/performance-monitoring-reports`;

  runPerformanceMonitoringAll(env)
    .then(() => {
      console.log(
        'Detailed monitoring reports (JSON/Markdown) are stored in: ' + monitoringReportsDir
      );
    })
    .catch(error => {
      console.error('Error during performance monitoring:', error);
      process.exitCode = 1;
    });
}
