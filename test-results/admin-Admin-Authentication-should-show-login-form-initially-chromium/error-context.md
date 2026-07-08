# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin.spec.ts >> Admin Authentication >> should show login form initially
- Location: tests/admin.spec.ts:4:7

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('h2')
Expected substring: "Inflexion SecOps"
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" with timeout 5000ms
  - waiting for locator('h2')

```

```yaml
- banner:
  - link "Inflexion Verified Securing 4fin Network":
    - /url: /
  - link "Databáze":
    - /url: /
  - link "Technologie":
    - /url: /technologie
  - link "Nahlásit podvod":
    - /url: /report
  - text: Systém je aktivní
- heading "Inflexion SecOps" [level=1]
- paragraph: Ověření totožnosti bezpečnostního analytika
- text: Přihlašovací jméno
- textbox "Přihlašovací jméno"
- text: Bezpečnostní heslo
- textbox "Bezpečnostní heslo"
- button "Autentizovat"
- contentinfo: Inflexion Verified © 2026 Inflexion & 4fin. Všechna práva vyhrazena.
- alert
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Admin Authentication', () => {
  4  |   test('should show login form initially', async ({ page }) => {
  5  |     await page.goto('/admin');
  6  |     
  7  |     // Zkontrolujeme, že tam je login formulář
> 8  |     await expect(page.locator('h2')).toContainText('Inflexion SecOps');
     |                                      ^ Error: expect(locator).toContainText(expected) failed
  9  |     await expect(page.locator('input[type="text"]')).toBeVisible();
  10 |     await expect(page.locator('input[type="password"]')).toBeVisible();
  11 |   });
  12 | 
  13 |   test('should fail with invalid credentials', async ({ page }) => {
  14 |     await page.goto('/admin');
  15 |     
  16 |     await page.fill('input[type="text"]', 'baduser');
  17 |     await page.fill('input[type="password"]', 'badpass');
  18 |     await page.click('button:has-text("Přihlásit do systému")');
  19 | 
  20 |     // Měli bychom vidět chybovou hlášku
  21 |     await expect(page.locator('.text-red-400')).toBeVisible();
  22 |     await expect(page.locator('.text-red-400')).toContainText('Neplatné');
  23 |   });
  24 | 
  25 |   // Poznámka: Test na úspěšné přihlášení vyžaduje nasetované .env (ADMIN_USERNAME a ADMIN_PASSWORD)
  26 | });
  27 | 
```