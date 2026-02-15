import { mergeAccessibilityReports } from './utils/accessibility/accessibilityReport';
import { mergeCspReports } from './utils/cspCheck/cspReport';
import { mergeHtmlValidateReports } from './utils/htmlValidator/htmlValidatorReport';
import { mergeLinkCheckReports } from './utils/linkCheck/linkCheckReport';
import { mergeSecurityHeadersReports } from './utils/securityHeaders/securityHeadersReport';

export default async function globalTeardown() {
  await mergeAccessibilityReports();
  await mergeCspReports();
  await mergeHtmlValidateReports();
  await mergeLinkCheckReports();
  await mergeSecurityHeadersReports();
}
