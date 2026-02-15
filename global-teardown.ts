import { mergeAccessibilityReports } from './utils/accessibility/accessibilityReport';
import { mergeLinkCheckReports } from './utils/linkCheck/linkCheckReport';
import { mergeSecurityHeadersReports } from './utils/securityHeaders/securityHeadersReport';
import { mergeCspReports } from './utils/cspCheck/cspReport';

export default async function globalTeardown() {
  await mergeAccessibilityReports();
  await mergeLinkCheckReports();
  await mergeSecurityHeadersReports();
  await mergeCspReports();
}
