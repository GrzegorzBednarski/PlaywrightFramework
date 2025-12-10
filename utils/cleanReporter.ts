import { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter';

class CleanReporter implements Reporter {
  private failedTests: { test: TestCase; result: TestResult }[] = [];
  private testIndex = 0;

  onBegin(config: any, suite: any) {
    const testCount = suite.allTests().length;
    const workerCount = config.workers;
    console.log(`\nRunning ${testCount} tests using ${workerCount} workers\n`);
  }

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

  onEnd(_result: FullResult) {
    this.printFailedTestsDetails();
    this.printSummary();
  }

  onStdOut?(chunk: string | Buffer, _test?: TestCase, _result?: TestResult): void {
    process.stdout.write(chunk);
  }

  onStdErr?(chunk: string | Buffer, _test?: TestCase, _result?: TestResult): void {
    process.stderr.write(chunk);
  }

  private formatTestInfo(test: TestCase): string {
    const projectName = test.parent?.project()?.name || '';
    const fileName = this.extractFileName(test.location?.file);
    const testTitle = test.title || 'Unknown Test';

    return `[${projectName}] › ${fileName} › ${testTitle}`;
  }

  private formatTestLocation(test: TestCase): string {
    const projectName = test.parent?.project()?.name || '';
    const fileName = this.extractFileName(test.location?.file);
    const line = test.location?.line || 0;
    const column = test.location?.column || 0;
    const testTitle = test.title || 'Unknown Test';

    return `[${projectName}] › ${fileName}:${line}:${column} › ${testTitle}`;
  }

  private extractFileName(filePath?: string): string {
    if (!filePath) return 'Unknown File';
    return filePath.split(/[\\/]/).pop() || 'Unknown File';
  }

  private formatDuration(duration: number): string {
    return `(${(duration / 1000).toFixed(1)}s)`;
  }

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
