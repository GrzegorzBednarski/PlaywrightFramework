import { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter';

/**
 * Custom Playwright reporter that prints a compact per-test line
 * and a short summary of failed tests at the end of the run.
 */
class CleanReporter implements Reporter {
  private failedTests: { test: TestCase; result: TestResult }[] = [];
  private testIndex = 0;
  private runStartMs = 0;

  /**
   * Called once before all tests start. Logs total test and worker counts.
   */
  onBegin(config: any, suite: any) {
    this.runStartMs = Date.now();
    const testCount = suite.allTests().length;
    const workerCount = config.workers;
    console.log(`\nRunning ${testCount} tests using ${workerCount} workers\n`);
  }

  /**
   * Called after each test finishes. Logs a single-line status and
   * collects failed tests for the final summary.
   */
  onTestEnd(test: TestCase, result: TestResult) {
    this.testIndex++;
    const formattedTest = this.formatTestInfo(test);
    const duration = this.formatDuration(result.duration);

    switch (result.status) {
      case 'passed':
        console.log(`  ✓  ${this.testIndex} ${formattedTest} ${duration}`);
        break;
      case 'failed':
        console.log(`  ✗  ${this.testIndex} ${formattedTest} ${duration}`);
        this.failedTests.push({ test, result });
        break;
      case 'skipped':
        console.log(`  -  ${this.testIndex} ${formattedTest} ${duration}`);
        break;
    }
  }

  /**
   * Called once after all tests complete. Prints failed test details
   * and an aggregate summary.
   */
  onEnd(_result: FullResult) {
    this.printFailedTestsDetails();
    this.printSummary();

    const totalDurationMs = this.runStartMs ? Date.now() - this.runStartMs : 0;
    console.log(`  Total time: ${this.formatTotalDuration(totalDurationMs)}`);
  }

  onStdOut?(chunk: string | Buffer, _test?: TestCase, _result?: TestResult): void {
    process.stdout.write(chunk);
  }

  onStdErr?(chunk: string | Buffer, _test?: TestCase, _result?: TestResult): void {
    process.stderr.write(chunk);
  }

  /**
   * Formats total run duration to a compact human-readable string.
   */
  private formatTotalDuration(durationMs: number): string {
    const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const tenths = Math.floor((durationMs % 1000) / 100);

    if (minutes > 0) {
      return `${minutes}m ${seconds}.${tenths}s`;
    }
    return `${seconds}.${tenths}s`;
  }

  /**
   * Formats basic information about a test (file, title) for logging.
   */
  private formatTestInfo(test: TestCase): string {
    const fileName = this.extractFileName(test.location?.file);
    const testTitle = test.title || 'Unknown Test';

    return `${fileName} › ${testTitle}`;
  }

  /**
   * Formats a full test location string including file, line and column.
   */
  private formatTestLocation(test: TestCase): string {
    const fileName = this.extractFileName(test.location?.file);
    const line = test.location?.line || 0;
    const column = test.location?.column || 0;
    const testTitle = test.title || 'Unknown Test';

    return `${fileName}:${line}:${column} › ${testTitle}`;
  }

  /**
   * Extracts the filename from an absolute or relative path.
   */
  private extractFileName(filePath?: string): string {
    if (!filePath) return 'Unknown File';
    return filePath.split(/[\\/]/).pop() || 'Unknown File';
  }

  /**
   * Formats test duration in seconds with a single decimal place.
   */
  private formatDuration(duration: number): string {
    return `(${(duration / 1000).toFixed(1)}s)`;
  }

  /**
   * Prints a numbered list of failed tests with a short error message.
   */
  private printFailedTestsDetails(): void {
    if (this.failedTests.length === 0) return;

    console.log('');

    this.failedTests.forEach(({ test, result }, index) => {
      const testLocation = this.formatTestLocation(test);
      console.log(`  ${index + 1}) ${testLocation} ───\n`);

      if (result.error?.message) {
        const errorMessage = result.error.message.split('\n')[0];
        console.log(`    Error: ${errorMessage}\n`);
      }
    });
  }

  /**
   * Prints a final summary line with passed/failed test counts.
   */
  private printSummary(): void {
    const passed = this.testIndex - this.failedTests.length;

    if (this.failedTests.length === 0) {
      console.log(`\n  ${passed} passed\n`);
    } else {
      console.log(`  ${this.failedTests.length} failed`);
      this.failedTests.forEach(({ test }) => {
        const testLocation = this.formatTestLocation(test);
        console.log(`    ${testLocation} ────`);
      });
      console.log('');
    }
  }
}

export default CleanReporter;
