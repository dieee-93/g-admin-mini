// src/pages/admin/products/components/ProductListOnly.tsx
// Gestión de productos sin sub-pestañas - Design System v2.0

import React, { useState, useEffect } from "react";
import { 
  VStack, 
  HStack, 
  Button, 
  Typography, 
  Badge, 
  CardWrapper ,
  Grid,
  InputField,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription
} from "@/shared/ui";
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  ShoppingBagIcon,
  CurrencyDollarIcon,
  ChartBarIcon
} from "@heroicons/react/24/outline";

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  margin: number;
  status: 'active' | 'inactive' | 'out_of_stock';
  total_quantity?: number;
  components_count: number;
  last_updated: string;
}

type ProductView = "list" | "create" | "edit" | "components";

export function ProductListOnly() {
  const [activeView, setActiveView] = useState<ProductView>("list");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    
    // Mock products data
    const mockProducts: Product[] = [
      {
        id: '1',
        name: 'Pizza Margherita',
        category: 'Pizza',
        price: 12.99,
        cost: 4.50,
        margin: 65.4,
        status: 'active',
        total_quantity: 25,
        components_count: 5,
        last_updated: '2024-08-25T10:00:00Z'
      },
      {
        id: '2',
        name: 'Pasta Bolognese',
        category: 'Pasta',
        price: 14.50,
        cost: 5.20,
        margin: 64.1,
        status: 'active',
        total_quantity: 18,
        components_count: 7,
        last_updated: '2024-08-25T11:30:00Z'
      },
      {
        id: '3',
        name: 'Caesar Salad',
        category: 'Salad',
        price: 9.99,
        cost: 3.25,
        margin: 67.5,
        status: 'active',
        total_quantity: 12,
        components_count: 6,
        last_updated: '2024-08-25T09:15:00Z'
      },
      {
        id: '4',
        name: 'Fish & Chips',
        category: 'Main Course',
        price: 16.99,
        cost: 7.80,
        margin: 54.1,
        status: 'out_of_stock',
        total_quantity: 0,
        components_count: 4,
        last_updated: '2024-08-24T16:20:00Z'
      }
    ];

    setProducts(mockProducts);
    setLoading(false);
  };

  const getStatusBadge = (status: Product['status']) => {
    const statusConfig = {
      active: { colorPalette: 'success' as const, label: 'Active' },
      inactive: { colorPalette: 'gray' as const, label: 'Inactive' },
      out_of_stock: { colorPalette: 'error' as const, label: 'Out of Stock' }
    };
    
    const config = statusConfig[status];
    return <Badge colorPalette={config.colorPalette} size="sm">{config.label}</Badge>;
  };

  const getCategoryBadge = (category: string) => {
    return <Badge colorPalette="info" size="xs">{category}</Badge>;
  };

  const getMarginColor = (margin: number) => {
    if (margin >= 60) return 'text-green-600';
    if (margin >= 40) return 'text-yellow-600';
    return 'text-red-600';
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setActiveView("edit");
  };

  const handleManageComponents = (product: Product) => {
    setSelectedProduct(product);
    setActiveView("components");
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <VStack gap="md">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          <Typography variant="body">Loading products...</Typography>
        </VStack>
      </div>
    );
  }

  return (
    <div className="p-6">
      <VStack gap="lg" align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <div>
            <Typography variant="heading" className="text-2xl font-bold mb-2">
              Product Management
            </Typography>
            <Typography variant="body" color="text.muted">
              Manage your product catalog with real-time cost tracking
            </Typography>
          </div>
          <Button colorPalette="brand" onClick={() => setActiveView("create")}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Add Product
          </Button>
        </HStack>

        {/* Quick Stats */}
        <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap="md">
          <CardWrapper>
            <div className="p-4">
              <HStack justify="space-between">
                <VStack align="start" gap="xs">
                  <Typography variant="body" className="text-sm" color="text.muted">Total Products</Typography>
                  <Typography variant="heading" className="text-2xl font-bold text-blue-600">
                    {products.length}
                  </Typography>
                </VStack>
                <ShoppingBagIcon className="w-8 h-8 text-blue-500" />
              </HStack>
            </div>
          </CardWrapper>

          <CardWrapper>
            <div className="p-4">
              <HStack justify="space-between">
                <VStack align="start" gap="xs">
                  <Typography variant="body" className="text-sm" color="text.muted">Active Products</Typography>
                  <Typography variant="heading" className="text-2xl font-bold text-green-600">
                    {products.filter(p => p.status === 'active').length}
                  </Typography>
                </VStack>
                <ChartBarIcon className="w-8 h-8 text-green-500" />
              </HStack>
            </div>
          </CardWrapper>

          <CardWrapper>
            <div className="p-4">
              <HStack justify="space-between">
                <VStack align="start" gap="xs">
                  <Typography variant="body" className="text-sm" color="text.muted">Avg Margin</Typography>
                  <Typography variant="heading" className="text-2xl font-bold text-purple-600">
                    {Math.round(products.reduce((sum, p) => sum + p.margin, 0) / products.length)}%
                  </Typography>
                </VStack>
                <CurrencyDollarIcon className="w-8 h-8 text-purple-500" />
              </HStack>
            </div>
          </CardWrapper>

          <CardWrapper>
            <div className="p-4">
              <HStack justify="space-between">
                <VStack align="start" gap="xs">
                  <Typography variant="body" className="text-sm" color="text.muted">Out of Stock</Typography>
                  <Typography variant="heading" className="text-2xl font-bold text-red-600">
                    {products.filter(p => p.status === 'out_of_stock').length}
                  </Typography>
                </VStack>
                <ShoppingBagIcon className="w-8 h-8 text-red-500" />
              </HStack>
            </div>
          </CardWrapper>
        </Grid>

        {/* Search */}
        <CardWrapper>
          <div className="p-4">
            <HStack gap="md">
              <div className="flex-1">
                <InputField
                  placeholder="Search products by name or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  startElement={<MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />}
                />
              </div>
              <Button variant="outline">
                Filter
              </Button>
            </HStack>
          </div>
        </CardWrapper>

        {/* Products List */}
        <CardWrapper>
          <div className="p-6">
            <Typography variant="heading" className="text-lg font-semibold mb-4">
              Products ({filteredProducts.length})
            </Typography>

            {filteredProducts.length === 0 ? (
              <div className="p-8 text-center">
                <VStack gap="md">
                  <ShoppingBagIcon className="w-12 h-12 text-gray-400" />
                  <Typography variant="heading" className="text-lg font-medium">
                    {searchQuery ? 'No products found' : 'No products available'}
                  </Typography>
                  <Typography variant="body" color="text.muted">
                    {searchQuery 
                      ? `No products match "${searchQuery}"`
                      : 'Add your first product to get started'
                    }
                  </Typography>
                  {!searchQuery && (
                    <Button colorPalette="brand" onClick={() => setActiveView("create")}>
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Add Product
                    </Button>
                  )}
                </VStack>
              </div>
            ) : (
              <VStack gap="md" align="stretch">
                {filteredProducts.map((product) => (
                  <CardWrapper key={product.id}>
                    <div className="p-4">
                      <HStack justify="space-between" align="start">
                        <VStack align="stretch" gap="sm" className="flex-1">
                          <HStack gap="sm">
                            <Typography variant="heading" className="text-lg font-semibold">
                              {product.name}
                            </Typography>
                            {getCategoryBadge(product.category)}
                            {getStatusBadge(product.status)}
                          </HStack>
                          
                          <Grid templateColumns="repeat(4, 1fr)" gap="md" className="text-sm">
                            <VStack align="start" gap="xs">
                              <Typography variant="body" className="text-xs" color="text.muted">Price</Typography>
                              <Typography variant="body" className="font-semibold text-green-600">
                                ${product.price.toFixed(2)}
                              </Typography>
                            </VStack>
                            
                            <VStack align="start" gap="xs">
                              <Typography variant="body" className="text-xs" color="text.muted">Cost</Typography>
                              <Typography variant="body" className="font-semibold">
                                ${product.cost.toFixed(2)}
                              </Typography>
                            </VStack>
                            
                            <VStack align="start" gap="xs">
                              <Typography variant="body" className="text-xs" color="text.muted">Margin</Typography>
                              <Typography variant="body" className={`font-semibold ${getMarginColor(product.margin)}`}>
                                {product.margin.toFixed(1)}%
                              </Typography>
                            </VStack>
                            
                            <VStack align="start" gap="xs">
                              <Typography variant="body" className="text-xs" color="text.muted">Components</Typography>
                              <Typography variant="body" className="font-semibold">
                                {product.components_count} items
                              </Typography>
                            </VStack>
                          </Grid>
                          
                          {product.total_quantity !== undefined && (
                            <Typography variant="body" className="text-xs" color="text.muted">
                              Available: {product.total_quantity} units • Updated: {new Date(product.last_updated).toLocaleDateString()}
                            </Typography>
                          )}
                        </VStack>
                        
                        <VStack gap="sm">
                          <Button 
                            size="sm" 
                            colorPalette="brand"
                            onClick={() => handleEditProduct(product)}
                          >
                            Edit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => handleManageComponents(product)}
                          >
                            Components
                          </Button>
                        </VStack>
                      </HStack>
                    </div>
                  </CardWrapper>
                ))}
              </VStack>
            )}
          </div>
        </CardWrapper>

        {/* Product Features */}
        <CardWrapper>
          <div className="p-6">
            <Typography variant="heading" className="text-lg font-semibold mb-4">
              Product Management Features
            </Typography>
            
            <Grid templateColumns="repeat(auto-fit, minmax(250px, 1fr))" gap="md">
              <HStack gap="sm">
                <Badge colorPalette="success" size="sm">✓</Badge>
                <Typography variant="body" className="text-sm">Real-time Cost Calculation</Typography>
              </HStack>
              <HStack gap="sm">
                <Badge colorPalette="success" size="sm">✓</Badge>
                <Typography variant="body" className="text-sm">Availability Tracking</Typography>
              </HStack>
              <HStack gap="sm">
                <Badge colorPalette="success" size="sm">✓</Badge>
                <Typography variant="body" className="text-sm">Component Management</Typography>
              </HStack>
              <HStack gap="sm">
                <Badge colorPalette="success" size="sm">✓</Badge>
                <Typography variant="body" className="text-sm">Production Status</Typography>
              </HStack>
            </Grid>
          </div>
        </CardWrapper>

        {/* Alerts for out of stock */}
        {products.some(p => p.status === 'out_of_stock') && (
          <Alert>
            <AlertIcon>
              <ShoppingBagIcon className="w-4 h-4" />
            </AlertIcon>
            <AlertTitle>Products Out of Stock</AlertTitle>
            <AlertDescription>
              {products.filter(p => p.status === 'out_of_stock').length} products are currently out of stock and need restocking.
            </AlertDescription>
          </Alert>
        )}
      </VStack>
    </div>
  );
}