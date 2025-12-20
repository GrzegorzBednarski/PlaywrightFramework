# Request Assertions

← [Back to main documentation](../README.md)

Guidelines and examples for asserting HTTP requests in Playwright tests.

In examples below requests are captured using **[waitForIntercept](./waitForIntercept.md)**.

## Requests

Common **`Request` fields and methods** used in tests, with examples.

- **`request.url()`** – full request URL

  ```typescript
  const request = await waitForIntercept(page, INTERCEPTS.USER_LOGIN);

  expect(request.url()).toContain('/orgUsers/');
  ```

- **`request.method()`** – HTTP method (e.g. `GET`, `POST`)

  ```typescript
  const request = await waitForIntercept(page, INTERCEPTS.USER_LOGIN);

  expect(request.method()).toBe('POST');
  ```

- **`request.headers()`** – headers as key–value object

  ```typescript
  const request = await waitForIntercept(page, INTERCEPTS.USER_LOGIN);

  const headers = request.headers();
  expect(headers['x-correlation-id']).toBeDefined();
  expect(headers['authorization']).toContain('Bearer ');
  ```

- **`request.postDataJSON()`** – parsed JSON payload (if body is JSON), useful for checking business fields

  ```typescript
  const request = await waitForIntercept(page, INTERCEPTS.USER_LOGIN);

  const payload = await request.postDataJSON();
  expect(payload.email).toBe('test.user@example.com');
  ```

- **`request.postData()`** – raw request body as string (if present), useful when payload is not JSON

  ```typescript
  const request = await waitForIntercept(page, INTERCEPTS.API_SEARCH);

  const rawBody = request.postData();
  expect(rawBody).toContain('searchTerm=playwright');
  ```

- **`request.resourceType()`** – request type (e.g. `xhr`, `fetch`)

  ```typescript
  const request = await waitForIntercept(page, INTERCEPTS.USER_LOGIN);

  expect(request.resourceType()).toBe('xhr');
  ```
