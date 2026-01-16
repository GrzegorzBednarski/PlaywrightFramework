<h1 style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 20px;">
      <span>Performance Monitoring Summary</span>
      <span style="font-size: 12px; font-weight: normal; color: #555;">16.01.2026, 19:12:01</span>
    </h1>


Device configurations:
- desktop: 1920x1080 (desktop)
- mobile: 375x667 (mobile)
- desktopWide: 2560x1440 (desktop)
- tablet: 768x1024 (mobile)
## Aggregated Results (Median Scores) [Environment: dev]

### Aggregated results table (Main config)

| Page | Device | Accessibility | Best Practices | Performance | SEO |
| ---- | ---- | :---: | :---: | :---: | :---: |
| [dynamicTablePage](https://practice.expandtesting.com/dynamic-table) | desktop | 95.0% | 59.0% | 46.5% | 100.0% |
| [dynamicTablePage](https://practice.expandtesting.com/dynamic-table) | mobile | 95.0% | 57.0% | 35.0% | 100.0% |
| [inputsPage](https://practice.expandtesting.com/inputs) | desktop | 95.0% | 59.0% | 28.5% | 100.0% |
| [inputsPage](https://practice.expandtesting.com/inputs) | mobile | 95.0% | 57.0% | 41.5% | 100.0% |

### Aggregated results table (Override profile 1)

| Page | Device | Performance | SEO |
| ---- | ---- | :---: | :---: |
| [homePage](https://www.example.com?dev/) | desktopWide | 100.0% | 80.0% |
| [homePage](https://www.example.com?dev/) | tablet | 100.0% | 80.0% |

## Raw Data and Statistics

### dynamicTablePage [desktop] [runs:2] (Main config)

| Metric | Values | Median | Min | Max | Average | Std Dev |
| ------ | ------ | :---: | :---: | :---: | :---: | :---: |
| Accessibility | [95.0] [95.0] | 95.0% | 95.0% | 95.0% | 95.0% | 0.0% |
| Best Practices | [59.0] [59.0] | 59.0% | 59.0% | 59.0% | 59.0% | 0.0% |
| Performance | [46.0] [47.0] | 46.5% | 46.0% | 47.0% | 46.5% | 0.5% |
| SEO | [100.0] [100.0] | 100.0% | 100.0% | 100.0% | 100.0% | 0.0% |

### dynamicTablePage [mobile] [runs:2] (Main config)

| Metric | Values | Median | Min | Max | Average | Std Dev |
| ------ | ------ | :---: | :---: | :---: | :---: | :---: |
| Accessibility | [95.0] [95.0] | 95.0% | 95.0% | 95.0% | 95.0% | 0.0% |
| Best Practices | [57.0] [57.0] | 57.0% | 57.0% | 57.0% | 57.0% | 0.0% |
| Performance | [30.0] [40.0] | 35.0% | 30.0% | 40.0% | 35.0% | 5.0% |
| SEO | [100.0] [100.0] | 100.0% | 100.0% | 100.0% | 100.0% | 0.0% |

### homePage [desktopWide] [runs:1] (Override profile 1)

| Metric | Values | Median | Min | Max | Average | Std Dev |
| ------ | ------ | :---: | :---: | :---: | :---: | :---: |
| Performance | [100.0] | 100.0% | 100.0% | 100.0% | 100.0% | 0.0% |
| SEO | [80.0] | 80.0% | 80.0% | 80.0% | 80.0% | 0.0% |

### homePage [tablet] [runs:1] (Override profile 1)

| Metric | Values | Median | Min | Max | Average | Std Dev |
| ------ | ------ | :---: | :---: | :---: | :---: | :---: |
| Performance | [100.0] | 100.0% | 100.0% | 100.0% | 100.0% | 0.0% |
| SEO | [80.0] | 80.0% | 80.0% | 80.0% | 80.0% | 0.0% |

### inputsPage [desktop] [runs:2] (Main config)

| Metric | Values | Median | Min | Max | Average | Std Dev |
| ------ | ------ | :---: | :---: | :---: | :---: | :---: |
| Accessibility | [95.0] [95.0] | 95.0% | 95.0% | 95.0% | 95.0% | 0.0% |
| Best Practices | [59.0] [59.0] | 59.0% | 59.0% | 59.0% | 59.0% | 0.0% |
| Performance | [27.0] [30.0] | 28.5% | 27.0% | 30.0% | 28.5% | 1.5% |
| SEO | [100.0] [100.0] | 100.0% | 100.0% | 100.0% | 100.0% | 0.0% |

### inputsPage [mobile] [runs:2] (Main config)

| Metric | Values | Median | Min | Max | Average | Std Dev |
| ------ | ------ | :---: | :---: | :---: | :---: | :---: |
| Accessibility | [95.0] [95.0] | 95.0% | 95.0% | 95.0% | 95.0% | 0.0% |
| Best Practices | [57.0] [57.0] | 57.0% | 57.0% | 57.0% | 57.0% | 0.0% |
| Performance | [47.0] [36.0] | 41.5% | 36.0% | 47.0% | 41.5% | 5.5% |
| SEO | [100.0] [100.0] | 100.0% | 100.0% | 100.0% | 100.0% | 0.0% |

<div style="page-break-before: always;"></div>

## Configuration summary

### Main config

- devices: desktop, mobile
- logs: false
- numberOfRuns: 2
- onlyCategories: performance, accessibility, bestPractices, seo
- skipAudits: uses-http2
- extraHeaders: none
- extraLighthouseFlags: none

### Per-URL overrides

- **[Override profile 1] homePage**
  - devices: desktopWide, tablet
  - numberOfRuns: 1
  - onlyCategories: performance, seo
  - skipAudits: uses-http2, is-on-https
  - extraHeaders: hidden
  - extraLighthouseFlags: hidden
  - chrome: headless=true; flags=hidden
