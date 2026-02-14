# Cookies

← [Back to main documentation](../README.md)

## Overview

Central place for configuring predefined cookies and cookie scenarios used in tests.

---

## Cookies configuration

Cookie definitions live in `data/cookies.ts` in the `COOKIES` object. Example shape:

```ts
export const COOKIES = {
  COOKIE_BANNER_ACCEPTED: {
    name: 'cookie_banner_accepted',
    value: 'true',
    domain: 'example.com',
    path: '/',
    httpOnly: false,
    secure: true,
  },

  MARKETING_CONSENT_GIVEN: {
    name: 'marketing_consent',
    value: 'granted',
    domain: 'example.com',
    path: '/',
    httpOnly: false,
    secure: true,
  },
};
```

Guidelines:
- Keep all cookie definitions in `data/cookies.ts`.
- Use meaningful keys that describe the behavior (e.g. `COOKIE_BANNER_ACCEPTED`).
- Align `domain`, `path`, and security flags (`httpOnly`, `secure`) with your environment.

For using individual cookies in tests, see **[Set Cookies](./setCookies.md)**.

### Dynamic cookie domains

If your environments use different hostnames, you can derive the cookie domain from `BASE_URL` instead of hardcoding it. For example, in `data/cookies.ts`:

```ts
// const baseDomain = (process.env.BASE_URL || '')
//   .replace(/^https?:\/\//, '')
//   .replace(/\/.*$/, '');
// Use baseDomain variable to set the domain dynamically, e.g.:
// domain: `.${baseDomain}`,
```

This allows the same cookie definitions to work across environments (dev, qa, stg) as long as `BASE_URL` is set correctly in your `.env` files.

---

## Cookie scenarios configuration

Reusable combinations of cookies are defined next to cookies in `data/cookies.ts`:

```ts
export const COOKIE_SCENARIOS = {
  privacyMinimal: ['COOKIE_BANNER_ACCEPTED'],
  fullTracking: ['COOKIE_BANNER_ACCEPTED', 'MARKETING_CONSENT_GIVEN', 'REMEMBER_ME_ENABLED'],
};
```

Use these scenarios in tests via the `setCookiesScenario` helper (see **[Set Cookies Scenario](./setCookiesScenario.md)**).
