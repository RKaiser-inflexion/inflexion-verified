import { test, expect } from '@playwright/test';

test.describe('Admin Authentication', () => {
  test('should show login form initially', async ({ page }) => {
    await page.goto('/admin');
    
    // Zkontrolujeme, že tam je login formulář
    await expect(page.locator('h2')).toContainText('Inflexion SecOps');
    await expect(page.locator('input[type="text"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should fail with invalid credentials', async ({ page }) => {
    await page.goto('/admin');
    
    await page.fill('input[type="text"]', 'baduser');
    await page.fill('input[type="password"]', 'badpass');
    await page.click('button:has-text("Přihlásit do systému")');

    // Měli bychom vidět chybovou hlášku
    await expect(page.locator('.text-red-400')).toBeVisible();
    await expect(page.locator('.text-red-400')).toContainText('Neplatné');
  });

  // Poznámka: Test na úspěšné přihlášení vyžaduje nasetované .env (ADMIN_USERNAME a ADMIN_PASSWORD)
});
