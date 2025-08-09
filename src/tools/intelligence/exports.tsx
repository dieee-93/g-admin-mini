// Intelligence Tools - Recipe Intelligence, Menu Engineering, Business Analytics
export * from './types';
export * from './logic/useRecipes';
export * from './data/recipeApi';
export * from './ui/RecipeForm';
export * from './ui/RecipeList';
export * from './components/SmartCostCalculator/SmartCostCalculator';
export * from './components/MenuEngineeringMatrix/MenuEngineeringMatrix';
export * from './components/MiniBuilders/QuickRecipeBuilder';
export * from './components/RecipeIntelligenceDashboard/RecipeIntelligenceDashboard';
export * from './components/MenuEngineering/MenuEngineeringAnalysis';

// Business Analytics (future expansion)
export * from './analytics';

// Main page component
export { default as RecipesPageRefactored } from './RecipesPageRefactored';
export { default as RecipesModule } from './index';