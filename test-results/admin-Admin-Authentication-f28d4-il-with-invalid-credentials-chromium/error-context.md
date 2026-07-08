# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: admin.spec.ts >> Admin Authentication >> should fail with invalid credentials
- Location: tests/admin.spec.ts:13:7

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Přihlásit do systému")')

```

# Page snapshot

```yaml
- generic [ref=e1]:
  - banner [ref=e3]:
    - generic [ref=e4]:
      - link "Inflexion Verified Securing 4fin Network" [ref=e5] [cursor=pointer]:
        - /url: /
        - img [ref=e7]
        - generic [ref=e10]:
          - generic [ref=e11]: Inflexion Verified
          - generic [ref=e12]: Securing 4fin Network
      - generic [ref=e13]:
        - link "Databáze" [ref=e14] [cursor=pointer]:
          - /url: /
        - link "Technologie" [ref=e15] [cursor=pointer]:
          - /url: /technologie
        - link "Nahlásit podvod" [ref=e16] [cursor=pointer]:
          - /url: /report
        - generic [ref=e18]: Systém je aktivní
  - generic [ref=e23]:
    - generic [ref=e24]:
      - img [ref=e26]
      - heading "Inflexion SecOps" [level=1] [ref=e29]
      - paragraph [ref=e30]: Ověření totožnosti bezpečnostního analytika
    - generic [ref=e31]:
      - generic [ref=e32]:
        - generic [ref=e33]: Přihlašovací jméno
        - generic [ref=e34]:
          - generic:
            - img
          - textbox "Přihlašovací jméno" [ref=e35]: baduser
      - generic [ref=e36]:
        - generic [ref=e37]: Bezpečnostní heslo
        - generic [ref=e38]:
          - generic:
            - img
          - textbox "Bezpečnostní heslo" [active] [ref=e39]: badpass
      - button "Autentizovat" [ref=e40] [cursor=pointer]
  - contentinfo [ref=e41]:
    - generic [ref=e42]:
      - generic [ref=e43]:
        - img [ref=e44]
        - generic [ref=e47]: Inflexion Verified
      - generic [ref=e48]: © 2026 Inflexion & 4fin. Všechna práva vyhrazena.
  - alert [ref=e49]
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
  8  |     await expect(page.locator('h2')).toContainText('Inflexion SecOps');
  9  |     await expect(page.locator('input[type="text"]')).toBeVisible();
  10 |     await expect(page.locator('input[type="password"]')).toBeVisible();
  11 |   });
  12 | 
  13 |   test('should fail with invalid credentials', async ({ page }) => {
  14 |     await page.goto('/admin');
  15 |     
  16 |     await page.fill('input[type="text"]', 'baduser');
  17 |     await page.fill('input[type="password"]', 'badpass');
> 18 |     await page.click('button:has-text("Přihlásit do systému")');
     |                ^ Error: page.click: Test timeout of 30000ms exceeded.
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