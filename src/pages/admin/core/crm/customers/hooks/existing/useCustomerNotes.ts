// src/features/customers/logic/useCustomerNotes.ts
import { useState, useEffect, useCallback } from 'react';
import { DecimalUtils } from '@/business-logic/shared/decimalUtils';
import { CustomerNote } from '../types';
import {
  getCustomerNotes,
  createCustomerNote,
  updateCustomerNote,
  deleteCustomerNote
} from '../services/advancedCustomerApi';

export function useCustomerNotes(customerId?: string) {
  const [notes, setNotes] = useState<CustomerNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load notes for specific customer
  const loadNotes = async () => {
    if (!customerId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getCustomerNotes(customerId);
      setNotes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading notes');
      console.error('Error loading customer notes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new note
  const createNote = async (noteData: Omit<CustomerNote, 'id' | 'created_at'>) => {
    try {
      const newNote = await createCustomerNote(noteData);
      await loadNotes(); // Reload to get updated list
      return newNote;
    } catch (err) {
      console.error('Error creating note:', err);
      throw err;
    }
  };

  // Update an existing note
  const updateNote = async (id: string, noteData: Partial<CustomerNote>) => {
    try {
      const updatedNote = await updateCustomerNote(id, noteData);
      await loadNotes(); // Reload to get updated list
      return updatedNote;
    } catch (err) {
      console.error('Error updating note:', err);
      throw err;
    }
  };

  // Delete a note
  const deleteNote = async (id: string) => {
    try {
      await deleteCustomerNote(id);
      await loadNotes(); // Reload to get updated list
    } catch (err) {
      console.error('Error deleting note:', err);
      throw err;
    }
  };

  // Filter notes by type
  const getNotesByType = useCallback((type: CustomerNote['type']) => {
    return notes.filter(note => note.type === type);
  }, [notes]);

  // Get important notes
  const getImportantNotes = useCallback(() => {
    return notes.filter(note => note.is_important);
  }, [notes]);

  // Get recent notes
  const getRecentNotes = useCallback((days: number = 30) => {
    const cutoff = new Date();
    const currentDay = cutoff.getDate();
    const newDay = DecimalUtils.subtract(currentDay.toString(), days.toString(), 'financial').toNumber();
    cutoff.setDate(newDay);
    
    return notes.filter(note => {
      const noteDate = new Date(note.created_at);
      return noteDate >= cutoff;
    }).sort((a, b) => {
      const timeA = DecimalUtils.fromValue(new Date(b.created_at).getTime(), 'financial');
      const timeB = DecimalUtils.fromValue(new Date(a.created_at).getTime(), 'financial');
      return DecimalUtils.subtract(timeA.toString(), timeB.toString(), 'financial').toNumber();
    });
  }, [notes]);

  // Get notes statistics
  const getNotesStats = useCallback(() => {
    const typeStats = notes.reduce((acc, note) => {
      const currentCount = acc[note.type] || 0;
      acc[note.type] = DecimalUtils.add(currentCount.toString(), '1', 'financial').toNumber();
      return acc;
    }, {} as Record<CustomerNote['type'], number>);

    const importantCount = notes.filter(note => note.is_important).length;
    const recentCount = getRecentNotes(7).length; // Last 7 days

    return {
      total: notes.length,
      important: importantCount,
      recent: recentCount,
      byType: typeStats
    };
  }, [notes, getRecentNotes]);

  // Get note type display info
  const getNoteTypeInfo = useCallback((type: CustomerNote['type']) => {
    const typeInfo = {
      general: { emoji: '📝', label: 'General', color: 'gray' },
      service: { emoji: '🍽️', label: 'Service', color: 'blue' },
      complaint: { emoji: '⚠️', label: 'Complaint', color: 'red' },
      compliment: { emoji: '👏', label: 'Compliment', color: 'green' },
      dietary: { emoji: '🥗', label: 'Dietary', color: 'orange' }
    };

    return typeInfo[type] || typeInfo.general;
  }, []);

  // Add a quick note (common patterns)
  const addQuickNote = async (type: CustomerNote['type'], content: string, isImportant = false) => {
    if (!customerId) throw new Error('Customer ID is required');

    const noteData: Omit<CustomerNote, 'id' | 'created_at'> = {
      customer_id: customerId,
      content,
      type,
      created_by: 'current_user', // This should be replaced with actual user ID
      is_important: isImportant
    };

    return await createNote(noteData);
  };

  // Quick note templates
  const addServiceNote = (content: string) => addQuickNote('service', content);
  const addComplaint = (content: string) => addQuickNote('complaint', content, true);
  const addCompliment = (content: string) => addQuickNote('compliment', content);
  const addDietaryNote = (content: string) => addQuickNote('dietary', content, true);

  useEffect(() => {
    loadNotes();
  }, [customerId]);

  return {
    notes,
    loading,
    error,
    
    // CRUD operations
    createNote,
    updateNote,
    deleteNote,
    loadNotes,
    
    // Filtering and analysis
    getNotesByType,
    getImportantNotes,
    getRecentNotes,
    getNotesStats,
    getNoteTypeInfo,
    
    // Quick actions
    addQuickNote,
    addServiceNote,
    addComplaint,
    addCompliment,
    addDietaryNote
  };
}

// Hook for managing notes across all customers (admin view)
export function useAllCustomerNotes() {
  const [allNotes, setAllNotes] = useState<CustomerNote[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load all notes (for admin/manager view)
  const loadAllNotes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // This would fetch all notes across customers
      // Implementation depends on API design
      setAllNotes([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading all notes');
      console.error('Error loading all customer notes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get recent complaints across all customers
  const getRecentComplaints = useCallback((days: number = 7) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    return allNotes.filter(note => {
      const noteDate = new Date(note.created_at);
      return note.type === 'complaint' && noteDate >= cutoff;
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [allNotes]);

  // Get dietary restriction notes for safety alerts
  const getDietaryAlerts = useCallback(() => {
    return allNotes.filter(note => note.type === 'dietary' && note.is_important);
  }, [allNotes]);

  // Get service quality trends
  const getServiceTrends = useCallback(() => {
    const serviceNotes = allNotes.filter(note => 
      note.type === 'service' || note.type === 'complaint' || note.type === 'compliment'
    );
    
    const last30Days = serviceNotes.filter(note => {
      const noteDate = new Date(note.created_at);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);
      return noteDate >= cutoff;
    });

    const complaints = last30Days.filter(note => note.type === 'complaint').length;
    const compliments = last30Days.filter(note => note.type === 'compliment').length;
    const serviceNotes30Days = last30Days.filter(note => note.type === 'service').length;

    return {
      total: last30Days.length,
      complaints,
      compliments,
      service: serviceNotes30Days,
      satisfaction: compliments > 0 
        ? DecimalUtils.calculatePercentage(
            compliments.toString(), 
            DecimalUtils.add(complaints.toString(), compliments.toString(), 'financial').toString()
          ).toNumber() 
        : 0
    };
  }, [allNotes]);

  useEffect(() => {
    loadAllNotes();
  }, []);

  return {
    allNotes,
    loading,
    error,
    
    // Operations
    loadAllNotes,
    
    // Analytics
    getRecentComplaints,
    getDietaryAlerts,
    getServiceTrends
  };
}