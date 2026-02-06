import { test } from '@playwright/test';
import { RecipePage } from '../pages/RecipePage';

test.describe('Recipe Builder - Create Recipe', () => {
    test('should verify happy path for creating a simple recipe', async ({ page }) => {
        const recipePage = new RecipePage(page);

        console.log('Starting POM test...');

        // 1. Navigation
        await recipePage.goto();

        // 2. Open Builder
        // 2. Open Builder
        await recipePage.initiateCreation();

        // 3. Fill Info
        await recipePage.fillBasicInfo('Test Burger POM', 'Description via Page Object');

        // 4. Add Ingredients
        // Note: 'Harina' is a known material from previous runs
        // 4. Add Ingredients
        // Add multiple materials to verify table robustness
        await recipePage.addMaterial('Harina', '5'); // Existing (default unit)
        await recipePage.addMaterial('Manzana', '2', 'kg'); // Measurable
        await recipePage.addMaterial('Latas de tomate', '3'); // Countable (default unit)

        // 5. Save & Verify
        await recipePage.save();
        await recipePage.verifySuccess();

        console.log('Test completed successfully via POM.');
    });
});
