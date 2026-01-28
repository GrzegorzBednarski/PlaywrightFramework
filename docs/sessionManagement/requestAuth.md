# Request auth helpers

← [Back to main documentation](../../README.md)
↑ [Back to Sessions](./sessions.md)

## Overview

Helpers for extracting auth-related values from intercepted requests.

## extractBearerAuthHeader

Gets the `Authorization` header value in `Bearer ...` format from an intercepted request.

**Implementation:** `utils/requestAuth.ts`

### Usage

```ts
import { extractBearerAuthHeader } from '../../utils/requestAuth';
import { waitForIntercept } from '../../utils/waitForIntercept';

const loginRequest = waitForIntercept(page, /* your intercept */);
// ...trigger the request...

const authHeader = await extractBearerAuthHeader(loginRequest);
// authHeader === 'Bearer eyJ...'
```
