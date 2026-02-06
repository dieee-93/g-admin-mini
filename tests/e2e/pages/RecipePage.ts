import { type Locator, type Page, expect } from '@playwright/test';

export class RecipePage {
    readonly page: Page;
    readonly newRecipeButton: Locator;
    readonly nameInput: Locator;
    readonly descriptionInput: Locator;
    readonly addMaterialButton: Locator;
    readonly materialSearchInput: Locator;
    readonly confirmRowButton: Locator;
    readonly saveButton: Locator;
    readonly totalCostLabel: Locator;

    constructor(page: Page) {
        this.page = page;
        // Header button "Nueva Receta"
        this.newRecipeButton = page.getByRole('button', { name: 'Nueva Receta', exact: true });

        // Inputs
        // Using strict semantic label selectors (Best Practice)
        this.nameInput = page.getByLabel('Nombre de la Receta');
        this.descriptionInput = page.getByLabel('Descripción');

        // Actions
        this.addMaterialButton = page.getByTestId('recipe-add-input-button');
        this.materialSearchInput = page.getByPlaceholder('Buscar materia prima...');
        this.confirmRowButton = page.getByLabel('Confirmar');
        this.saveButton = page.getByTestId('recipe-save-button');

        // Verification elements
        this.totalCostLabel = page.getByText(/Costo Total:/i);
    }

    async goto() {
        await this.page.goto('/admin/supply-chain/recipes');
        await expect(this.page).toHaveURL(/\/admin\/supply-chain\/recipes/);
    }

    async initiateCreation() {
        await expect(this.newRecipeButton).toBeVisible();
        await this.newRecipeButton.click();
        await expect(this.nameInput).toBeVisible({ timeout: 15000 });
    }

    async fillBasicInfo(name: string, description: string) {
        await this.nameInput.fill(name);
        await this.descriptionInput.fill(description);
    }

    async addMaterial(materialName: string, quantity: string, unit?: string) {
        await this.addMaterialButton.click();

        await expect(this.materialSearchInput).toBeVisible();
        await this.materialSearchInput.fill(materialName);

        // Wait for search results and select first one
        // Using simple keyboard navigation for speed as per previous working test
        // Wait for search results and select the specific material
        // We use getByText with correct scope to avoid ambiguity
        // Wait for search results and select the specific material
        const option = this.page.getByRole('dialog').getByText(materialName).first();
        await expect(option).toBeVisible();
        await option.click();

        // Scope to the active row (the one with the Confirm/Check button)
        // We find the row that contains the specific inputs we just enabled/added
        // Since "Confirmar" button is unique to the editing row(s), and we do one at a time:
        const confirmBtn = this.page.getByLabel('Confirmar');
        await expect(confirmBtn).toBeVisible();

        // Get the row container for this confirm button to scope inputs
        const activeRow = this.page.locator('tr').filter({ has: confirmBtn });

        // Handle Quantity Input within the active row
        const quantityInput = activeRow.getByLabel('Cantidad');
        await quantityInput.fill(quantity);

        // Handle Unit Selection if provided
        if (unit) {
            const unitSelect = activeRow.getByLabel('Unidad');
            await expect(unitSelect).toBeVisible();
            await unitSelect.selectOption(unit);
        }

        await confirmBtn.click();
    }

    async save() {
        await expect(this.saveButton).toBeEnabled();
        await this.saveButton.click();
    }

    async verifySuccess() {
        await expect(this.page.getByText(/exitosamente/i)).toBeVisible({ timeout: 10000 });
    }
}
