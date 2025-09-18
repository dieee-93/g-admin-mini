import { useProductsStore } from '@/store/productsStore';
import { productApi } from './productApi';
import { type ProductWithIntelligence } from '../types';

class ProductsService {
  private getStore = () => useProductsStore.getState();

  async loadProducts() {
    const { setLoading, setError, setProducts } = this.getStore();
    setLoading(true);
    setError(null);

    try {
      // Use the existing, efficient API function that calls the database RPC
      const products = await productApi.fetchProductsWithIntelligence();
      setProducts(products);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading products';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  // TODO: Implement other methods like createProduct, updateProduct
  // These methods will call the respective functions in productApi
  // and then update the store.
}

export const productsService = new ProductsService();
