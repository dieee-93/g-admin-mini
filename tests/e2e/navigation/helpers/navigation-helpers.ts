/**
 * Navigation Test Helpers
 * 
 * Shared utilities for E2E navigation tests
 * Based on actual sidebar behavior: hover-to-expand pattern
 */

import { Page, Locator, expect } from '@playwright/test';

// ============================================
// CONSTANTS
// ============================================

export const SIDEBAR_EXPAND_DELAY = 300; // Time for sidebar to expand
export const NAVIGATION_TIMEOUT = 5000; // Max time to wait for navigation

// ============================================
// SIDEBAR INTERACTION
// ============================================

/**
 * Expand the sidebar by hovering over it
 * Copied exactly from navigation-bug-detector.spec.ts (lines 305-313)
 */
export async function expandSidebar(page: Page): Promise<void> {
    const sidebar = page.locator('[data-testid="main-sidebar"]');
    if (await sidebar.isVisible()) {
        try {
            await sidebar.hover({ force: true, timeout: 2000 });
            await page.waitForTimeout(500); // Animation
        } catch (e) {
            console.log('⚠️ Hover failed, proceeding anyway...');
        }
    }
}

/**
 * Check if sidebar is expanded
 */
export async function isSidebarExpanded(page: Page): Promise<boolean> {
    const sidebar = page.locator('[data-testid="main-sidebar"]');
    const box = await sidebar.boundingBox();
    // Sidebar is expanded if width > 100px (collapsed is ~48px, expanded is ~240px)
    return box ? box.width > 100 : false;
}

// ============================================
// MODULE NAVIGATION
// ============================================

/**
 * Navigate to a module by clicking its sidebar item
 * Uses EXACT pattern from debug-navigation.spec.ts that passed
 * 
 * @param page - Playwright page object
 * @param moduleName - Module name (e.g., 'customers', 'materials', 'sales')
 * @param options - Navigation options
 */
export async function navigateToModule(
    page: Page,
    moduleName: string,
    options: {
        waitForLoad?: boolean;
        timeout?: number;
    } = {}
): Promise<void> {
    const { waitForLoad = true, timeout = NAVIGATION_TIMEOUT } = options;

    // First, expand the sidebar by hovering over it (EXACT pattern from working test)
    await expandSidebar(page);

    // Find the nav item (EXACT pattern from working test)
    const navItem = page.locator(`[data-testid="nav-item-${moduleName}"]`).first();

    // Check if visible (EXACT pattern from working test - uses isVisible, not expect)
    if (await navItem.isVisible({ timeout })) {
        // Click it (EXACT pattern from working test)
        await navItem.click({ timeout: 1000, force: true });

        // Wait for URL to change
        if (waitForLoad) {
            await page.waitForURL(`**/admin/**/${moduleName}**`, { timeout });
        }
    } else {
        throw new Error(`Navigation item for module "${moduleName}" is not visible`);
    }
}

/**
 * Navigate to multiple modules in sequence
 * Useful for testing navigation flow
 */
export async function navigateSequence(
    page: Page,
    moduleNames: string[]
): Promise<void> {
    for (const moduleName of moduleNames) {
        await navigateToModule(page, moduleName);
        await page.waitForTimeout(500); // Small delay between navigations
    }
}

// ============================================
// ASSERTIONS
// ============================================

/**
 * Assert that a module is visible in the sidebar
 */
export async function expectModuleVisible(
    page: Page,
    moduleName: string
): Promise<void> {
    // Expand sidebar first to see all modules
    await expandSidebar(page);

    const navItem = page.locator(`[data-testid="nav-item-${moduleName}"]`).first();
    await expect(navItem).toBeVisible({ timeout: 2000 });
}

/**
 * Assert that a module is NOT visible in the sidebar
 */
export async function expectModuleHidden(
    page: Page,
    moduleName: string
): Promise<void> {
    // Expand sidebar first
    await expandSidebar(page);

    const navItem = page.locator(`[data-testid="nav-item-${moduleName}"]`).first();
    await expect(navItem).not.toBeVisible({ timeout: 2000 });
}

/**
 * Assert that a module is marked as active
 */
export async function expectModuleActive(
    page: Page,
    moduleName: string
): Promise<void> {
    await expandSidebar(page);

    const navItem = page.locator(`[data-testid="nav-item-${moduleName}"]`).first();

    // Check if it has active state (you may need to adjust this based on your actual implementation)
    // This assumes there's a visual indicator or aria-current attribute
    await expect(navItem).toHaveAttribute('aria-current', 'page');
}

/**
 * Assert current URL matches expected module route
 */
export async function expectCurrentModule(
    page: Page,
    moduleName: string
): Promise<void> {
    await expect(page).toHaveURL(new RegExp(`/admin/.*/${moduleName}`));
}

/**
 * Get list of all visible modules in sidebar
 */
export async function getVisibleModules(page: Page): Promise<string[]> {
    await expandSidebar(page);

    const navItems = page.locator('[data-testid^="nav-item-"]');
    const count = await navItems.count();

    const moduleNames: string[] = [];
    for (let i = 0; i < count; i++) {
        const testId = await navItems.nth(i).getAttribute('data-testid');
        if (testId) {
            // Extract module name from data-testid="nav-item-customers"
            const moduleName = testId.replace('nav-item-', '');
            moduleNames.push(moduleName);
        }
    }

    return moduleNames;
}

// ============================================
// PAGE STATE
// ============================================

/**
 * Wait for page to be fully loaded
 * Checks for common loading indicators
 */
export async function waitForPageLoad(page: Page): Promise<void> {
    // Wait for network to be idle
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Wait for any loading spinners to disappear
    const spinner = page.locator('[data-testid="loading-spinner"]');
    if (await spinner.isVisible({ timeout: 1000 }).catch(() => false)) {
        await spinner.waitFor({ state: 'hidden', timeout: 5000 });
    }
}

/**
 * Check if page has error state
 */
export async function hasPageError(page: Page): Promise<boolean> {
    const errorIndicators = [
        '[data-testid="error-message"]',
        '[role="alert"]',
        '.error-boundary'
    ];

    for (const selector of errorIndicators) {
        const element = page.locator(selector).first();
        if (await element.isVisible({ timeout: 500 }).catch(() => false)) {
            return true;
        }
    }

    return false;
}

// ============================================
// AUTHENTICATION HELPERS
// ============================================

/**
 * Ensure user is logged in
 * Uses auth state from setup
 */
export async function ensureAuthenticated(page: Page): Promise<void> {
    // Check if we're on login page
    if (page.url().includes('/login')) {
        throw new Error('User is not authenticated. Make sure auth setup is correct.');
    }

    // Check for auth indicators
    const userMenu = page.locator('[data-testid="user-menu"]');
    await expect(userMenu).toBeVisible({ timeout: 5000 });
}

/**
 * Navigate to dashboard (home page)
 */
export async function navigateToDashboard(page: Page): Promise<void> {
    await page.goto('/admin/dashboard');
    await waitForPageLoad(page);
}
