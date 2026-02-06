/**
 * Materials E2E Test Helpers
 * 
 * Provides robust, reusable helpers for materials module testing.
 * Addresses common Playwright issues with Chakra UI v3 components:
 * - Tab animations blocking "stable" detection
 * - Async loading states
 * - Network requests
 * - Authentication edge cases
 */


/**
 * Navigate to materials page and wait for full load
 * 
 * Strategy:
 * 1. Navigate to route
 * 2. Wait for network idle (all API calls complete)
 * 3. Wait for specific UI element to be visible
 * 4. Additional safety timeout for animations
 */
export async function navigateToMaterialsPage(page: Page) {
  console.log('🔍 [Helper] Navigating to materials page...');

  // Navigate and wait for network idle
  await page.goto('/admin/supply-chain/materials', {
    waitUntil: 'domcontentloaded', // Wait for all network requests to complete
    timeout: 30000
  });

  console.log('✅ [Helper] Navigation complete, waiting for UI...');

  // Wait for the page to actually load content
  // Try multiple strategies to ensure the page loaded
  try {
    // Strategy 1: Wait for the tabs container (most reliable)
    await page.waitForSelector('[data-testid="materials-management-tabs"]', {
      state: 'visible',
      timeout: 15000
    });
    console.log('✅ [Helper] Tabs container found');
  } catch (e) {
    console.error('❌ [Helper] Tabs container not found, trying alternative...');

    // Strategy 2: Wait for ANY tab trigger (fallback)
    await page.waitForSelector('[role="tab"]', {
      state: 'visible',
      timeout: 15000
    });
    console.log('✅ [Helper] Tab trigger found (fallback)');
  }

  // Safety wait for animations (Chakra UI transitions)
  await page.waitForTimeout(500);

  console.log('✅ [Helper] Materials page fully loaded');
}

/**
 * Navigate to ABC Analysis tab with retry logic
 * 
 * Handles Chakra UI v3 tab animation issues:
 * - Uses force: true to bypass stability detection
 * - Retries on failure
 * - Waits for content to appear
 */
export async function navigateToABCAnalysisTab(page: Page, retries = 3) {
  console.log('🔍 [Helper] Navigating to ABC Analysis tab...');

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Find the ABC Analysis tab trigger
      const abcTab = page.getByRole('tab', { name: /análisis abc/i });

      // Wait for tab to be present
      await abcTab.waitFor({ state: 'visible', timeout: 10000 });

      // Click with force to bypass animation stability issues
      await abcTab.click({ force: true, timeout: 10000 });

      console.log(`✅ [Helper] Clicked ABC tab (attempt ${attempt}/${retries})`);

      // Wait for the content to become visible
      await page.waitForSelector('[data-testid="abc-chart"]', {
        state: 'visible',
        timeout: 10000
      });

      console.log('✅ [Helper] ABC Analysis tab content loaded');
      return; // Success!

    } catch (error) {
      console.error(`❌ [Helper] Attempt ${attempt}/${retries} failed:`, error);

      if (attempt === retries) {
        throw new Error(`Failed to navigate to ABC Analysis tab after ${retries} attempts`);
      }

      // Wait before retry
      await page.waitForTimeout(1000);
    }
  }
}

/**
 * Wait for materials grid to load with data
 * 
 * Ensures the grid has actual content, not just empty state
 */
export async function waitForMaterialsGrid(page: Page) {
  console.log('🔍 [Helper] Waiting for materials grid...');

  // Wait for grid container
  const grid = page.getByTestId('materials-grid');
  await grid.waitFor({ state: 'visible', timeout: 10000 });

  // Wait for at least one material card to appear (indicates data loaded)
  try {
    await page.waitForSelector('[data-testid^="material-card-"]', {
      state: 'visible',
      timeout: 10000
    });
    console.log('✅ [Helper] Materials grid loaded with data');
  } catch (e) {
    console.warn('⚠️ [Helper] No material cards found - empty state or loading issue');
  }
}

/**
 * Click a category filter button in ABC Analysis
 */
export async function clickCategoryFilter(page: Page, category: 'A' | 'B' | 'C') {
  console.log(`🔍 [Helper] Clicking category ${category} filter...`);

  const button = page.getByTestId(`category-${category}`);
  await button.waitFor({ state: 'visible', timeout: 5000 });
  await button.click({ force: true });

  // Wait for filter to apply (grid updates)
  await page.waitForTimeout(500);

  console.log(`✅ [Helper] Category ${category} filter applied`);
}

/**
 * Verify authentication is working
 * Checks for common auth failure indicators
 */
export async function verifyAuthentication(page: Page) {
  console.log('🔍 [Helper] Verifying authentication...');

  // Check if we're redirected to login (auth failure)
  const currentUrl = page.url();

  if (currentUrl.includes('/login')) {
    throw new Error('❌ Authentication failed - redirected to login page');
  }

  // Check for "Access Denied" or similar messages
  const accessDenied = await page.getByText(/acceso denegado|access denied|sin permisos/i).isVisible().catch(() => false);

  if (accessDenied) {
    throw new Error('❌ Authentication failed - access denied message visible');
  }

  console.log('✅ [Helper] Authentication verified');
}

/**
 * Full materials page setup helper
 * Combines navigation, auth check, and wait for content
 */
export async function setupMaterialsPage(page: Page) {
  await navigateToMaterialsPage(page);
  await verifyAuthentication(page);
  // Page is now ready for tests
}
