// src/features/products/ui/MenuEngineeringOnly.tsx
// Menu Engineering Matrix como sección independiente

import React from "react";
import { Box, VStack, Text, Badge, HStack } from "@chakra-ui/react";
import { MenuEngineeringMatrix } from "../analytics/MenuEngineeringMatrix";
import type { MenuEngineeringData, StrategyRecommendation } from "../types/menuEngineering";

export function MenuEngineeringOnly() {
  const handleProductSelect = (product: MenuEngineeringData) => {
    // Navigate to product editing or show details
    console.log("Product selected for analysis:", product);
  };

  const handleStrategySelect = (recommendation: StrategyRecommendation) => {
    // Handle strategy implementation
    console.log("Strategy selected:", recommendation);
  };

  return (
    <Box>
      <VStack gap={6} align="stretch">
        {/* Header */}
        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={2} color="gray.700">
            Menu Engineering Matrix - Strategic Analysis
          </Text>
          <Text fontSize="sm" color="gray.600" mb={4}>
            Análisis de profitabilidad y popularidad para optimización estratégica del menú
          </Text>
          
          <HStack gap={4} wrap="wrap" justify="center" mb={4}>
            <Badge colorPalette="green" size="sm">✓ Menu Engineering Matrix</Badge>
            <Badge colorPalette="green" size="sm">✓ Strategic Recommendations</Badge>
            <Badge colorPalette="green" size="sm">✓ Performance Analytics</Badge>
            <Badge colorPalette="green" size="sm">✓ Four Quadrants Analysis</Badge>
          </HStack>
        </Box>

        {/* Menu Engineering Matrix */}
        <MenuEngineeringMatrix
          onProductSelect={handleProductSelect}
          onStrategySelect={handleStrategySelect}
          refreshInterval={30}
        />
      </VStack>
    </Box>
  );
}