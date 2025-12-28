# mdToPdf Utility

← [Back to main documentation](../README.md)

Utility for converting Markdown files to PDF documents (used e.g. for accessibility reports).

## Configuration

 To use this utility, install **`md-to-pdf`** as a dev dependency:

 ```bash
 npm install --save-dev md-to-pdf
 ```

 We also use this utility in **`global-teardown.ts`** to automatically generate accessibility PDF reports at the end of test runs.

- **`inputPath`** – path to the source `.md` file
- **`outputPath`** *(optional)* – custom output `.pdf` path (defaults to input name with `.pdf`)
- **`cssPath`** *(optional)* – path to a CSS file used for styling the PDF
- **`format`** *(optional)* – page format, for example **`A4`** or **`Letter`**
- **`margin`** *(optional)* – page margins (top, right, bottom, left)
- **`displayHeaderFooter`** *(optional)* – whether to render header and footer
- **`headerTemplate`** *(optional)* – HTML template for the header (requires `displayHeaderFooter`)
- **`footerTemplate`** *(optional)* – HTML template for the footer (requires `displayHeaderFooter`)

## Usage

```typescript
import { convertMarkdownToPdf, convertAccessibilityReportToPdf } from '../utils/mdToPdf';

// Generic Markdown -> PDF
const pdfPath = await convertMarkdownToPdf('./docs/example.md');

// Markdown accessibility report -> PDF (preconfigured styling)
const accessibilityPdfPath = await convertAccessibilityReportToPdf('./build/reports/example.md');
```

## Advanced usage

Use a custom stylesheet and page options for a specific Markdown file:

```typescript
import { convertMarkdownToPdf } from '../utils/mdToPdf';

await convertMarkdownToPdf('./docs/example.md', {
  outputPath: './build/reports/example.pdf',
  cssPath: './docs/styles/example-pdf.css',
  format: 'A4',
  margin: {
    top: '10mm',
    right: '15mm',
    bottom: '15mm',
    left: '15mm',
  },
  displayHeaderFooter: true,
  headerTemplate: '<span style="font-size:10px;">Example report</span>',
  footerTemplate:
    '<span style="font-size:10px;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>',
});
```

The utility automatically handles styling and page formatting for accessibility reports. Custom CSS styling can be applied by providing a **`cssPath`** option when calling **`convertMarkdownToPdf`** (accessibility reports use **`accessibility-report.css`**).
