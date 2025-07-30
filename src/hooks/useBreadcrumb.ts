// ==============================================
// 📁 src/hooks/useBreadcrumb.ts
// ==============================================

import React, { useState, useCallback } from 'react';
import type { BreadcrumbItem, BreadcrumbContext } from '../types/navigation';

interface UseBreadcrumbReturn {
  breadcrumbItems: BreadcrumbItem[];
  setBreadcrumbContext: (context: BreadcrumbContext, meta?: Record<string, any>) => void;
  pushBreadcrumb: (item: BreadcrumbItem) => void;
  popBreadcrumb: () => void;
}

export function useBreadcrumb(
  onNavigate: (route: string) => void
): UseBreadcrumbReturn {
  const [breadcrumbItems, setBreadcrumbItems] = useState<BreadcrumbItem[]>([
    {
      label: 'Dashboard',
      icon: React.createElement('span', null, '🏠'),
      onClick: () => onNavigate('dashboard')
    }
  ]);

  const setBreadcrumbContext = useCallback((
    context: BreadcrumbContext, 
    meta: Record<string, any> = {}
  ) => {
    const items: BreadcrumbItem[] = [
      {
        label: 'Dashboard',
        icon: React.createElement('span', null, '🏠'),
        onClick: () => onNavigate('dashboard')
      }
    ];

    switch (context) {
      case 'dashboard':
        items[0].isCurrentPage = true;
        break;

      case 'items':
        items.push({
          label: 'Gestión de Insumos',
          icon: React.createElement('span', null, '📦'),
          isCurrentPage: true
        });
        break;

      case 'items.create':
        items.push(
          {
            label: 'Gestión de Insumos',
            icon: React.createElement('span', null, '📦'),
            onClick: () => onNavigate('items')
          },
          {
            label: 'Crear Insumo',
            icon: React.createElement('span', null, '➕'),
            isCurrentPage: true
          }
        );
        break;

      case 'items.edit':
        items.push(
          {
            label: 'Gestión de Insumos',
            icon: React.createElement('span', null, '📦'),
            onClick: () => onNavigate('items')
          },
          {
            label: `Editar: ${meta.itemName || 'Insumo'}`,
            icon: React.createElement('span', null, '✏️'),
            isCurrentPage: true
          }
        );
        break;

      case 'items.stock':
        items.push(
          {
            label: 'Gestión de Insumos',
            icon: React.createElement('span', null, '📦'),
            onClick: () => onNavigate('items')
          },
          {
            label: `Stock: ${meta.itemName || 'Insumo'}`,
            icon: React.createElement('span', null, '📈'),
            isCurrentPage: true
          }
        );
        break;

      case 'stock':
        items.push({
          label: 'Entradas de Stock',
          icon: React.createElement('span', null, '📈'),
          isCurrentPage: true
        });
        break;

      case 'stock.create':
        items.push(
          {
            label: 'Entradas de Stock',
            icon: React.createElement('span', null, '📈'),
            onClick: () => onNavigate('stock')
          },
          {
            label: 'Nueva Entrada',
            icon: React.createElement('span', null, '➕'),
            isCurrentPage: true
          }
        );
        break;

      case 'recipes':
        items.push({
          label: 'Recetas',
          icon: React.createElement('span', null, '📝'),
          isCurrentPage: true
        });
        break;

      case 'recipes.create':
        items.push(
          {
            label: 'Recetas',
            icon: React.createElement('span', null, '📝'),
            onClick: () => onNavigate('recipes')
          },
          {
            label: 'Crear Receta',
            icon: React.createElement('span', null, '➕'),
            isCurrentPage: true
          }
        );
        break;

      case 'recipes.edit':
        items.push(
          {
            label: 'Recetas',
            icon: React.createElement('span', null, '📝'),
            onClick: () => onNavigate('recipes')
          },
          {
            label: `Editar: ${meta.recipeName || 'Receta'}`,
            icon: React.createElement('span', null, '✏️'),
            isCurrentPage: true
          }
        );
        break;

      case 'products':
        items.push({
          label: 'Productos',
          icon: React.createElement('span', null, '🎯'),
          isCurrentPage: true
        });
        break;

      case 'products.create':
        items.push(
          {
            label: 'Productos',
            icon: React.createElement('span', null, '🎯'),
            onClick: () => onNavigate('products')
          },
          {
            label: 'Crear Producto',
            icon: React.createElement('span', null, '➕'),
            isCurrentPage: true
          }
        );
        break;

      case 'sales':
        items.push({
          label: 'Ventas',
          icon: React.createElement('span', null, '💰'),
          isCurrentPage: true
        });
        break;

      case 'sales.create':
        items.push(
          {
            label: 'Ventas',
            icon: React.createElement('span', null, '💰'),
            onClick: () => onNavigate('sales')
          },
          {
            label: 'Nueva Venta',
            icon: React.createElement('span', null, '➕'),
            isCurrentPage: true
          }
        );
        break;

      case 'customers':
        items.push({
          label: 'Clientes',
          icon: React.createElement('span', null, '👥'),
          isCurrentPage: true
        });
        break;

      case 'customers.create':
        items.push(
          {
            label: 'Clientes',
            icon: React.createElement('span', null, '👥'),
            onClick: () => onNavigate('customers')
          },
          {
            label: 'Nuevo Cliente',
            icon: React.createElement('span', null, '➕'),
            isCurrentPage: true
          }
        );
        break;

      default:
        break;
    }

    setBreadcrumbItems(items);
  }, [onNavigate]);

  const pushBreadcrumb = useCallback((item: BreadcrumbItem) => {
    setBreadcrumbItems(prev => [...prev, item]);
  }, []);

  const popBreadcrumb = useCallback(() => {
    setBreadcrumbItems(prev => prev.slice(0, -1));
  }, []);

  return {
    breadcrumbItems,
    setBreadcrumbContext,
    pushBreadcrumb,
    popBreadcrumb
  };
}