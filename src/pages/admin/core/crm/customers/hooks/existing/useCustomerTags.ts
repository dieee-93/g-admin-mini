// MIGRATED: Using centralized useCrudOperations system
import { useCallback, useState } from 'react';
import { z } from 'zod';
import { useCrudOperations } from '@/hooks/core/useCrudOperations';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';
import { CustomerTag, CustomerProfile } from '../types';
import { logger } from '@/lib/logging';
import {
  assignTagToCustomer,
  removeTagFromCustomer,
  getCustomersWithTag
} from '../services/advancedCustomerApi';

// Schema for CustomerTag validation
const CustomerTagSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, 'Name is required'),
  color: z.string().min(1, 'Color is required'),
  category: z.enum(['behavior', 'preference', 'demographic', 'custom']),
  description: z.string().optional(),
  metadata: z.record(z.unknown()).optional(),
  created_at: z.date().optional(),
  updated_at: z.date().optional()
});

export function useCustomerTags() {
  // MIGRATED: Use unified CRUD system instead of manual state management
  const crud = useCrudOperations<CustomerTag>({
    tableName: 'customer_intelligence.customer_tags',
    schema: CustomerTagSchema,
    enableRealtime: true,
    cacheKey: 'customer-tags',
    defaultValues: {
      name: '',
      color: '#FF6B6B',
      category: 'custom' as const,
      description: ''
    }
  });

  // MIGRATED: Map unified interface to original public interface
  const tags = crud.items;
  const loading = crud.loading;
  const error = crud.error;
  const loadTags = crud.refresh;
  
  // MIGRATED: Use unified operations with original method names
  const createTag = useCallback(async (tagData: Omit<CustomerTag, 'id' | 'created_at' | 'updated_at'>) => {
    return await crud.create(tagData as CustomerTag);
  }, [crud]);

  const updateTag = useCallback(async (id: string, tagData: Partial<CustomerTag>) => {
    return await crud.update(id, tagData);
  }, [crud]);

  const deleteTag = useCallback(async (id: string) => {
    await crud.remove(id);
  }, [crud]);

  // Assign tag to customer - keeping original specialized logic
  const assignTag = useCallback(async (customerId: string, tagId: string) => {
    try {
      await assignTagToCustomer(customerId, tagId);
    } catch (err) {
      logger.error('App', 'Error assigning tag to customer:', err);
      throw err;
    }
  }, []);

  // Remove tag from customer - keeping original specialized logic  
  const removeTag = useCallback(async (customerId: string, tagId: string) => {
    try {
      await removeTagFromCustomer(customerId, tagId);
    } catch (err) {
      logger.error('App', 'Error removing tag from customer:', err);
      throw err;
    }
  }, []);

  // Get customers with specific tag - keeping original specialized logic
  const getCustomersWithTagId = useCallback(async (tagId: string): Promise<CustomerProfile[]> => {
    try {
      return await getCustomersWithTag(tagId);
    } catch (err) {
      logger.error('App', 'Error getting customers with tag:', err);
      throw err;
    }
  }, []);

  // MIGRATED: Use unified utilities instead of manual filtering
  const getTagsByCategory = useCallback((category: CustomerTag['category']) => {
    return crud.filterItems(tag => tag.category === category);
  }, [crud]);

  // Get predefined tag colors - keeping original logic
  const getTagColors = useCallback(() => ([
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#96CEB4', // Green
    '#FFEAA7', // Yellow
    '#DDA0DD', // Plum
    '#98D8C8', // Mint
    '#F7DC6F', // Light Yellow
    '#BB8FCE', // Light Purple
    '#85C1E9', // Light Blue
  ]), []);

  // Get next available color for new tags - keeping original logic
  const getNextColor = useCallback(() => {
    const colors = getTagColors();
    const usedColors = tags.map(tag => tag.color);
    const availableColors = colors.filter(color => !usedColors.includes(color));
    
    if (availableColors.length > 0) {
      return availableColors[0];
    }
    
    // If all colors are used, return a random one
    const randomIndex = Math.floor(DecimalUtils.multiply(Math.random().toString(), colors.length.toString(), 'financial').toNumber());
    return colors[randomIndex];
  }, [tags, getTagColors]);

  // Get tag statistics - keeping original logic
  const getTagStats = useCallback(() => {
    const categoryStats = tags.reduce((acc, tag) => {
      const currentCount = acc[tag.category] || 0;
      acc[tag.category] = DecimalUtils.add(currentCount.toString(), '1', 'financial').toNumber();
      return acc;
    }, {} as Record<CustomerTag['category'], number>);

    return {
      total: tags.length,
      byCategory: categoryStats
    };
  }, [tags]);

  // MIGRATED: Automatic loading via useCrudOperations (no manual useEffect needed)
  
  return {
    // MIGRATED: Maintain exact same public interface
    tags,
    loading,
    error,
    
    // CRUD operations
    createTag,
    updateTag,
    deleteTag,
    loadTags,
    
    // Customer-tag associations
    assignTag,
    removeTag,
    getCustomersWithTagId,
    
    // Utilities
    getTagsByCategory,
    getTagColors,
    getNextColor,
    getTagStats
  };
}

// Hook for managing tags of a specific customer
export function useCustomerTagsForCustomer(customerId: string) {
  const { tags, assignTag, removeTag } = useCustomerTags();
  const [customerTags, setCustomerTags] = useState<CustomerTag[]>([]);
  const [loading, setLoading] = useState(false);

  // Load tags for specific customer
  const loadCustomerTags = async () => {
    if (!customerId) return;
    
    setLoading(true);
    try {
      // This would be implemented in the API to get customer's tags
      // For now, we'll simulate it
      setCustomerTags([]);
    } catch (err) {
      logger.error('App', 'Error loading customer tags:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add tag to this customer
  const addTagToCustomer = async (tagId: string) => {
    try {
      await assignTag(customerId, tagId);
      await loadCustomerTags(); // Reload customer's tags
    } catch (err) {
      logger.error('App', 'Error adding tag to customer:', err);
      throw err;
    }
  };

  // Remove tag from this customer
  const removeTagFromCustomer = async (tagId: string) => {
    try {
      await removeTag(customerId, tagId);
      await loadCustomerTags(); // Reload customer's tags
    } catch (err) {
      logger.error('App', 'Error removing tag from customer:', err);
      throw err;
    }
  };

  // Check if customer has specific tag
  const hasTag = useCallback((tagId: string) => {
    return customerTags.some(tag => tag.id === tagId);
  }, [customerTags]);

  // Toggle tag on/off for customer
  const toggleTag = async (tagId: string) => {
    if (hasTag(tagId)) {
      await removeTagFromCustomer(tagId);
    } else {
      await addTagToCustomer(tagId);
    }
  };

  useEffect(() => {
    loadCustomerTags();
  }, [customerId]);

  return {
    customerTags,
    loading,
    
    // Operations
    addTagToCustomer,
    removeTagFromCustomer,
    toggleTag,
    hasTag,
    loadCustomerTags
  };
}