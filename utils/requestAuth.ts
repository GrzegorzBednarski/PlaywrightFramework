import type { Request } from '@playwright/test';

/**
 * Gets `Authorization: Bearer ...` header value from an intercepted request.
 *
 * @param requestPromise Intercepted request (usually from `waitForIntercept(...)`).
 *
 * @example
 * const tokenRequestPromise = waitForIntercept(page, INTERCEPTS.USER_LOGIN);
 * // ...use login that triggers the request...
 * const authHeader = await extractBearerAuthHeader(tokenRequestPromise);
 * // authHeader === "Bearer eyJ..."
 */
export async function extractBearerAuthHeader(requestPromise: Promise<Request>): Promise<string> {
  const req = await requestPromise;
  const authHeader = req.headers()['authorization'] || '';

  if (!authHeader.startsWith('Bearer ')) {
    throw new Error('Missing Authorization Bearer header');
  }

  return authHeader;
}
