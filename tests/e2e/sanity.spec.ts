
import { test, expect } from '@playwright/test';

test('Sanity check', async ({ page }) => {
    console.log('Navigating to dashboard...');
    await page.goto('/admin/dashboard');
    console.log('Waiting for Dashboard text...');
    // Use a reliable selector if possible, or broad text
    await expect(page.locator('body')).toContainText('Dashboard');
    console.log('Sanity check passed.');
});
