import * as path from 'path';
import accessibilityConfig from '../PlaywrightFramework/config/accessibilityConfig';
import { mergeAccessibilityReports } from './utils/accessibilityReport';

const reportsDir = path.resolve(accessibilityConfig.reportsOutputFolder);
const outputFile = path.join(reportsDir, 'accessibility-report.json');

export default async function globalTeardown() {
  await mergeAccessibilityReports(reportsDir, outputFile, true);
}
