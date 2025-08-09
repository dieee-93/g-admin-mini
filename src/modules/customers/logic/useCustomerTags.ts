// src/features/customers/logic/useCustomerTags.ts
import { useState, useEffect, useCallback } from 'react';
import { CustomerTag, CustomerProfile } from '../types';
import { 
  getCustomerTags,
  createCustomerTag,
  updateCustomerTag,
  deleteCustomerTag,
  assignTagToCustomer,
  removeTagFromCustomer,
  getCustomersWithTag
} from '../data/advancedCustomerApi';

export function useCustomerTags() {
  const [tags, setTags] = useState<CustomerTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all available tags
  const loadTags = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await getCustomerTags();
      setTags(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading tags');
      console.error('Error loading customer tags:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new tag
  const createTag = async (tagData: Omit<CustomerTag, 'id' | 'created_at'>) => {
    try {
      const newTag = await createCustomerTag(tagData);
      await loadTags(); // Reload to get updated list
      return newTag;
    } catch (err) {
      console.error('Error creating tag:', err);
      throw err;
    }
  };

  // Update an existing tag
  const updateTag = async (id: string, tagData: Partial<CustomerTag>) => {
    try {
      const updatedTag = await updateCustomerTag(id, tagData);
      await loadTags(); // Reload to get updated list
      return updatedTag;
    } catch (err) {
      console.error('Error updating tag:', err);
      throw err;
    }
  };

  // Delete a tag
  const deleteTag = async (id: string) => {
    try {
      await deleteCustomerTag(id);
      await loadTags(); // Reload to get updated list
    } catch (err) {
      console.error('Error deleting tag:', err);
      throw err;
    }
  };

  // Assign tag to customer
  const assignTag = async (customerId: string, tagId: string) => {
    try {
      await assignTagToCustomer(customerId, tagId);
    } catch (err) {
      console.error('Error assigning tag to customer:', err);
      throw err;
    }
  };

  // Remove tag from customer
  const removeTag = async (customerId: string, tagId: string) => {
    try {
      await removeTagFromCustomer(customerId, tagId);
    } catch (err) {
      console.error('Error removing tag from customer:', err);
      throw err;
    }
  };

  // Get customers with specific tag
  const getCustomersWithTagId = async (tagId: string): Promise<CustomerProfile[]> => {
    try {
      return await getCustomersWithTag(tagId);
    } catch (err) {
      console.error('Error getting customers with tag:', err);
      throw err;
    }
  };

  // Filter tags by category
  const getTagsByCategory = useCallback((category: CustomerTag['category']) => {
    return tags.filter(tag => tag.category === category);
  }, [tags]);

  // Get predefined tag colors
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

  // Get next available color for new tags
  const getNextColor = useCallback(() => {
    const colors = getTagColors();
    const usedColors = tags.map(tag => tag.color);
    const availableColors = colors.filter(color => !usedColors.includes(color));
    
    if (availableColors.length > 0) {
      return availableColors[0];
    }
    
    // If all colors are used, return a random one
    return colors[Math.floor(Math.random() * colors.length)];
  }, [tags, getTagColors]);

  // Get tag statistics
  const getTagStats = useCallback(() => {
    const categoryStats = tags.reduce((acc, tag) => {
      acc[tag.category] = (acc[tag.category] || 0) + 1;
      return acc;
    }, {} as Record<CustomerTag['category'], number>);

    return {
      total: tags.length,
      byCategory: categoryStats
    };
  }, [tags]);

  useEffect(() => {
    loadTags();
  }, []);

  return {
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
      console.error('Error loading customer tags:', err);
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
      console.error('Error adding tag to customer:', err);
      throw err;
    }
  };

  // Remove tag from this customer
  const removeTagFromCustomer = async (tagId: string) => {
    try {
      await removeTag(customerId, tagId);
      await loadCustomerTags(); // Reload customer's tags
    } catch (err) {
      console.error('Error removing tag from customer:', err);
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