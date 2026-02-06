/**
 * Materials Module - ABC Analysis E2E Tests (Refactored)
 * 
 * Target Component: AnalyticsTabEnhanced.tsx
 * Verified Features:
 * - Tab navigation
 * - Dashboard visibility
 * - Metric Cards (A, B, C)
 * - Charts presence
 * - Detailed list sections
 */

import { test, expect } from '@playwright/test';

test.describe('Materials ABC Analysis', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test.beforeEach(async ({ page }) => {
    // 🎯 CRITICAL: Disable React Scan BEFORE loading page
    await page.addInitScript(() => {
      localStorage.setItem('playwright-test', 'true');
    });

    await page.goto('/admin/supply-chain/materials');

    // Wait for page load
    await expect(page.getByTestId('materials-page')).toBeVisible({ timeout: 60000 });
    await expect(page.getByTestId('materials-management-tabs')).toBeVisible();
  });

  test('should navigate to ABC Analysis and display dashboard', async ({ page }) => {
    // Navigate to ABC Analysis tab
    await page.getByTestId('abc-analysis-tab').click();

    // Verify main dashboard container
    await expect(page.getByTestId('abc-chart')).toBeVisible();

    // Verify Title
    await expect(page.getByText('Analytics & Análisis ABC')).toBeVisible();
  });

  test('should display ABC Class metric cards', async ({ page }) => {
    await page.getByTestId('abc-analysis-tab').click();
    await expect(page.getByTestId('abc-chart')).toBeVisible();

    // Verify Metric Cards
    await expect(page.getByTestId('category-A')).toBeVisible();
    await expect(page.getByTestId('category-B')).toBeVisible();
    await expect(page.getByTestId('category-C')).toBeVisible();

    // Verify Content inside cards (Titles)
    await expect(page.getByTestId('category-A')).toContainText('Clase A');
    await expect(page.getByTestId('category-B')).toContainText('Clase B');
    await expect(page.getByTestId('category-C')).toContainText('Clase C');
  });

  test('should display analysis charts', async ({ page }) => {
    await page.getByTestId('abc-analysis-tab').click();

    // Verify Chart Headings/Descriptions that we know exist
    await expect(page.getByText('Distribución ABC del Inventario')).toBeVisible();
    await expect(page.getByText('Evolución del Valor de Inventario')).toBeVisible();
    await expect(page.getByText('Top 10 Materiales por Valor')).toBeVisible();
  });

  test('should display detailed analysis lists', async ({ page }) => {
    await page.getByTestId('abc-analysis-tab').click();

    // Check for the "Detailed Analysis" section title
    await expect(page.getByText('Análisis Detallado por Clase')).toBeVisible();
  });
});
