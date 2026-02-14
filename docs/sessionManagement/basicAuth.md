# Basic Auth

← [Back to main documentation](../../README.md)
↑ [Back to Sessions](./sessions.md)

## Overview

Use HTTP Basic Authentication via the `useBasicAuth` helper.

---

## Configuration

Basic Auth credentials are read from `.env`.
See: **[Environments](../environments.md#basic-auth-naming-convention)**.

---

## Usage

#### 1) Global Basic Auth (per environment / domain)

Use this when the whole environment (or domain) is protected by the same Basic Auth credentials.

```ts
import { useBasicAuth } from '../../utils/basicAuth';

await useBasicAuth(page);
```

#### 2) Per-user Basic Auth

Use this when Basic Auth credentials are provided per user key.

```ts
import { useBasicAuth } from '../../utils/basicAuth';

await useBasicAuth(page, 'ADMIN');
```

---

## Advanced patterns

**Basic Auth automation:**
- [Global](../pageObjectModel/advancedPatterns.md#global-basic-auth-per-domain--per-environment)
- [Per-user](../pageObjectModel/advancedPatterns.md#per-user-basic-auth)
