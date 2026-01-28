# Page Object Model

← [Back to main documentation](../../README.md)
↑ [Back to Page Object Model](./index.md)

Short, practical guidelines for structuring page objects, components, and fixtures.

## Overview

In this framework we keep tests simple by exposing ready-to-use Page Objects via fixtures.

## Quick start (what to create)

Typical setup for a new domain:

1. **Create a [BasePage](./basePage.md)** - shared navigation and common behaviour.
2. **(Optional) Create an [AppPage](./appPage.md)** - an `AppPage` that extends `BasePage` and contains shared layout components.
   Use it when most pages share the same layout or when the layout changes after login (for example: different header/footer when logged in).
3. **Create [components](./components.md)** - reusable UI pieces such as `header`, `footer`, `cookiePrompt`, dialogs.
4. **Create concrete [pages](./pages.md)** - e.g. `HomePage`, `LoginPage`, `MyProfilePage`.
   Most pages typically extend `AppPage`, while `LoginPage` often extends only `BasePage`.
5. **Wire [fixtures](./fixtures.md)** - make tests easier by automating POM creation (so you don't have to create page objects in tests) and by providing hooks for automation like login, cookie injection, basic auth, etc.
6. **(Optional) [Advanced patterns](./advancedPatterns.md)** - if you need multiple fixtures, different layouts, or more complex structure.

## Structure

POM files live under **`pageObjects/`** and are grouped by domain.

Example structure (generic `example` domain):

```
pageObjects/
  example/
    components/
      cookiePrompt.component.ts
      footer.component.ts
      header.component.ts
    pages/
      home.page.ts
      login.page.ts
      myProfile.page.ts
    app.page.ts
    base.page.ts
    pageFixture.ts
```
