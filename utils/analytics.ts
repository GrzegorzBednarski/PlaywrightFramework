import { Page, test as pwt } from '@playwright/test';
import { loadFixtureWithReplacements } from './fixtures';
import { analyticsConfig } from '../config/analyticsConfig';

const analyticsEventsStore = new Map<Page, unknown[]>();

/**
 * Recursively checks whether the actual analytics event matches the expected shape.
 * Only keys present in expected are required; supports nested objects and arrays.
 */
function deepMatch(actual: unknown, expected: unknown): boolean {
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual) || actual.length !== expected.length) return false;
    return expected.every((val, i) => deepMatch(actual[i], val));
  }

  if (typeof expected !== 'object' || expected === null) return actual === expected;
  if (typeof actual !== 'object' || actual === null) return false;

  const expectedObj = expected as Record<string, unknown>;
  const actualObj = actual as Record<string, unknown>;

  return Object.entries(expectedObj).every(
    ([key, val]) => key in actualObj && deepMatch(actualObj[key], val)
  );
}

/**
 * Recursively searches an object/array for a given key/value combination.
 * Used by filter logic to find matching properties in an event payload.
 */
function containsKeyValue(obj: unknown, key: string, value?: string): boolean {
  if (obj === null) return false;
  if (typeof obj !== 'object') return key === String(obj) && value === undefined;
  if (Array.isArray(obj)) return obj.some(item => containsKeyValue(item, key, value));

  const record = obj as Record<string, unknown>;
  for (const [k, v] of Object.entries(record)) {
    if (k === key && (value === undefined || String(v) === value)) return true;
    if (typeof v !== 'object' && value === undefined && String(v) === key) return true;
    if (typeof v === 'object' && v !== null && containsKeyValue(v, key, value)) return true;
  }

  return false;
}

/**
 * Determines whether an event should be included in debug output
 * based on a single filter or a list of filters (logical AND).
 */
function shouldIncludeEvent(event: unknown, filter: string | string[]): boolean {
  // Empty filter -> no filtering
  if (!filter || (Array.isArray(filter) && filter.length === 0)) return true;
  if (typeof event !== 'object' || event === null) return false;

  const filters = Array.isArray(filter) ? filter : [filter];

  // ALL conditions must be satisfied (logical AND)
  return filters.every(rawKey => {
    const key = rawKey.trim();
    if (!key) return true;

    const parts = key.split(':');
    if (parts.length === 2) {
      const [k, v] = parts;
      return containsKeyValue(event, k, v);
    }

    // Single token: match either as key or value anywhere in the event
    return containsKeyValue(event, key);
  });
}

/**
 * Logs captured analytics events according to debugAnalytics and filterKey settings.
 * Applies filtering and prints either all matching events or a short "no events" message.
 */
function logEventsOnFailure(events: unknown[] | undefined) {
  const debugAnalytics = analyticsConfig.debugAnalytics;
  if (debugAnalytics === 'never') return;

  const allEvents = Array.isArray(events) ? events : [];

  const rawFilter = analyticsConfig.filterKey as unknown;

  const normalizedFilters: string[] = Array.isArray(rawFilter)
    ? (rawFilter as string[]).map(f => f.trim()).filter(f => f !== '')
    : typeof rawFilter === 'string' && rawFilter.trim() !== ''
      ? [(rawFilter as string).trim()]
      : [];

  const hasFilter = normalizedFilters.length > 0;

  const eventsToLog = hasFilter
    ? allEvents.filter(event => shouldIncludeEvent(event, normalizedFilters))
    : allEvents;

  const filterLabel = hasFilter ? normalizedFilters.join(', ') : '<<no filter>>';

  if (eventsToLog.length > 0) {
    console.log(`[AnalyticsSpy] Current events (filter: "${filterLabel}"):`);
    eventsToLog.forEach((event, index) => {
      console.log(
        `===== [AnalyticsSpy] Event ${index + 1} =====\n${JSON.stringify(event, null, 2)}`
      );
    });
  } else {
    console.log(`[AnalyticsSpy] No events captured (filter: "${filterLabel}")`);
  }
}

/**
 * Initializes analytics spying on the given page.
 *
 * @param page Playwright page instance
 *
 * @example
 * await initAnalyticsSpy(page);
 * await page.goto('https://example.com');
 */
export async function initAnalyticsSpy(page: Page) {
  analyticsEventsStore.set(page, []);

  await page.exposeFunction('__captureAnalyticsEvent', (event: unknown) => {
    const events = analyticsEventsStore.get(page) || [];
    events.push(event);
    analyticsEventsStore.set(page, events);
  });

  await page.addInitScript(() => {
    (window as any).__analyticsEvents = [];

    const win = window as any;

    // --- Adobe-style data layer (adobeDataLayer:change) ---
    if (!Array.isArray(win.adobeDataLayer)) {
      win.adobeDataLayer = win.adobeDataLayer || [];
    }
    win.adobeDataLayer.push((dl: any) => {
      if (dl && typeof dl.addEventListener === 'function') {
        dl.addEventListener('adobeDataLayer:change', (event: any) => {
          (window as any).__analyticsEvents?.push(event);
          if (typeof (window as any).__captureAnalyticsEvent === 'function') {
            (window as any).__captureAnalyticsEvent(event);
          }
        });
      }
    });

    // --- Google GTM dataLayer (array + push) ---
    win.dataLayer = win.dataLayer || [];

    if (!win.__analyticsSpyDataLayerWrapped) {
      win.__analyticsSpyDataLayerWrapped = true;

      const existingQueue = Array.isArray(win.dataLayer) ? [...win.dataLayer] : [];
      existingQueue.forEach(item => {
        if (item && typeof item === 'object') {
          (window as any).__analyticsEvents?.push(item);
          if (typeof (window as any).__captureAnalyticsEvent === 'function') {
            (window as any).__captureAnalyticsEvent(item);
          }
        }
      });

      win.__originalDataLayerPush =
        Array.isArray(win.dataLayer) && typeof win.dataLayer.push === 'function'
          ? win.dataLayer.push.bind(win.dataLayer)
          : function (...args: any[]) {
              for (const arg of args) {
                (win.dataLayer as any[]).push(arg);
              }
              return win.dataLayer.length;
            };

      win.dataLayer.push = function (...args: any[]) {
        args.forEach(arg => {
          if (arg && typeof arg === 'object') {
            (window as any).__analyticsEvents?.push(arg);
            if (typeof (window as any).__captureAnalyticsEvent === 'function') {
              (window as any).__captureAnalyticsEvent(arg);
            }
          }
        });

        return (win.__originalDataLayerPush as (...args: any[]) => any)(...args);
      };
    }
  });
}

/**
 * Waits for an analytics event matching the given fixture to appear in the captured events.
 *
 * Uses deep matching and optional dynamic replacements applied to the fixture.
 *
 * @param page Playwright page instance
 * @param fixtureName Name of the JSON fixture under `fixtures/analytics` (without extension, e.g. `button-click`)
 * @param replacements Optional placeholder-value map applied to the fixture
 *
 * @throws Error if the expected event is not found within the timeout
 *
 * @example
 * await initAnalyticsSpy(page);
 * await page.goto('https://example.com');
 * await page.click('button#cta');
 * await checkAnalyticsEvent(page, 'button-click');
 *
 * @remarks
 * - Fixtures are loaded via `loadFixtureWithReplacements` from `fixtures/analytics/{fixtureName}.json`.
 * - Matching is partial: only keys present in the fixture must be present and equal in the actual event.
 * - Timeout is based on Playwright's default timeout for the page (with a sensible fallback if unavailable).
 */
export async function checkAnalyticsEvent(
  page: Page,
  fixtureName: string,
  replacements?: Record<string, any>
) {
  const expectedEvent = loadFixtureWithReplacements(`analytics/${fixtureName}`, replacements);
  const stepLabel = `Check analytics event: ${fixtureName}`;

  const pageAny = page as any;
  const defaultTimeout: number =
    (typeof pageAny.timeout === 'function' && pageAny.timeout()) || 10000;
  const pollIntervalMs = 250;

  await pwt.step(stepLabel, async () => {
    const start = Date.now();

    while (Date.now() - start < defaultTimeout) {
      const events = analyticsEventsStore.get(page) || [];
      if (events.some(event => deepMatch(event, expectedEvent))) {
        if (analyticsConfig.debugAnalytics === 'always') {
          console.log(
            `Expected pattern (from fixture ${fixtureName}): ${JSON.stringify(
              expectedEvent,
              null,
              2
            )}`
          );
          logEventsOnFailure(events);
          console.log('Result: ✅ Expected analytics event found.');
        }
        return;
      }
      await page.waitForTimeout(pollIntervalMs);
    }

    const events = analyticsEventsStore.get(page) || [];

    if (
      analyticsConfig.debugAnalytics === 'always' ||
      analyticsConfig.debugAnalytics === 'ifFail'
    ) {
      console.log(
        `${stepLabel}\nExpected pattern (from fixture ${fixtureName}): ${JSON.stringify(
          expectedEvent,
          null,
          2
        )}`
      );
      logEventsOnFailure(events);
      console.log(`Result: ❌ Expected analytics event NOT found within ${defaultTimeout}ms.`);
    }

    throw new Error(
      `Expected analytics event not found within ${defaultTimeout}ms:\n${JSON.stringify(
        expectedEvent,
        null,
        2
      )}\n${JSON.stringify(events, null, 2)}`
    );
  });
}
