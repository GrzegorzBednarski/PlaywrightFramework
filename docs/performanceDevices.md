# Performance devices

← [Back to main documentation](../README.md)

Device presets for performance tests.

Use these keys to control device emulation (screen size, scale factor, form factor) in:
- **[Performance Test](./performanceTest.md)**
- **[Performance Monitoring](./performanceMonitoring.md)**

Performance tools are built on top of **[Lighthouse](https://developer.chrome.com/docs/lighthouse/overview/)**.

## Configuration

File: `config/performanceDevicesConfig.ts`

Each device defines:
- `formFactor` - passed to Lighthouse (`desktop` / `mobile`)
- `screenEmulation` - screen settings used by Lighthouse
  - `mobile` - enable/disable mobile emulation
  - `width`, `height` - viewport size
  - `deviceScaleFactor` - device pixel ratio

Example:

```ts
export const performanceDevicesConfig = {
  desktop: {
    formFactor: 'desktop',
    screenEmulation: {
      mobile: false,
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
    },
  },
  desktopWide: {
    formFactor: 'desktop',
    screenEmulation: {
      mobile: false,
      width: 2560,
      height: 1440,
      deviceScaleFactor: 1,
    },
  },
  mobile: {
    formFactor: 'mobile',
    screenEmulation: {
      mobile: true,
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
    },
  },
  tablet: {
    formFactor: 'mobile',
    screenEmulation: {
      mobile: true,
      width: 768,
      height: 1024,
      deviceScaleFactor: 2,
    },
  },
} as const;
```

## Usage

You can use device keys in both configs:
- `config/performanceTestConfig.ts`
- `config/performanceMonitoringConfig.ts`

Example (global / main config):

```ts
export const performanceTestConfig = {
  devices: ['desktop', 'tablet'],
  // ...
} as const;
```

Example (per-URL override):

```ts
export const performanceTestConfig = {
  devices: ['desktopWide'],
  urlsToTest: [
    {
      name: 'homePage',
      path: '/',
      devices: ['mobile', 'tablet'],
    },
  ],
} as const;
```
