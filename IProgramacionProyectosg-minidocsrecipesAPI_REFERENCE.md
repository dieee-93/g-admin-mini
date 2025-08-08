# Recipe Intelligence System - API Reference

## Core API Functions

### 1. Recipe Retrieval

#### `fetchRecipes()`
Retrieves all recipes with complete metadata.

```typescript
async function fetchRecipes(): Promise<Recipe[]>
```

**Parameters:** None
**Returns:** Array of Recipe objects with full details including ingredients and output items

#### `fetchRecipeById(id: string)`
Retrieves a specific recipe by its unique identifier.

```typescript
async function fetchRecipeById(id: string): Promise<Recipe>
```

**Parameters:**
- `id`: Unique recipe identifier (string)
**Returns:** Complete Recipe object with full details

### 2. Recipe Management

#### `createRecipe(recipeData: CreateRecipeData)`
Creates a new recipe with ingredients.

```typescript
async function createRecipe(recipeData: CreateRecipeData): Promise<Recipe>
```

**Parameters:**
- `recipeData`: Recipe creation payload
  - `name`: Recipe name
  - `output_item_id`: ID of the produced item
  - `output_quantity`: Number of items produced
  - `ingredients`: Array of ingredient mappings

#### `updateRecipe(id: string, updates: Partial<CreateRecipeData>)`
Updates an existing recipe.

```typescript
async function updateRecipe(id: string, updates: Partial<CreateRecipeData>): Promise<Recipe>
```

**Parameters:**
- `id`: Recipe identifier
- `updates`: Partial recipe data to modify

#### `deleteRecipe(id: string)`
Removes a recipe from the system.

```typescript
async function deleteRecipe(id: string): Promise<void>
```

### 3. Advanced Intelligence Functions

#### `fetchRecipesWithCosts()`
Retrieves recipes with comprehensive cost information.

```typescript
async function fetchRecipesWithCosts(): Promise<RecipeWithCost[]>
```

#### `calculateRecipeCost(recipeId: string)`
Calculates the total cost of a recipe with advanced yield management.

```typescript
async function calculateRecipeCost(recipeId: string): Promise<number>
```

#### `checkRecipeViability(recipeId: string)`
Checks ingredient availability and recipe executability.

```typescript
async function checkRecipeViability(recipeId: string): Promise<RecipeViability>
```

#### `executeRecipe(recipeId: string, batches: number = 1)`
Simulates recipe production, tracking consumed and produced items.

```typescript
async function executeRecipe(recipeId: string, batches: number = 1): Promise<RecipeExecution>
```

## Cost Calculation Engine

### `SmartCostCalculationEngine.calculateRecipeCostWithYield()`
Advanced cost calculation method with multiple economic metrics.

```typescript
interface CostCalculationResult {
  total_cost: number;
  cost_per_unit: number;
  cost_per_portion: number;
  ingredient_breakdown: any[];
  yield_analysis: Record<string, unknown>;
  profitability_metrics: {
    suggested_selling_price: number;
    profit_margin: number;
    food_cost_percentage: number;
  };
}
```

## Menu Engineering Engine

### `MenuEngineeringEngine.categorizeRecipe()`
Categorizes recipes based on popularity and profitability.

```typescript
function categorizeRecipe(
  popularityScore: number, 
  profitabilityScore: number
): MenuCategory
```

**Categories:**
- `stars`: High popularity, high profitability
- `plowhorses`: High popularity, low profitability
- `puzzles`: Low popularity, high profitability
- `dogs`: Low popularity, low profitability

## Error Handling
- All async functions throw errors for failed operations
- Use try/catch blocks when invoking API methods
- Comprehensive error logging available

## Performance Notes
- Optimized for sub-millisecond responses
- Utilizes Supabase RPC for efficient database interactions
- Supports batch processing and intelligent caching
EOF < /dev/null
