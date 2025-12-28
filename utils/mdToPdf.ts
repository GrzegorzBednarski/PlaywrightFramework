import * as fs from 'fs';
import * as path from 'path';
// Use default import; md-to-pdf exports a default function
import mdToPdf from 'md-to-pdf';

export interface MdToPdfOptions {
  /** Output PDF file path. If not provided, uses same name as input with .pdf extension */
  outputPath?: string;
  /** CSS file path for styling the PDF */
  cssPath?: string;
  /** Page format (A4, Letter, etc.) */
  format?: string;
  /** Page margins */
  margin?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
  /** Enable or disable header and footer */
  displayHeaderFooter?: boolean;
  /** Custom header template */
  headerTemplate?: string;
  /** Custom footer template */
  footerTemplate?: string;
}

/**
 * Converts markdown file to PDF using md-to-pdf API
 * @param inputPath Path to the markdown file
 * @param options Conversion options
 * @returns Promise<string> Path to the generated PDF file
 */
export async function convertMarkdownToPdf(
  inputPath: string,
  options: MdToPdfOptions = {}
): Promise<string> {
  if (!fs.existsSync(inputPath)) {
    throw new Error(`Markdown file not found: ${inputPath}`);
  }

  const outputPath = options.outputPath || inputPath.replace(/\.md$/, '.pdf');

  try {
    const pdfOptions = {
      pdf_options: {
        format: options.format || 'A4',
        margin: {
          top: options.margin?.top || '20mm',
          right: options.margin?.right || '20mm',
          bottom: options.margin?.bottom || '20mm',
          left: options.margin?.left || '20mm',
        },
        displayHeaderFooter: options.displayHeaderFooter || false,
        headerTemplate: options.headerTemplate || '',
        footerTemplate: options.footerTemplate || '',
      },
      stylesheet: options.cssPath ? [options.cssPath] : undefined,
    };

    const pdf = await mdToPdf({ path: inputPath }, pdfOptions as any);

    if (pdf.content) {
      fs.writeFileSync(outputPath, pdf.content);
      return outputPath;
    }
    throw new Error('PDF content is empty');
  } catch (error) {
    console.warn(
      `Failed to generate PDF report: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    console.warn('To enable PDF generation, install md-to-pdf: npm install --save-dev md-to-pdf');
    throw error;
  }
}

/**
 * Converts accessibility report markdown to PDF with predefined styling
 * @param markdownPath Path to the accessibility report markdown file
 * @param outputDir Directory where to save the PDF (optional, defaults to same as markdown)
 * @returns Promise<string> Path to the generated PDF file
 */
export async function convertAccessibilityReportToPdf(
  markdownPath: string,
  outputDir?: string
): Promise<string> {
  const outputPath = outputDir
    ? path.join(outputDir, 'accessibility-report.pdf')
    : markdownPath.replace(/\.md$/, '.pdf');

  const cssPath = path.join(__dirname, 'accessibility-report.css');

  const options: MdToPdfOptions = {
    outputPath,
    cssPath,
    format: 'A4',
    margin: {
      top: '5mm',
      right: '10mm',
      bottom: '10mm',
      left: '10mm',
    },
    displayHeaderFooter: false,
    headerTemplate: '',
    footerTemplate: '',
  };

  return convertMarkdownToPdf(markdownPath, options);
}
