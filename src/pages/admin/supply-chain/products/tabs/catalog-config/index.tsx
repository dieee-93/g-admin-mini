/**
 * CATALOG CONFIGURATION TAB
 * 
 * Configure product catalog, pricing strategies, and menu organization
 * Migrated from /admin/settings/products/catalog to Products module tab
 */

import { CardWrapper, Stack, HStack, Badge, Switch, Button } from '@/shared/ui';
import { useDisclosure } from '@/shared/hooks';
import { useState } from 'react';
import { useSystemProductCatalogSettings, useToggleCheckStock, useToggleAllowBackorders, useToggleAutoDisableOnZeroStock } from '@/modules/products';
import { ProductCatalogFormModal } from './components/ProductCatalogFormModal';
import { CubeIcon, TagIcon, ClockIcon, Squares2X2Icon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { DecimalUtils } from '@/lib/decimal';

export function CatalogConfigTab() {
  const { data: settings, isLoading, error } = useSystemProductCatalogSettings();
  const toggleCheckStock = useToggleCheckStock();
  const toggleAllowBackorders = useToggleAllowBackorders();
  const toggleAutoDisable = useToggleAutoDisableOnZeroStock();

  const configModal = useDisclosure();

  if (isLoading) {
    return (
      <div style={{ padding: '48px', textAlign: 'center' }}>
        Cargando configuración...
      </div>
    );
  }

  if (error || !settings) {
    return (
      <div style={{ padding: '48px', textAlign: 'center', color: 'var(--colors-red-500)' }}>
        Error al cargar configuración
      </div>
    );
  }

  const handleToggleCheckStock = () => {
    toggleCheckStock.mutate({ id: settings.id, enabled: !settings.check_stock });
  };

  const handleToggleBackorders = () => {
    toggleAllowBackorders.mutate({ id: settings.id, enabled: !settings.allow_backorders });
  };

  const handleToggleAutoDisable = () => {
    toggleAutoDisable.mutate({ id: settings.id, enabled: !settings.auto_disable_on_zero_stock });
  };

  return (
    <Stack gap="6" p="6">
      <HStack justify="space-between" align="center">
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '4px' }}>
            Configuración de Catálogo de Productos
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--colors-gray-600)' }}>
            Gestiona categorías, precios, modificadores y reglas de disponibilidad
          </p>
        </div>
        <Button 
          onClick={configModal.onOpen} 
          variant="solid" 
          colorPalette="purple"
          leftIcon={<PencilSquareIcon className="w-4 h-4" />}
        >
          Editar Configuración
        </Button>
      </HStack>

      {/* Product Categories */}
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '12px' }}>
          Categorías de Productos
        </h3>
        <CardWrapper>
          <CardWrapper.Body p="6">
            <Stack gap="3">
              <strong>Categorías Configuradas</strong>
              <Stack gap="2">
                {settings.product_categories.map((category) => (
                  <HStack key={category.id} justify="space-between" p="3" style={{ borderRadius: '8px', backgroundColor: 'var(--colors-gray-50)' }}>
                    <HStack gap="2">
                      <CubeIcon className="w-4 h-4" style={{ color: 'var(--colors-purple-500)' }} />
                      <span>{category.name}</span>
                      {category.description && (
                        <span style={{ fontSize: '0.875rem', color: 'var(--colors-gray-600)' }}>
                          - {category.description}
                        </span>
                      )}
                    </HStack>
                    <HStack gap="2">
                      <Badge colorPalette="gray" size="sm">Orden: {category.sort_order}</Badge>
                      <Badge colorPalette={category.is_active ? 'green' : 'red'} size="sm">
                        {category.is_active ? 'Activa' : 'Inactiva'}
                      </Badge>
                    </HStack>
                  </HStack>
                ))}
              </Stack>
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>
      </div>

      {/* Menu Categories */}
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '12px' }}>
          Categorías de Menú (Por Horario)
        </h3>
        <CardWrapper>
          <CardWrapper.Body p="6">
            <Stack gap="3">
              <strong>Menús Configurados</strong>
              <Stack gap="2">
                {settings.menu_categories.map((menu) => (
                  <HStack key={menu.id} justify="space-between" p="3" style={{ borderRadius: '8px', backgroundColor: 'var(--colors-gray-50)' }}>
                    <HStack gap="2">
                      <ClockIcon className="w-4 h-4" style={{ color: 'var(--colors-blue-500)' }} />
                      <span>{menu.name}</span>
                    </HStack>
                    <HStack gap="2">
                      <Badge colorPalette="blue" size="sm">
                        {menu.available_from} - {menu.available_to}
                      </Badge>
                      {menu.available_days && (
                        <Badge colorPalette="purple" size="sm">
                          {menu.available_days.length === 7 ? 'Todos los días' : `${menu.available_days.length} días`}
                        </Badge>
                      )}
                    </HStack>
                  </HStack>
                ))}
              </Stack>
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>
      </div>

      {/* Pricing Strategy */}
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '12px' }}>
          Estrategia de Precios
        </h3>
        <CardWrapper>
          <CardWrapper.Body p="6">
            <Stack gap="3">
              <HStack justify="space-between">
                <strong>Estrategia Actual</strong>
                <Badge colorPalette="purple" size="lg">
                  {settings.pricing_strategy === 'markup' && 'Markup (Costo + %)'}
                  {settings.pricing_strategy === 'competitive' && 'Competitiva (Mercado)'}
                  {settings.pricing_strategy === 'value_based' && 'Basada en Valor'}
                </Badge>
              </HStack>
              <HStack justify="space-between">
                <strong>Markup por Defecto</strong>
                <Badge colorPalette="green" size="lg">{settings.default_markup_percentage}%</Badge>
              </HStack>
              <div style={{ fontSize: '0.875rem', color: 'var(--colors-gray-600)', padding: '8px', backgroundColor: 'var(--colors-blue-50)', borderRadius: '6px' }}>
                💡 Con {settings.default_markup_percentage}% de markup, un producto con costo de $100 se vende a ${DecimalUtils.multiply('100', DecimalUtils.add('1', DecimalUtils.divide(settings.default_markup_percentage.toString(), '100', 'financial').toString(), 'financial').toString(), 'financial').toNumber().toFixed(2)}
              </div>
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>
      </div>

      {/* Recipe Costing */}
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '12px' }}>
          Método de Costeo de Recetas
        </h3>
        <CardWrapper>
          <CardWrapper.Body p="6">
            <HStack justify="space-between">
              <Stack gap="1">
                <strong>Método de Valuación de Inventario</strong>
                <span style={{ fontSize: '0.875rem', color: 'var(--colors-gray-600)' }}>
                  {settings.recipe_costing_method === 'average' && 'Promedio Ponderado - Más común y sencillo'}
                  {settings.recipe_costing_method === 'fifo' && 'FIFO (First In, First Out) - Primera entrada, primera salida'}
                  {settings.recipe_costing_method === 'lifo' && 'LIFO (Last In, First Out) - Última entrada, primera salida'}
                  {settings.recipe_costing_method === 'standard' && 'Costo Estándar - Costo fijo predefinido'}
                </span>
              </Stack>
              <Badge colorPalette="orange" size="lg">
                {settings.recipe_costing_method.toUpperCase()}
              </Badge>
            </HStack>
          </CardWrapper.Body>
        </CardWrapper>
      </div>

      {/* Availability Rules */}
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '12px' }}>
          Reglas de Disponibilidad
        </h3>
        <Stack gap="4">
          <CardWrapper>
            <CardWrapper.Body p="6">
              <HStack justify="space-between">
                <HStack gap="3">
                  <Squares2X2Icon className="w-6 h-6" style={{ color: 'var(--colors-green-500)' }} />
                  <Stack gap="1">
                    <strong>Verificar Stock Antes de Venta</strong>
                    <span style={{ fontSize: '0.9rem', color: 'var(--colors-gray-600)' }}>
                      Validar disponibilidad de inventario al procesar pedidos
                    </span>
                  </Stack>
                </HStack>
                <Switch
                  checked={settings.check_stock}
                  onChange={handleToggleCheckStock}
                  disabled={toggleCheckStock.isPending}
                />
              </HStack>
            </CardWrapper.Body>
          </CardWrapper>

          <CardWrapper>
            <CardWrapper.Body p="6">
              <HStack justify="space-between">
                <Stack gap="1">
                  <strong>Permitir Pedidos en Espera (Backorders)</strong>
                  <span style={{ fontSize: '0.9rem', color: 'var(--colors-gray-600)' }}>
                    Aceptar pedidos aunque no haya stock disponible
                  </span>
                </Stack>
                <Switch
                  checked={settings.allow_backorders}
                  onChange={handleToggleBackorders}
                  disabled={toggleAllowBackorders.isPending}
                />
              </HStack>
            </CardWrapper.Body>
          </CardWrapper>

          <CardWrapper>
            <CardWrapper.Body p="6">
              <HStack justify="space-between">
                <Stack gap="1">
                  <strong>Desactivar Automáticamente al Agotar Stock</strong>
                  <span style={{ fontSize: '0.9rem', color: 'var(--colors-gray-600)' }}>
                    Marcar productos como no disponibles cuando stock = 0
                  </span>
                </Stack>
                <Switch
                  checked={settings.auto_disable_on_zero_stock}
                  onChange={handleToggleAutoDisable}
                  disabled={toggleAutoDisable.isPending}
                />
              </HStack>
            </CardWrapper.Body>
          </CardWrapper>

          <CardWrapper>
            <CardWrapper.Body p="6">
              <HStack justify="space-between">
                <strong>Tiempo Mínimo de Anticipación</strong>
                <Badge colorPalette="blue" size="lg">
                  {settings.minimum_notice_minutes === 0 ? 'Inmediato' : `${settings.minimum_notice_minutes} minutos`}
                </Badge>
              </HStack>
            </CardWrapper.Body>
          </CardWrapper>
        </Stack>
      </div>

      {/* Modifiers Configuration */}
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '12px' }}>
          Configuración de Modificadores
        </h3>
        <CardWrapper>
          <CardWrapper.Body p="6">
            <Stack gap="3">
              <strong>Grupos de Modificadores</strong>
              <Stack gap="2">
                {settings.modifiers_configuration.map((modifier) => (
                  <div key={modifier.id} style={{ padding: '12px', borderRadius: '8px', backgroundColor: 'var(--colors-gray-50)' }}>
                    <HStack justify="space-between" marginBottom="8px">
                      <HStack gap="2">
                        <TagIcon className="w-4 h-4" style={{ color: 'var(--colors-purple-500)' }} />
                        <strong>{modifier.name}</strong>
                        <Badge colorPalette={modifier.type === 'single_choice' ? 'blue' : 'green'} size="sm">
                          {modifier.type === 'single_choice' ? 'Opción Única' : 'Opción Múltiple'}
                        </Badge>
                        {modifier.required && <Badge colorPalette="red" size="sm">Requerido</Badge>}
                      </HStack>
                    </HStack>
                    <Stack gap="1" pl="4">
                      {modifier.options.map((option) => (
                        <HStack key={option.id} justify="space-between" fontSize="0.875rem">
                          <HStack gap="2">
                            <span>{option.name}</span>
                            {option.is_default && <Badge colorPalette="gray" size="sm">Por defecto</Badge>}
                          </HStack>
                          <Badge colorPalette={option.price_adjustment >= 0 ? 'green' : 'red'} size="sm">
                            {option.price_adjustment >= 0 ? '+' : ''}{option.price_adjustment > 0 ? `$${option.price_adjustment}` : option.price_adjustment < 0 ? `-$${Math.abs(option.price_adjustment)}` : 'Sin cargo'}
                          </Badge>
                        </HStack>
                      ))}
                    </Stack>
                  </div>
                ))}
              </Stack>
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>
      </div>

      {/* Portion Sizes */}
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '12px' }}>
          Tamaños de Porción
        </h3>
        <CardWrapper>
          <CardWrapper.Body p="6">
            <Stack gap="3">
              <strong>Porciones Configuradas</strong>
              <Stack gap="2">
                {settings.portion_sizes.map((portion) => (
                  <HStack key={portion.id} justify="space-between" p="3" style={{ borderRadius: '8px', backgroundColor: 'var(--colors-gray-50)' }}>
                    <HStack gap="2">
                      <span>{portion.name}</span>
                      <Badge colorPalette="blue" size="sm">{portion.servings} {portion.servings === 1 ? 'porción' : 'porciones'}</Badge>
                    </HStack>
                    {portion.price_multiplier && (
                      <Badge colorPalette="green" size="sm">
                        Multiplicador: {portion.price_multiplier}x
                      </Badge>
                    )}
                  </HStack>
                ))}
              </Stack>
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>
      </div>

      <ProductCatalogFormModal
        isOpen={configModal.isOpen}
        onClose={configModal.onClose}
        settings={settings}
      />
    </Stack>
  );
}
