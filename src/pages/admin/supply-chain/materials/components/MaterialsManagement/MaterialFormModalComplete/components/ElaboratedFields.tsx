/**
 * 🏭 ElaboratedFields Component - Industrial Precision Design
 *
 * Manufacturing control aesthetic for elaborated materials
 * Features: LED indicators, thick borders, industrial typography
 *
 * Design Inspiration: Factory automation, precision manufacturing interfaces
 * Aesthetic: Brutalist refinement with strong visual hierarchy
 */

import { Box, Stack, Typography, Badge, SelectField } from '@/shared/ui';
import { type ItemFormData } from '../../../../types';
import { CATEGORY_COLLECTION } from '../constants';
import { RecipeBuilder } from '@/modules/recipe/components';
import { ProductionConfigSection } from './ProductionConfigSection';
import { MaterialFormProgressIndicator } from './MaterialFormProgressIndicator';
import { memo, useCallback, useMemo } from 'react';
import type { Recipe } from '@/modules/recipe/types';
import type { ProductionConfig } from '../../../../types';

interface ElaboratedFieldsProps {
  formData: ItemFormData;
  setFormData: (data: ItemFormData) => void;
  isEditMode?: boolean;
  onRequestEquipmentSelector?: () => void;
}

/**
 * 💡 StatusIndicator - Industrial LED with pulse animation
 * Simulates physical status LEDs found on manufacturing equipment
 */
interface StatusIndicatorProps {
  status: 'active' | 'inactive' | 'warning';
  size?: 'sm' | 'md' | 'lg';
}

const StatusIndicator = memo(function StatusIndicator({
  status,
  size = 'md'
}: StatusIndicatorProps) {
  const getStatusColor = (s: typeof status) => {
    switch (s) {
      case 'active': return 'green';
      case 'warning': return 'orange';
      default: return 'gray';
    }
  };

  const getSizeValue = (sz: typeof size) => {
    switch (sz) {
      case 'sm': return '6px';
      case 'lg': return '10px';
      default: return '8px';
    }
  };

  const colorPalette = getStatusColor(status);
  const dimension = getSizeValue(size);

  return (
    <Box
      w={dimension}
      h={dimension}
      borderRadius="full"
      bg="colorPalette.solid"
      colorPalette={colorPalette}
      boxShadow={status === 'active'
        ? `0 0 8px var(--chakra-colors-${colorPalette}-emphasized), 0 0 16px var(--chakra-colors-${colorPalette}-subtle)`
        : 'sm'
      }
      animation={status === 'active' ? 'pulse-led 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : undefined}
      css={{
        '@keyframes pulse-led': {
          '0%, 100%': {
            opacity: 1,
            transform: 'scale(1)'
          },
          '50%': {
            opacity: 0.7,
            transform: 'scale(0.95)'
          }
        }
      }}
    />
  );
});

/**
 * 🏗️ IndustrialContainer - Wrapper with factory aesthetic
 * Features: Thick borders, accent bar, gradient header, shadows
 */
interface IndustrialContainerProps {
  children: React.ReactNode;
  title?: string;
  status?: 'active' | 'inactive' | 'warning';
  colorPalette?: 'blue' | 'green' | 'orange' | 'gray';
  hasGradientTop?: boolean;
}

const IndustrialContainer = memo(function IndustrialContainer({
  children,
  title,
  status = 'inactive',
  colorPalette = 'gray',
  hasGradientTop = false
}: IndustrialContainerProps) {
  return (
    <Box
      p="5"
      bg="bg.panel"
      borderWidth="3px"
      borderColor="border.emphasized"
      borderRadius="xl"
      boxShadow="lg"
      position="relative"
      borderLeftWidth="4px"
      borderLeftColor={status !== 'inactive' ? 'colorPalette.solid' : 'border.muted'}
      colorPalette={colorPalette}
      transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
      _hover={{
        transform: 'translateY(-1px)',
        boxShadow: 'xl',
        borderColor: 'border.default'
      }}
      css={{
        ...(hasGradientTop && {
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: `linear-gradient(90deg, var(--chakra-colors-${colorPalette}-emphasized), var(--chakra-colors-${colorPalette}-fg))`,
            borderTopLeftRadius: 'var(--chakra-radii-xl)',
            borderTopRightRadius: 'var(--chakra-radii-xl)'
          }
        })
      }}
    >
      <Stack gap="4">
        {title && (
          <Stack direction="row" align="center" justify="space-between">
            <Typography
              fontSize="2xs"
              fontWeight="700"
              color="fg.muted"
              letterSpacing="wider"
              textTransform="uppercase"
            >
              {title}
            </Typography>
            <StatusIndicator status={status} size="sm" />
          </Stack>
        )}
        {children}
      </Stack>
    </Box>
  );
});

/**
 * 📊 SectionDivider - Visual separator with label
 * Creates strong hierarchy between major sections
 */
interface SectionDividerProps {
  label: string;
}

const SectionDivider = memo(function SectionDivider({ label }: SectionDividerProps) {
  return (
    <Stack direction="row" align="center" gap="3" my="2">
      <Box h="2px" flex="1" bg="border.emphasized" />
      <Typography
        fontSize="xs"
        fontWeight="800"
        color="fg.default"
        letterSpacing="widest"
        textTransform="uppercase"
      >
        {label}
      </Typography>
      <Box h="2px" flex="1" bg="border.emphasized" />
    </Stack>
  );
});

/**
 * 🏭 ElaboratedFields - Main Component
 * Industrial precision form for elaborated materials
 */
export const ElaboratedFields = memo(function ElaboratedFields({
  formData,
  setFormData,
  isEditMode = false,
  onRequestEquipmentSelector
}: ElaboratedFieldsProps) {

  // ⚡ PERFORMANCE: Memoize outputItem to prevent recreation
  const outputItem = useMemo(() => {
    if (!formData.name) return undefined;

    return {
      id: formData.id || 'temp', // Use actual ID if available
      name: formData.name,
      type: 'material' as const,
      unit: formData.unit || 'unit',
    };
  }, [formData.name, formData.unit, formData.id]);

  // ⚡ PERFORMANCE: Memoize recipe features to prevent RecipeBuilder re-renders
  const recipeFeatures = useMemo(() => ({
    showCostCalculation: true,
    showScalingLite: true,
    showInstructions: false,
    allowProductInputs: false,
  }), []);
  
  // ⚡ PERFORMANCE: Memoize outputQuantity
  const outputQuantity = useMemo(() => 
    formData.initial_stock || 1
  , [formData.initial_stock]);

  // ⚡ PERFORMANCE: Memoize callback with functional setState to avoid stale closures
  const handleRecipeSaved = useCallback((recipe: Recipe) => {
    setFormData(prev => ({
      ...prev,
      recipe_id: recipe.id,
      initial_stock: recipe.output.quantity || 1,
    }));
  }, [setFormData]);

  // 🆕 Handler para production_config with functional setState and updater function support
  const handleProductionConfigChange = useCallback((configOrUpdater: ProductionConfig | ((prev?: ProductionConfig) => ProductionConfig)) => {
    setFormData(prev => {
      const newConfig = typeof configOrUpdater === 'function'
        ? configOrUpdater(prev.production_config)
        : configOrUpdater;

      return {
        ...prev,
        production_config: newConfig,
      };
    });
  }, [setFormData]);

  return (
    <Stack gap="6" w="full">

      {/* ========================================
          SECTION 1: Header with Status Badge
          ======================================== */}
      <Stack direction="row" align="center" justify="space-between">
        <Stack direction="row" align="center" gap="3">
          <StatusIndicator status="active" size="md" />
          <Typography
            fontSize="xs"
            fontWeight="800"
            color="fg.muted"
            letterSpacing="widest"
            textTransform="uppercase"
            data-testid="elaborated-header"
          >
            Material Elaborado
          </Typography>
        </Stack>

        <Badge
          colorPalette="blue"
          variant="solid"
          px="3"
          py="1"
          fontSize="2xs"
          fontWeight="800"
          letterSpacing="wide"
        >
          REQUIERE RECETA
        </Badge>
      </Stack>

      {/* ========================================
          SECTION 2: Progress Indicator - Visual Flow Tracker
          ======================================== */}
      <MaterialFormProgressIndicator
        hasRecipe={!!formData.recipe_id}
        hasProductionConfig={!!formData.production_config}
      />

      {/* ========================================
          SECTION 3: Information Alert - Factory Warning Panel
          ======================================== */}
      <Box
        p="5"
        bg="bg.panel"
        borderWidth="2px"
        borderColor="colorPalette.emphasized"
        colorPalette="orange"
        borderRadius="lg"
        borderLeftWidth="4px"
        borderLeftColor="colorPalette.solid"
        boxShadow="md"
        position="relative"
        data-testid="elaborated-info-alert"
        _before={{
          content: '""',
          position: 'absolute',
          top: '0',
          left: '0',
          w: '4px',
          h: 'full',
          bg: 'linear-gradient(180deg, var(--chakra-colors-orange-solid), var(--chakra-colors-orange-emphasized))',
          borderTopLeftRadius: 'lg',
          borderBottomLeftRadius: 'lg'
        }}
      >
        <Stack gap="3">
          {/* Alert Header */}
          <Stack direction="row" align="center" gap="2">
            <Box
              w="6px"
              h="6px"
              borderRadius="full"
              bg="colorPalette.fg"
              colorPalette="orange"
              animation="pulse-warning 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite"
              css={{
                '@keyframes pulse-warning': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0.5 }
                }
              }}
            />
            <Typography
              fontSize="xs"
              fontWeight="800"
              color="colorPalette.fg"
              colorPalette="orange"
              letterSpacing="wider"
              textTransform="uppercase"
            >
              Información Importante
            </Typography>
          </Stack>

          {/* Alert Content - Bullet Points */}
          <Stack gap="1" pl="2">
            <Stack direction="row" align="flex-start" gap="2">
              <Box
                as="span"
                color="colorPalette.fg"
                colorPalette="orange"
                fontWeight="700"
                fontSize="xs"
                mt="0.5"
              >
                ▸
              </Box>
              <Typography fontSize="2xs" color="fg.muted" lineHeight="relaxed">
                Requiere receta con ingredientes y cantidades
              </Typography>
            </Stack>

            <Stack direction="row" align="flex-start" gap="2">
              <Box
                as="span"
                color="colorPalette.fg"
                colorPalette="orange"
                fontWeight="700"
                fontSize="xs"
                mt="0.5"
              >
                ▸
              </Box>
              <Typography fontSize="2xs" color="fg.muted" lineHeight="relaxed">
                Se ejecuta automáticamente al guardar el material
              </Typography>
            </Stack>

            <Stack direction="row" align="flex-start" gap="2">
              <Box
                as="span"
                color="colorPalette.fg"
                colorPalette="orange"
                fontWeight="700"
                fontSize="xs"
                mt="0.5"
              >
                ▸
              </Box>
              <Typography fontSize="2xs" color="fg.muted" lineHeight="relaxed">
                Genera el stock inicial del material elaborado
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Box>

      {/* ========================================
          SECTION 4: Recipe Builder - Main Production Module (No Submit Button)
          ======================================== */}
      <Box data-testid="recipe-builder-section">
        {/* Section Divider */}
        <SectionDivider label="Constructor de Receta" />

        {/* Recipe Builder Container with Industrial Wrapper */}
        <Box
          mt="5"
          p="6"
          bg="bg.subtle"
          borderWidth="3px"
          borderColor="border.emphasized"
          borderRadius="xl"
          boxShadow="lg"
          position="relative"
          transition="all 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
          _hover={{
            boxShadow: 'xl'
          }}
          css={{
            '&::before': {
              content: '""',
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              height: '4px',
              background: 'linear-gradient(90deg, var(--chakra-colors-blue-emphasized), var(--chakra-colors-blue-fg))',
              borderTopLeftRadius: 'var(--chakra-radii-xl)',
              borderTopRightRadius: 'var(--chakra-radii-xl)'
            }
          }}
        >
          {/* Production Status Indicator */}
          <Stack
            direction="row"
            align="center"
            gap="2"
            mb="4"
            pb="3"
            borderBottomWidth="1px"
            borderBottomColor="border.subtle"
          >
            <StatusIndicator status="active" size="sm" />
            <Typography
              fontSize="2xs"
              fontWeight="700"
              color="fg.muted"
              letterSpacing="wider"
              textTransform="uppercase"
              data-testid="production-module-status"
            >
              Módulo de Producción Activo
            </Typography>
          </Stack>

          {/* RecipeBuilder Component - Embedded mode (no action buttons) */}
          <RecipeBuilder
            mode={isEditMode ? 'edit' : 'create'}
            recipeId={formData.recipe_id} // Pass recipe ID for loading data
            entityType="material"
            complexity="minimal"
            features={recipeFeatures}
            outputItem={outputItem}
            outputQuantity={outputQuantity}
            onSave={handleRecipeSaved}
            hideActions={true}
          />
        </Box>
      </Box>

      {/* ========================================
          SECTION 5: Production Configuration (NUEVO)
          ======================================== */}
      <Box data-testid="production-config-section">
        {/* Section Divider */}
        <SectionDivider label="Configuración de Producción" />

        <Box mt="5">
          <ProductionConfigSection
            productionConfig={formData.production_config}
            onChange={handleProductionConfigChange}
            recipeId={formData.recipe_id}
            onRequestEquipmentSelector={onRequestEquipmentSelector}
          />
        </Box>
      </Box>

    </Stack>
  );
});
