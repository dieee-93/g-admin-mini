// MenuEngineeringOnly.tsx - Redesigned with Design System Patterns
// Following same conventions as CostAnalysisTab.tsx

import React, { useState } from 'react';
import {
  // Design System Components
  
  Stack,
  VStack,
  HStack,
  Typography,
  CardWrapper ,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Badge,
  Button,
  Alert,
  AlertDescription
} from '@/shared/ui';

// Icons
import {
  ChartBarIcon,
  StarIcon,
  CogIcon,
  PuzzlePieceIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

// Business Logic
import { MenuEngineeringMatrix } from '../analytics/MenuEngineeringMatrix';
import { useMenuEngineering } from '../logic/useMenuEngineering';
import type { 
  MenuEngineeringData, 
  StrategyRecommendation,
  MenuCategory 
} from '../types/menuEngineering';

export function MenuEngineeringOnly() {
  // States
  const [activeTab, setActiveTab] = useState('matrix');
  const [selectedCategory, setSelectedCategory] = useState<MenuCategory | null>(null);

  // Real data hooks (similar to CostAnalysisTab pattern)
  const {
    matrix,
    loading,
    error,
    refreshData,
    getProductsByCategory,
    getTopRecommendations,
    getCategorySummary,
    getPerformanceMetrics
  } = useMenuEngineering({
    autoRefresh: true,
    refreshInterval: 30
  });

  // Real event handlers
  const handleProductSelect = (product: MenuEngineeringData) => {
    console.log("Product selected for analysis:", product);
    // TODO: Integrate with ProductsStore for editing
  };

  const handleStrategySelect = (recommendation: StrategyRecommendation) => {
    console.log("Strategy selected:", recommendation);
    // TODO: Implement strategy execution logic
  };

  const handleCategoryFilter = (category: MenuCategory) => {
    setSelectedCategory(selectedCategory === category ? null : category);
  };

  // Get real data for display
  const categoryMetrics = getCategorySummary();
  const performanceMetrics = getPerformanceMetrics();
  const topRecommendations = getTopRecommendations(5);

  return (
    
      <Stack gap="lg" align="stretch">
        {/* Header Section - Design System Pattern */}
        <CardWrapper variant="elevated" padding="lg">
          <CardWrapper .Header>
            <HStack justify="space-between" align="start">
              <VStack align="start" gap="xs">
                <HStack gap="sm">
                  <ChartBarIcon className="w-6 h-6 text-blue-600" />
                  <Typography variant="title">Menu Engineering Matrix</Typography>
                </HStack>
                <Typography variant="body" color="text.muted">
                  Strategic analysis of menu profitability and popularity using real sales data
                </Typography>
              </VStack>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refreshData}
                loading={loading}
              >
                Refresh Data
              </Button>
            </HStack>
          </CardWrapper .Header>

          <CardWrapper .Body>
            {/* Performance Overview */}
            <Stack gap="md">
              <Typography variant="label">Menu Performance Overview</Typography>
              <HStack gap="md" wrap={true}>
                <Badge variant="outline" colorPalette="success">
                  ✓ {categoryMetrics.stars} Stars (High Profit + High Popularity)
                </Badge>
                <Badge variant="outline" colorPalette="info">
                  ⚡ {categoryMetrics.plowhorses} Plowhorses (Low Profit + High Popularity)
                </Badge>
                <Badge variant="outline" colorPalette="warning">
                  🧩 {categoryMetrics.puzzles} Puzzles (High Profit + Low Popularity)
                </Badge>
                <Badge variant="outline" colorPalette="error">
                  🐕 {categoryMetrics.dogs} Dogs (Low Profit + Low Popularity)
                </Badge>
              </HStack>
            </Stack>
          </CardWrapper .Body>
        </CardWrapper>

        {/* Error State */}
        {error && (
          <Alert status="error" title="Analysis Error">
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Main Content Tabs - Design System Pattern */}
        <Tabs defaultValue="matrix" variant="line">
          <TabList>
            <Tab value="matrix">
              <ChartBarIcon className="w-4 h-4" />
              Matrix Analysis
            </Tab>
            <Tab value="categories">
              <StarIcon className="w-4 h-4" />
              Category Details
            </Tab>
            <Tab value="recommendations">
              <CogIcon className="w-4 h-4" />
              Strategic Actions
            </Tab>
            <Tab value="performance">
              <PuzzlePieceIcon className="w-4 h-4" />
              Performance Metrics
            </Tab>
          </TabList>

          <TabPanels>
            {/* Matrix Analysis Tab */}
            <TabPanel value="matrix">
              <CardWrapper variant="elevated" padding="lg">
                <CardWrapper .Header>
                  <Typography variant="title">Four-Quadrant Matrix</Typography>
                </CardWrapper .Header>
                <CardWrapper .Body>
                  {loading ? (
                    <Stack gap="md" align="center" minH="400px" justify="center">
                      <Typography variant="body" color="text.muted">
                        Loading menu engineering data...
                      </Typography>
                    </Stack>
                  ) : matrix ? (
                    <MenuEngineeringMatrix
                      onProductSelect={handleProductSelect}
                      onStrategySelect={handleStrategySelect}
                      refreshInterval={30}
                    />
                  ) : (
                    <Alert status="info" title="No Data Available">
                      <AlertDescription>
                        No sales data available for menu engineering analysis. 
                        Ensure you have products with sales history.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardWrapper .Body>
              </CardWrapper>
            </TabPanel>

            {/* Category Details Tab */}
            <TabPanel value="categories">
              <VStack gap="md" align="stretch">
                {/* Category Filters */}
                <CardWrapper variant="outline" padding="md">
                  <CardWrapper .Body>
                    <HStack gap="sm" wrap={true}>
                      <Typography variant="label">Filter by Category:</Typography>
                      {(['stars', 'plowhorses', 'puzzles', 'dogs'] as MenuCategory[]).map((category) => (
                        <Button
                          key={category}
                          variant={selectedCategory === category ? "solid" : "outline"}
                          size="sm"
                          onClick={() => handleCategoryFilter(category)}
                          colorPalette={
                            category === 'stars' ? 'success' :
                            category === 'plowhorses' ? 'info' :
                            category === 'puzzles' ? 'warning' : 'error'
                          }
                        >
                          {category.charAt(0).toUpperCase() + category.slice(1)} 
                          ({categoryMetrics[category]})
                        </Button>
                      ))}
                    </HStack>
                  </CardWrapper .Body>
                </CardWrapper>

                {/* Products by Category */}
                <CardWrapper variant="elevated" padding="lg">
                  <CardWrapper .Header>
                    <Typography variant="title">
                      {selectedCategory ? 
                        `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Products` : 
                        'All Products'
                      }
                    </Typography>
                  </CardWrapper .Header>
                  <CardWrapper .Body>
                    {selectedCategory ? (
                      <Stack gap="sm">
                        {getProductsByCategory(selectedCategory).map((product) => (
                          <CardWrapper key={product.productId} variant="outline" padding="md">
                            <HStack justify="space-between">
                              <VStack align="start" gap="xs">
                                <Typography variant="label">{product.productName}</Typography>
                                <Typography variant="caption" color="text.muted">
                                  Popularity: {product.popularityIndex.toFixed(1)}% | 
                                  Profitability: {product.profitabilityIndex.toFixed(1)}%
                                </Typography>
                              </VStack>
                              <Badge 
                                colorPalette={
                                  product.menuCategory === 'stars' ? 'success' :
                                  product.menuCategory === 'plowhorses' ? 'info' :
                                  product.menuCategory === 'puzzles' ? 'warning' : 'error'
                                }
                              >
                                {product.menuCategory}
                              </Badge>
                            </HStack>
                          </CardWrapper>
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body" color="text.muted">
                        Select a category above to view products
                      </Typography>
                    )}
                  </CardWrapper .Body>
                </CardWrapper>
              </VStack>
            </TabPanel>

            {/* Strategic Recommendations Tab */}
            <TabPanel value="recommendations">
              <CardWrapper variant="elevated" padding="lg">
                <CardWrapper .Header>
                  <Typography variant="title">Top Strategic Recommendations</Typography>
                </CardWrapper .Header>
                <CardWrapper .Body>
                  <Stack gap="md">
                    {topRecommendations.length > 0 ? (
                      topRecommendations.map((recommendation, index) => (
                        <CardWrapper key={index} variant="outline" padding="md">
                          <HStack justify="space-between" align="start">
                            <VStack align="start" gap="xs">
                              <Typography variant="label">{recommendation.action || 'Strategy Action'}</Typography>
                              <Typography variant="body" color="text.muted">
                                {recommendation.description}
                              </Typography>
                              <HStack gap="sm">
                                <Badge colorPalette="info" size="sm">
                                  {recommendation.priority}
                                </Badge>
                                <Badge colorPalette="gray" size="sm">
                                  {recommendation.category}
                                </Badge>
                              </HStack>
                            </VStack>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStrategySelect(recommendation)}
                            >
                              Implement
                            </Button>
                          </HStack>
                        </CardWrapper>
                      ))
                    ) : (
                      <Alert status="info" title="No Recommendations">
                        <AlertDescription>
                          No strategic recommendations available. Analysis requires sales data.
                        </AlertDescription>
                      </Alert>
                    )}
                  </Stack>
                </CardWrapper .Body>
              </CardWrapper>
            </TabPanel>

            {/* Performance Metrics Tab */}
            <TabPanel value="performance">
              <VStack gap="md" align="stretch">
                <CardWrapper variant="elevated" padding="lg">
                  <CardWrapper .Header>
                    <Typography variant="title">Menu Performance Metrics</Typography>
                  </CardWrapper .Header>
                  <CardWrapper .Body>
                    <HStack gap="lg">
                      <VStack align="start" gap="xs">
                        <Typography variant="label">Total Revenue</Typography>
                        <Typography variant="title" >
                          ${performanceMetrics.totalRevenue.toFixed(2)}
                        </Typography>
                      </VStack>
                      <VStack align="start" gap="xs">
                        <Typography variant="label">Total Profit</Typography>
                        <Typography variant="title" >
                          ${performanceMetrics.totalProfit.toFixed(2)}
                        </Typography>
                      </VStack>
                      <VStack align="start" gap="xs">
                        <Typography variant="label">Average Margin</Typography>
                        <Typography variant="title" color="text.primary">
                          {performanceMetrics.averageMargin.toFixed(1)}%
                        </Typography>
                      </VStack>
                      <VStack align="start" gap="xs">
                        <Typography variant="label">Menu Health Score</Typography>
                        <Typography variant="title" >
                          {performanceMetrics.menuHealthScore.toFixed(0)}/100
                        </Typography>
                      </VStack>
                    </HStack>
                  </CardWrapper .Body>
                </CardWrapper>

                {/* Category Distribution */}
                <CardWrapper variant="elevated" padding="lg">
                  <CardWrapper .Header>
                    <Typography variant="title">Category Distribution</Typography>
                  </CardWrapper .Header>
                  <CardWrapper .Body>
                    <Stack gap="md">
                      {Object.entries(categoryMetrics).map(([category, count]) => (
                        <HStack key={category} justify="space-between">
                          <Typography variant="body">
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </Typography>
                          <HStack gap="sm">
                            <Typography variant="body">{count} products</Typography>
                            <Badge 
                              colorPalette={
                                category === 'stars' ? 'success' :
                                category === 'plowhorses' ? 'info' :
                                category === 'puzzles' ? 'warning' : 'error'
                              }
                            >
                              {matrix ? 
                                ((count / matrix.totalProducts) * 100).toFixed(1) : '0'
                              }%
                            </Badge>
                          </HStack>
                        </HStack>
                      ))}
                    </Stack>
                  </CardWrapper .Body>
                </CardWrapper>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Stack>
    
  );
}
