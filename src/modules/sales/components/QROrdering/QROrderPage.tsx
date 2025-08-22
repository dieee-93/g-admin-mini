import React from 'react';
import {
  Box,
  Card,
  Flex,
  Grid,
  Heading,
  Text,
  Badge,
  Button,
  Input,
  Textarea,
  VStack,
  HStack,
  Separator,
  Spinner,
  Alert,
  NumberInput,
  Image,
  Tabs,
  IconButton,
} from '@chakra-ui/react';
import { 
  PlusIcon, 
  MinusIcon, 
  ShoppingCartIcon,
  ClockIcon,
  CheckCircleIcon,
  QrCodeIcon,
  UserIcon,
  PhoneIcon,
  ExclamationTriangleIcon,
  HeartIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { Icon } from '@/shared/ui/Icon';
import { supabase } from '@/lib/supabase/client';
import { notify } from '@/lib/notifications';

interface Product {
  id: string;
  name: string;
  description?: string;
  cost?: number;
  category_id?: string;
  allergens?: string[];
  preparation_time?: number;
  kitchen_station?: string;
  is_available?: boolean;
  popularity_score?: number;
  image_url?: string;
}

interface Category {
  id: string;
  name: string;
  description?: string;
  display_order: number;
}

interface CartItem {
  product_id: string;
  product: Product;
  quantity: number;
  special_instructions?: string;
  modifications: ItemModification[];
}

interface ItemModification {
  id: string;
  type: 'addition' | 'substitution' | 'removal' | 'preparation_style';
  description: string;
  price_adjustment: number;
}

interface QROrderData {
  table_id: string;
  table_number: string;
  qr_code: string;
  restaurant_info?: {
    name: string;
    wifi_password?: string;
  };
}

interface OrderSummary {
  subtotal: number;
  estimated_prep_time: number;
  total_items: number;
}

export function QROrderPage() {
  // URL params - in real app would get from router
  const [qrData, setQrData] = React.useState<QROrderData | null>(null);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState<string>('all');
  const [customerName, setCustomerName] = React.useState('');
  const [customerPhone, setCustomerPhone] = React.useState('');
  const [specialRequests, setSpecialRequests] = React.useState('');
  const [orderSubmitted, setOrderSubmitted] = React.useState(false);
  const [orderNumber, setOrderNumber] = React.useState<string>('');

  React.useEffect(() => {
    loadQRData();
    loadMenuData();
  }, []);

  const loadQRData = async () => {
    try {
      // In real implementation, get table info from QR code or URL params
      const tableId = new URLSearchParams(window.location.search).get('table_id') || 'table_1';
      
      const { data, error } = await supabase
        .from('tables')
        .select('id, number')
        .eq('id', tableId)
        .single();

      if (error) throw error;

      setQrData({
        table_id: data.id,
        table_number: data.number,
        qr_code: `QR_${data.id}_${Date.now()}`,
        restaurant_info: {
          name: 'G-Admin Restaurant',
          wifi_password: 'guest123'
        }
      });
    } catch (error) {
      console.error('Error loading QR data:', error);
      notify.error('Failed to load table information');
    }
  };

  const loadMenuData = async () => {
    try {
      // Load categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('display_order');

      if (categoriesError) throw categoriesError;

      // Load products with availability
      const { data: productsData, error: productsError } = await supabase.rpc('get_products_with_availability');

      if (productsError) throw productsError;

      // Filter only available products for customer ordering
      const availableProducts = productsData?.filter((product: any) => 
        product.availability > 0 && product.is_available !== false
      ) || [];

      setCategories(categoriesData || []);
      setProducts(availableProducts);
    } catch (error) {
      console.error('Error loading menu:', error);
      notify.error('Failed to load menu');
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(currentCart => {
      const existingItem = currentCart.find(item => item.product_id === product.id);
      
      if (existingItem) {
        return currentCart.map(item =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...currentCart, {
          product_id: product.id,
          product,
          quantity,
          modifications: []
        }];
      }
    });
    
    notify.success(`${product.name} added to cart`);
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCart(currentCart =>
      currentCart.map(item =>
        item.product_id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(currentCart =>
      currentCart.filter(item => item.product_id !== productId)
    );
  };

  const updateItemInstructions = (productId: string, instructions: string) => {
    setCart(currentCart =>
      currentCart.map(item =>
        item.product_id === productId
          ? { ...item, special_instructions: instructions }
          : item
      )
    );
  };

  const calculateOrderSummary = (): OrderSummary => {
    const subtotal = cart.reduce((sum, item) => 
      sum + (item.product.cost || 0) * item.quantity, 0
    );
    
    const estimatedPrepTime = Math.max(
      ...cart.map(item => (item.product.preparation_time || 15) * item.quantity),
      15 // minimum 15 minutes
    );
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    return {
      subtotal,
      estimated_prep_time: estimatedPrepTime,
      total_items: totalItems
    };
  };

  const submitOrder = async () => {
    if (cart.length === 0) {
      notify.error('Please add items to your order');
      return;
    }

    if (!customerName.trim()) {
      notify.error('Please enter your name');
      return;
    }

    setSubmitting(true);

    try {
      // Create the order using the POS system
      const orderData = {
        table_id: qrData?.table_id,
        order_type: 'dine_in',
        fulfillment_type: 'dine_in',
        customer_name: customerName,
        customer_phone: customerPhone || null,
        special_instructions: specialRequests ? [specialRequests] : [],
        items: cart.map(item => ({
          product_id: item.product_id,
          quantity: item.quantity,
          unit_price: item.product.cost || 0,
          modifications: item.modifications,
          special_instructions: item.special_instructions
        }))
      };

      const { data, error } = await supabase.rpc('pos_process_qr_order', {
        order_data: orderData
      });

      if (error) throw error;

      setOrderNumber(data.order_number);
      setOrderSubmitted(true);
      
      notify.success('Order submitted successfully!');

      // Clear cart
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
      setSpecialRequests('');

    } catch (error) {
      console.error('Error submitting order:', error);
      notify.error('Failed to submit order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProducts = React.useMemo(() => {
    if (activeCategory === 'all') return products;
    return products.filter(product => product.category_id === activeCategory);
  }, [products, activeCategory]);

  const orderSummary = calculateOrderSummary();

  if (loading) {
    return (
      <Flex align="center" justify="center" h="100vh">
        <VStack>
          <Spinner size="lg" />
          <Text>Loading menu...</Text>
        </VStack>
      </Flex>
    );
  }

  if (orderSubmitted) {
    return (
      <Box p={6} textAlign="center" maxW="md" mx="auto">
        <VStack gap={6}>
          <Icon icon={CheckCircleIcon} size="2xl" className="text-green-500" />
          
          <VStack gap={2}>
            <Heading size="lg" color="green.600">Order Confirmed!</Heading>
            <Text color="gray.600">
              Your order has been sent to the kitchen
            </Text>
          </VStack>

          <Card.Root w="full" p={4} bg="green.50">
            <VStack gap={3}>
              <HStack justify="space-between" w="full">
                <Text fontWeight="bold">Order Number:</Text>
                <Badge colorScheme="green" fontSize="md" p={2}>
                  {orderNumber}
                </Badge>
              </HStack>
              
              <HStack justify="space-between" w="full">
                <Text fontWeight="bold">Table:</Text>
                <Text>{qrData?.table_number}</Text>
              </HStack>
              
              <HStack justify="space-between" w="full">
                <Text fontWeight="bold">Estimated Time:</Text>
                <Text>{Math.ceil(orderSummary.estimated_prep_time)} minutes</Text>
              </HStack>
            </VStack>
          </Card.Root>

          <VStack gap={2} textAlign="center">
            <Text fontSize="sm" color="gray.600">
              Your order is being prepared. You'll be notified when it's ready.
            </Text>
            <Text fontSize="xs" color="gray.500">
              Need help? Please speak with your server.
            </Text>
          </VStack>

          <Button 
            onClick={() => {
              setOrderSubmitted(false);
              setOrderNumber('');
            }}
            variant="outline"
          >
            Order More Items
          </Button>
        </VStack>
      </Box>
    );
  }

  return (
    <Box minH="100vh" bg="gray.50">
      {/* Header */}
      <Box bg="white" shadow="sm" p={4} position="sticky" top={0} zIndex={10}>
        <VStack gap={2}>
          <HStack justify="center" gap={2}>
            <Icon icon={QrCodeIcon} size="lg" className="text-blue-500" />
            <Heading size="md">{qrData?.restaurant_info?.name}</Heading>
          </HStack>
          
          {qrData && (
            <HStack gap={4} fontSize="sm" color="gray.600">
              <Text>Table {qrData.table_number}</Text>
              {qrData.restaurant_info?.wifi_password && (
                <Text>WiFi: {qrData.restaurant_info.wifi_password}</Text>
              )}
            </HStack>
          )}
        </VStack>
      </Box>

      <Box p={4} pb={cart.length > 0 ? '120px' : '4'}>
        {/* Category Tabs */}
        <Box mb={4}>
          <Tabs.Root 
            value={activeCategory}
            onValueChange={(details) => setActiveCategory(details.value)}
            variant="line"
          >
            <Tabs.List>
              <Tabs.Trigger value="all">All Items</Tabs.Trigger>
              {categories.map(category => (
                <Tabs.Trigger key={category.id} value={category.id}>
                  {category.name}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
          </Tabs.Root>
        </Box>

        {/* Products Grid */}
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4} mb={6}>
          {filteredProducts.map(product => {
            const cartItem = cart.find(item => item.product_id === product.id);
            const inCart = !!cartItem;

            return (
              <Card.Root 
                key={product.id} 
                _hover={{ transform: 'translateY(-2px)', shadow: 'md' }}
                transition="all 0.2s"
              >
                <Card.Body>
                  <VStack align="stretch" gap={3}>
                    {/* Product Image Placeholder */}
                    {product.image_url ? (
                      <Image 
                        src={product.image_url} 
                        alt={product.name}
                        borderRadius="md" 
                        h="120px" 
                        objectFit="cover" 
                      />
                    ) : (
                      <Box 
                        h="120px" 
                        bg="gray.100" 
                        borderRadius="md" 
                        display="flex" 
                        alignItems="center" 
                        justifyContent="center"
                      >
                        <Text fontSize="sm" color="gray.500">No Image</Text>
                      </Box>
                    )}

                    {/* Product Info */}
                    <VStack align="start" gap={1}>
                      <HStack justify="space-between" w="full">
                        <Text fontWeight="bold" fontSize="lg">
                          {product.name}
                        </Text>
                        {product.popularity_score && product.popularity_score > 80 && (
                          <Badge colorScheme="yellow" leftIcon={<Icon icon={StarIcon} size="xs" />}>
                            Popular
                          </Badge>
                        )}
                      </HStack>

                      {product.description && (
                        <Text fontSize="sm" color="gray.600" noOfLines={2}>
                          {product.description}
                        </Text>
                      )}

                      {/* Allergens Warning */}
                      {product.allergens && product.allergens.length > 0 && (
                        <HStack>
                          <Icon icon={ExclamationTriangleIcon} size="sm" className="text-orange-500" />
                          <Text fontSize="xs" color="orange.600">
                            Contains: {product.allergens.join(', ')}
                          </Text>
                        </HStack>
                      )}

                      {/* Prep Time and Price */}
                      <HStack justify="space-between" w="full">
                        <HStack fontSize="sm" color="gray.600">
                          <Icon icon={ClockIcon} size="sm" />
                          <Text>{product.preparation_time || 15} min</Text>
                        </HStack>
                        <Text fontSize="lg" fontWeight="bold" color="green.600">
                          ${(product.cost || 0).toFixed(2)}
                        </Text>
                      </HStack>
                    </VStack>

                    {/* Add to Cart Controls */}
                    {inCart ? (
                      <HStack justify="space-between">
                        <HStack>
                          <IconButton
                            size="sm"
                            variant="outline"
                            onClick={() => updateCartQuantity(product.id, cartItem.quantity - 1)}
                          >
                            <Icon icon={MinusIcon} size="xs" />
                          </IconButton>
                          <Text fontWeight="bold" minW="8" textAlign="center">
                            {cartItem.quantity}
                          </Text>
                          <IconButton
                            size="sm"
                            variant="outline"
                            onClick={() => updateCartQuantity(product.id, cartItem.quantity + 1)}
                          >
                            <Icon icon={PlusIcon} size="xs" />
                          </IconButton>
                        </HStack>

                        <Button
                          variant="ghost"
                          size="sm"
                          colorScheme="red"
                          onClick={() => removeFromCart(product.id)}
                        >
                          Remove
                        </Button>
                      </HStack>
                    ) : (
                      <Button
                        colorScheme="blue"
                        onClick={() => addToCart(product)}
                        leftIcon={<Icon icon={PlusIcon} size="sm" />}
                      >
                        Add to Cart
                      </Button>
                    )}
                  </VStack>
                </Card.Body>
              </Card.Root>
            );
          })}
        </Grid>

        {/* Customer Information Form */}
        {cart.length > 0 && (
          <Card.Root mb={4}>
            <Card.Header>
              <Text fontWeight="bold" fontSize="lg">Your Information</Text>
            </Card.Header>
            <Card.Body>
              <VStack gap={4} align="stretch">
                <Box>
                  <Text mb={2} fontSize="sm" fontWeight="medium">
                    Name <Text as="span" color="red.500">*</Text>
                  </Text>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Enter your name"
                  />
                </Box>

                <Box>
                  <Text mb={2} fontSize="sm" fontWeight="medium">
                    Phone (Optional)
                  </Text>
                  <Input
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Enter your phone number"
                  />
                </Box>

                <Box>
                  <Text mb={2} fontSize="sm" fontWeight="medium">
                    Special Requests (Optional)
                  </Text>
                  <Textarea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Any allergies, dietary restrictions, or special requests..."
                    rows={3}
                  />
                </Box>
              </VStack>
            </Card.Body>
          </Card.Root>
        )}
      </Box>

      {/* Cart Summary - Fixed Bottom */}
      {cart.length > 0 && (
        <Box
          position="fixed"
          bottom={0}
          left={0}
          right={0}
          bg="white"
          shadow="lg"
          p={4}
          borderTop="1px solid"
          borderColor="gray.200"
        >
          <VStack gap={3}>
            {/* Order Summary */}
            <HStack justify="space-between" w="full">
              <VStack align="start" gap={0}>
                <Text fontSize="sm" color="gray.600">
                  {orderSummary.total_items} items
                </Text>
                <Text fontSize="lg" fontWeight="bold">
                  ${orderSummary.subtotal.toFixed(2)}
                </Text>
              </VStack>
              
              <VStack align="end" gap={0}>
                <Text fontSize="sm" color="gray.600">
                  Est. {Math.ceil(orderSummary.estimated_prep_time)} min
                </Text>
                <HStack>
                  <Icon icon={ShoppingCartIcon} size="sm" />
                  <Text fontSize="sm" fontWeight="medium">
                    {cart.length} different items
                  </Text>
                </HStack>
              </VStack>
            </HStack>

            {/* Submit Order Button */}
            <Button
              colorScheme="green"
              size="lg"
              w="full"
              onClick={submitOrder}
              loading={submitting}
              loadingText="Submitting Order..."
              disabled={!customerName.trim() || cart.length === 0}
            >
              <Icon icon={CheckCircleIcon} size="sm" />
              Place Order
            </Button>
          </VStack>
        </Box>
      )}

      {/* Empty Cart Message */}
      {cart.length === 0 && !loading && (
        <Box textAlign="center" py={8}>
          <VStack gap={4}>
            <Icon icon={ShoppingCartIcon} size="2xl" className="text-gray-400" />
            <VStack gap={2}>
              <Text fontSize="lg" fontWeight="medium">
                Your cart is empty
              </Text>
              <Text color="gray.500">
                Browse our menu and add items to get started
              </Text>
            </VStack>
          </VStack>
        </Box>
      )}
    </Box>
  );
}