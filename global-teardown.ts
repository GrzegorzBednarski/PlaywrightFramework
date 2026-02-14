import { mergeAccessibilityReports } from './utils/accessibility/accessibilityReport';
import { mergeLinkCheckReports } from './utils/linkCheck/linkCheckReport';

export default async function globalTeardown() {
  await mergeAccessibilityReports();
  await mergeLinkCheckReports();
}
