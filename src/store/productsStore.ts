import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { produce } from 'immer';

// Product Types
export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  cost: number;
  margin: number;
  prep_time: number;
  active: boolean;
  created_at: string;
  updated_at: string;
  
  // Menu Engineering
  popularity_score: number;
  profitability_score: number;
  menu_classification: 'star' | 'plow_horse' | 'puzzle' | 'dog';
  
  // Components & Recipes
  components: ProductComponent[];
  recipe?: Recipe;
  
  // Analytics
  sales_count: number;
  revenue_total: number;
  last_sold?: string;
}

export interface ProductComponent {
  id: string;
  material_id: string;
  material_name: string;
  quantity: number;
  unit: string;
  cost_per_unit: number;
  total_cost: number;
}

export interface Recipe {
  id: string;
  steps: RecipeStep[];
  total_prep_time: number;
  difficulty: 'easy' | 'medium' | 'hard';
  servings: number;
  notes?: string;
}

export interface RecipeStep {
  id: string;
  order: number;
  instruction: string;
  duration?: number;
  temperature?: number;
  equipment?: string;
}

// Menu Engineering Types
export interface MenuEngineeringAnalysis {
  stars: Product[];
  plowHorses: Product[];
  puzzles: Product[];
  dogs: Product[];
  averageMargin: number;
  totalRevenue: number;
  recommendations: MenuRecommendation[];
}

export interface MenuRecommendation {
  type: 'promote' | 'redesign' | 'remove' | 'price_increase' | 'price_decrease';
  product_id: string;
  reason: string;
  expected_impact: string;
  priority: 'low' | 'medium' | 'high';
}

// Cost Analysis Types
export interface CostAnalysis {
  product_id: string;
  material_costs: number;
  labor_costs: number;
  overhead_costs: number;
  total_cost: number;
  target_price: number;
  recommended_price: number;
  margin_analysis: MarginAnalysis;
}

export interface MarginAnalysis {
  current_margin: number;
  target_margin: number;
  competitor_average: number;
  optimal_price_point: number;
  break_even_volume: number;
}

export interface ProductsFilters {
  search: string;
  category: string;
  status: 'all' | 'active' | 'inactive';
  classification: 'all' | 'star' | 'plow_horse' | 'puzzle' | 'dog';
  sortBy: 'name' | 'price' | 'margin' | 'popularity' | 'created';
  sortOrder: 'asc' | 'desc';
}

export interface ProductsState {
  // Data
  products: Product[];
  categories: string[];
  
  // UI State
  loading: boolean;
  error: string | null;
  filters: ProductsFilters;
  selectedProducts: string[];
  isModalOpen: boolean;
  modalMode: 'add' | 'edit' | 'view' | 'components' | 'recipe';
  currentProduct: Product | null;
  
  // Menu Engineering
  menuAnalysis: MenuEngineeringAnalysis;
  costAnalyses: CostAnalysis[];
  
  // Analytics
  stats: {
    totalProducts: number;
    activeProducts: number;
    averagePrice: number;
    averageMargin: number;
    topSelling: Product[];
    lowPerforming: Product[];
  };
  
  // Actions
  setProducts: (products: Product[]) => void;
  addProduct: (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  toggleProductStatus: (id: string) => void;
  updateProductComponents: (id: string, components: ProductComponent[]) => void;
  updateProductRecipe: (id: string, recipe: Recipe) => void;
  
  // Menu Engineering Actions
  calculateMenuEngineering: () => void;
  updateMenuClassification: (id: string, classification: Product['menu_classification']) => void;
  generateMenuRecommendations: () => void;
  
  // Cost Analysis Actions
  calculateCostAnalysis: (id: string) => void;
  updateCostAnalyses: (analyses: CostAnalysis[]) => void;
  recalculateAllCosts: () => void;
  
  // UI Actions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: Partial<ProductsFilters>) => void;
  resetFilters: () => void;
  
  // Selection Actions
  selectProduct: (id: string) => void;
  deselectProduct: (id: string) => void;
  selectAll: () => void;
  deselectAll: () => void;
  
  // Modal Actions
  openModal: (mode: ProductsState['modalMode'], product?: Product) => void;
  closeModal: () => void;
  
  // Stats
  refreshStats: () => void;
  
  // Computed Selectors
  getFilteredProducts: () => Product[];
  getProductsByCategory: () => Record<string, Product[]>;
  getProductsByClassification: (classification: Product['menu_classification']) => Product[];
  getTopPerformers: (limit?: number) => Product[];
  getLowPerformers: (limit?: number) => Product[];
  getProductCost: (id: string) => number;
  getProductMargin: (id: string) => number;
}

const initialFilters: ProductsFilters = {
  search: '',
  category: 'all',
  status: 'all',
  classification: 'all',
  sortBy: 'name',
  sortOrder: 'asc'
};

const initialMenuAnalysis: MenuEngineeringAnalysis = {
  stars: [],
  plowHorses: [],
  puzzles: [],
  dogs: [],
  averageMargin: 0,
  totalRevenue: 0,
  recommendations: []
};

export const useProductsStore = create<ProductsState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        products: [],
        categories: [],
        
        loading: false,
        error: null,
        filters: initialFilters,
        selectedProducts: [],
        isModalOpen: false,
        modalMode: 'add',
        currentProduct: null,
        
        menuAnalysis: initialMenuAnalysis,
        costAnalyses: [],
        
        stats: {
          totalProducts: 0,
          activeProducts: 0,
          averagePrice: 0,
          averageMargin: 0,
          topSelling: [],
          lowPerforming: []
        },

        // Actions
        setProducts: (products) => {
          set(produce((state: ProductsState) => {
            state.products = products.map(product => ({
              ...product,
              margin: calculateMargin(product.price, product.cost),
              menu_classification: product.menu_classification || 'dog'
            }));
            
            // Extract categories
            const cats = [...new Set(products.map(p => p.category))];
            state.categories = cats.sort();
          }));
          get().refreshStats();
          get().calculateMenuEngineering();
        },

        addProduct: (productData) => {
          set(produce((state: ProductsState) => {
            const newProduct: Product = {
              ...productData,
              id: crypto.randomUUID(),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              margin: calculateMargin(productData.price, productData.cost),
              menu_classification: 'dog', // Default classification
              sales_count: 0,
              revenue_total: 0,
              popularity_score: 0,
              profitability_score: calculateProfitabilityScore(productData.price, productData.cost),
              components: productData.components || [],
              recipe: productData.recipe
            };
            state.products.push(newProduct);
            
            // Update categories
            if (!state.categories.includes(newProduct.category)) {
              state.categories.push(newProduct.category);
              state.categories.sort();
            }
          }));
          get().refreshStats();
          get().calculateMenuEngineering();
        },

        updateProduct: (id, updates) => {
          set(produce((state: ProductsState) => {
            const productIndex = state.products.findIndex(p => p.id === id);
            if (productIndex >= 0) {
              const product = { ...state.products[productIndex], ...updates };
              product.updated_at = new Date().toISOString();
              
              // Recalculate derived fields
              if (updates.price !== undefined || updates.cost !== undefined) {
                product.margin = calculateMargin(product.price, product.cost);
                product.profitability_score = calculateProfitabilityScore(product.price, product.cost);
              }
              
              state.products[productIndex] = product;
            }
          }));
          get().refreshStats();
        },

        deleteProduct: (id) => {
          set(produce((state: ProductsState) => {
            state.products = state.products.filter(p => p.id !== id);
            state.selectedProducts = state.selectedProducts.filter(pId => pId !== id);
          }));
          get().refreshStats();
        },

        toggleProductStatus: (id) => {
          const product = get().products.find(p => p.id === id);
          if (product) {
            get().updateProduct(id, { active: !product.active });
          }
        },

        updateProductComponents: (id, components) => {
          const totalComponentCost = components.reduce((sum, comp) => sum + comp.total_cost, 0);
          get().updateProduct(id, { 
            components,
            cost: totalComponentCost
          });
        },

        updateProductRecipe: (id, recipe) => {
          get().updateProduct(id, { 
            recipe,
            prep_time: recipe.total_prep_time
          });
        },

        // Menu Engineering Actions
        calculateMenuEngineering: () => {
          set(produce((state: ProductsState) => {
            const products = state.products;
            if (products.length === 0) return;

            // Calculate averages
            const avgPopularity = products.reduce((sum, p) => sum + p.popularity_score, 0) / products.length;
            const avgProfitability = products.reduce((sum, p) => sum + p.profitability_score, 0) / products.length;

            // Classify products
            const classified = products.map(product => {
              let classification: Product['menu_classification'];
              
              if (product.popularity_score >= avgPopularity && product.profitability_score >= avgProfitability) {
                classification = 'star';
              } else if (product.popularity_score >= avgPopularity && product.profitability_score < avgProfitability) {
                classification = 'plow_horse';
              } else if (product.popularity_score < avgPopularity && product.profitability_score >= avgProfitability) {
                classification = 'puzzle';
              } else {
                classification = 'dog';
              }
              
              return { ...product, menu_classification: classification };
            });

            // Update products with classifications
            state.products = classified;

            // Update menu analysis
            state.menuAnalysis = {
              stars: classified.filter(p => p.menu_classification === 'star'),
              plowHorses: classified.filter(p => p.menu_classification === 'plow_horse'),
              puzzles: classified.filter(p => p.menu_classification === 'puzzle'),
              dogs: classified.filter(p => p.menu_classification === 'dog'),
              averageMargin: products.reduce((sum, p) => sum + p.margin, 0) / products.length,
              totalRevenue: products.reduce((sum, p) => sum + p.revenue_total, 0),
              recommendations: []
            };
          }));
          get().generateMenuRecommendations();
        },

        updateMenuClassification: (id, classification) => {
          get().updateProduct(id, { menu_classification: classification });
        },

        generateMenuRecommendations: () => {
          set(produce((state: ProductsState) => {
            const recommendations: MenuRecommendation[] = [];
            const { stars, plowHorses, puzzles, dogs } = state.menuAnalysis;

            // Recommendations for stars
            stars.forEach(product => {
              if (product.margin < 60) {
                recommendations.push({
                  type: 'price_increase',
                  product_id: product.id,
                  reason: 'High popularity star item with low margin',
                  expected_impact: 'Increase profitability without losing popularity',
                  priority: 'medium'
                });
              } else {
                recommendations.push({
                  type: 'promote',
                  product_id: product.id,
                  reason: 'Top performing item',
                  expected_impact: 'Feature prominently to maximize revenue',
                  priority: 'high'
                });
              }
            });

            // Recommendations for plow horses
            plowHorses.forEach(product => {
              recommendations.push({
                type: 'price_increase',
                product_id: product.id,
                reason: 'Popular item with low profitability',
                expected_impact: 'Improve margins through strategic pricing',
                priority: 'high'
              });
            });

            // Recommendations for puzzles
            puzzles.forEach(product => {
              recommendations.push({
                type: 'promote',
                product_id: product.id,
                reason: 'High margin item with low popularity',
                expected_impact: 'Increase visibility and sales',
                priority: 'medium'
              });
            });

            // Recommendations for dogs
            dogs.forEach(product => {
              if (product.sales_count < 5) {
                recommendations.push({
                  type: 'remove',
                  product_id: product.id,
                  reason: 'Low popularity and profitability',
                  expected_impact: 'Simplify menu and reduce costs',
                  priority: 'low'
                });
              } else {
                recommendations.push({
                  type: 'redesign',
                  product_id: product.id,
                  reason: 'Poor performance across metrics',
                  expected_impact: 'Revamp recipe or pricing strategy',
                  priority: 'medium'
                });
              }
            });

            state.menuAnalysis.recommendations = recommendations;
          }));
        },

        // Cost Analysis Actions
        calculateCostAnalysis: (id) => {
          const product = get().products.find(p => p.id === id);
          if (!product) return;

          const analysis: CostAnalysis = {
            product_id: id,
            material_costs: product.components.reduce((sum, comp) => sum + comp.total_cost, 0),
            labor_costs: calculateLaborCost(product.prep_time),
            overhead_costs: calculateOverheadCost(product.price),
            total_cost: 0,
            target_price: 0,
            recommended_price: 0,
            margin_analysis: {
              current_margin: product.margin,
              target_margin: 65, // Target 65% margin
              competitor_average: product.price * 1.1, // Assume 10% higher than current
              optimal_price_point: 0,
              break_even_volume: 0
            }
          };

          analysis.total_cost = analysis.material_costs + analysis.labor_costs + analysis.overhead_costs;
          analysis.target_price = analysis.total_cost / (1 - 0.65); // 65% target margin
          analysis.recommended_price = Math.max(analysis.target_price, product.price);
          analysis.margin_analysis.optimal_price_point = analysis.recommended_price;
          analysis.margin_analysis.break_even_volume = Math.ceil(analysis.overhead_costs / (product.price - analysis.material_costs - analysis.labor_costs));

          set(produce((state: ProductsState) => {
            const existingIndex = state.costAnalyses.findIndex(ca => ca.product_id === id);
            if (existingIndex >= 0) {
              state.costAnalyses[existingIndex] = analysis;
            } else {
              state.costAnalyses.push(analysis);
            }
          }));
        },

        updateCostAnalyses: (analyses) => {
          set({ costAnalyses: analyses });
        },

        recalculateAllCosts: () => {
          const products = get().products;
          products.forEach(product => {
            get().calculateCostAnalysis(product.id);
          });
        },

        // UI Actions
        setLoading: (loading) => {
          set({ loading });
        },

        setError: (error) => {
          set({ error });
        },

        setFilters: (filters) => {
          set(produce((state: ProductsState) => {
            state.filters = { ...state.filters, ...filters };
          }));
        },

        resetFilters: () => {
          set({ filters: initialFilters });
        },

        // Selection Actions
        selectProduct: (id) => {
          set(produce((state: ProductsState) => {
            if (!state.selectedProducts.includes(id)) {
              state.selectedProducts.push(id);
            }
          }));
        },

        deselectProduct: (id) => {
          set(produce((state: ProductsState) => {
            state.selectedProducts = state.selectedProducts.filter(pId => pId !== id);
          }));
        },

        selectAll: () => {
          const filteredProducts = get().getFilteredProducts();
          set({ selectedProducts: filteredProducts.map(p => p.id) });
        },

        deselectAll: () => {
          set({ selectedProducts: [] });
        },

        // Modal Actions
        openModal: (mode, product) => {
          set({
            isModalOpen: true,
            modalMode: mode,
            currentProduct: product || null
          });
        },

        closeModal: () => {
          set({
            isModalOpen: false,
            modalMode: 'add',
            currentProduct: null
          });
        },

        // Stats
        refreshStats: () => {
          set(produce((state: ProductsState) => {
            const products = state.products;
            const activeProducts = products.filter(p => p.active);

            state.stats = {
              totalProducts: products.length,
              activeProducts: activeProducts.length,
              averagePrice: activeProducts.length > 0 
                ? activeProducts.reduce((sum, p) => sum + p.price, 0) / activeProducts.length 
                : 0,
              averageMargin: activeProducts.length > 0
                ? activeProducts.reduce((sum, p) => sum + p.margin, 0) / activeProducts.length
                : 0,
              topSelling: products
                .filter(p => p.active)
                .sort((a, b) => b.sales_count - a.sales_count)
                .slice(0, 5),
              lowPerforming: products
                .filter(p => p.active && p.sales_count > 0)
                .sort((a, b) => a.sales_count - b.sales_count)
                .slice(0, 5)
            };
          }));
        },

        // Computed Selectors
        getFilteredProducts: () => {
          const { products, filters } = get();
          let filtered = [...products];

          // Filter by search
          if (filters.search) {
            const search = filters.search.toLowerCase();
            filtered = filtered.filter(product =>
              product.name.toLowerCase().includes(search) ||
              product.description?.toLowerCase().includes(search) ||
              product.category.toLowerCase().includes(search)
            );
          }

          // Filter by category
          if (filters.category !== 'all') {
            filtered = filtered.filter(product => product.category === filters.category);
          }

          // Filter by status
          if (filters.status !== 'all') {
            filtered = filtered.filter(product =>
              filters.status === 'active' ? product.active : !product.active
            );
          }

          // Filter by classification
          if (filters.classification !== 'all') {
            filtered = filtered.filter(product => product.menu_classification === filters.classification);
          }

          // Sort
          filtered.sort((a, b) => {
            let aValue, bValue;

            switch (filters.sortBy) {
              case 'price':
                aValue = a.price;
                bValue = b.price;
                break;
              case 'margin':
                aValue = a.margin;
                bValue = b.margin;
                break;
              case 'popularity':
                aValue = a.popularity_score;
                bValue = b.popularity_score;
                break;
              case 'created':
                aValue = new Date(a.created_at).getTime();
                bValue = new Date(b.created_at).getTime();
                break;
              default:
                aValue = a.name.toLowerCase();
                bValue = b.name.toLowerCase();
            }

            if (filters.sortOrder === 'desc') {
              return aValue < bValue ? 1 : -1;
            }
            return aValue > bValue ? 1 : -1;
          });

          return filtered;
        },

        getProductsByCategory: () => {
          const products = get().products;
          return products.reduce((acc, product) => {
            if (!acc[product.category]) {
              acc[product.category] = [];
            }
            acc[product.category].push(product);
            return acc;
          }, {} as Record<string, Product[]>);
        },

        getProductsByClassification: (classification) => {
          return get().products.filter(p => p.menu_classification === classification);
        },

        getTopPerformers: (limit = 5) => {
          return get().products
            .filter(p => p.active)
            .sort((a, b) => b.sales_count - a.sales_count)
            .slice(0, limit);
        },

        getLowPerformers: (limit = 5) => {
          return get().products
            .filter(p => p.active && p.sales_count > 0)
            .sort((a, b) => a.sales_count - b.sales_count)
            .slice(0, limit);
        },

        getProductCost: (id) => {
          const product = get().products.find(p => p.id === id);
          return product ? product.cost : 0;
        },

        getProductMargin: (id) => {
          const product = get().products.find(p => p.id === id);
          return product ? product.margin : 0;
        }
      })),
      {
        name: 'g-mini-products-storage',
        partialize: (state) => ({
          products: state.products,
          categories: state.categories,
          filters: state.filters,
          costAnalyses: state.costAnalyses
        })
      }
    ),
    {
      name: 'ProductsStore'
    }
  )
);

// Helper functions
function calculateMargin(price: number, cost: number): number {
  if (price <= 0) return 0;
  return Math.round(((price - cost) / price) * 100);
}

function calculateProfitabilityScore(price: number, cost: number): number {
  const margin = calculateMargin(price, cost);
  return Math.min(100, Math.max(0, margin));
}

function calculateLaborCost(prepTimeMinutes: number): number {
  const hourlyWage = 15; // $15/hour base wage
  const laborMultiplier = 1.3; // Include benefits and overhead
  return (prepTimeMinutes / 60) * hourlyWage * laborMultiplier;
}

function calculateOverheadCost(price: number): number {
  // Estimate overhead as 15% of selling price
  return price * 0.15;
}