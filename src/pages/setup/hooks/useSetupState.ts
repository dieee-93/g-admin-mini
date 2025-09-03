import { useState, useCallback } from 'react';

export interface SupabaseCredentials {
  url: string;
  anonKey: string;
}

export interface AdminUserData {
  email: string;
  password: string;
  fullName: string;
}

export interface SetupProgress {
  currentGroup: number;
  currentSubStep: number;
  supabaseCredentials: SupabaseCredentials | null;
  userName: string;
  adminUserData: AdminUserData | null;
  timestamp: number;
}

export function useSetupState() {
  // Load initial state from localStorage
  const loadInitialState = useCallback((): SetupProgress => {
    const saved = localStorage.getItem('setup-progress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return {
          currentGroup: parsed.currentGroup || 0,
          currentSubStep: parsed.currentSubStep || 0,
          supabaseCredentials: parsed.supabaseCredentials || null,
          userName: parsed.userName || '',
          adminUserData: parsed.adminUserData || null,
          timestamp: parsed.timestamp || Date.now(),
        };
      } catch (error) {
        console.warn('Error loading setup progress:', error);
      }
    }
    return {
      currentGroup: 0,
      currentSubStep: 0,
      supabaseCredentials: null,
      userName: '',
      adminUserData: null,
      timestamp: Date.now(),
    };
  }, []);

  const [state, setState] = useState<SetupProgress>(loadInitialState);

  // Save progress to localStorage
  const saveProgress = useCallback((updates: Partial<SetupProgress> = {}) => {
    setState((prevState) => {
      const newState = {
        ...prevState,
        ...updates,
        timestamp: Date.now(),
      };
      localStorage.setItem('setup-progress', JSON.stringify(newState));
      console.log('💾 saveProgress: state updated', newState);
      return newState;
    });
  }, []);

  // Individual setters with auto-save
  const setCurrentGroup = useCallback((group: number) => {
    console.log('🔄 setCurrentGroup called:', group);
    saveProgress({ currentGroup: group });
  }, [saveProgress]);

  const setCurrentSubStep = useCallback((subStep: number) => {
    console.log('🔄 setCurrentSubStep called:', subStep);
    saveProgress({ currentSubStep: subStep });
  }, [saveProgress]);

  const setSupabaseCredentials = useCallback((credentials: SupabaseCredentials | null) => {
    saveProgress({ supabaseCredentials: credentials });
  }, [saveProgress]);

  const setUserName = useCallback((name: string) => {
    saveProgress({ userName: name });
  }, [saveProgress]);

  const setAdminUserData = useCallback((userData: AdminUserData | null) => {
    saveProgress({ adminUserData: userData });
  }, [saveProgress]);

  // Reset all state
  const resetState = useCallback(() => {
    const initialState: SetupProgress = {
      currentGroup: 0,
      currentSubStep: 0,
      supabaseCredentials: null,
      userName: '',
      adminUserData: null,
      timestamp: Date.now(),
    };
    setState(initialState);
    localStorage.removeItem('setup-progress');
  }, []);

  // Fill with test data (development only)
  const fillTestData = useCallback(() => {
    const testData: Partial<SetupProgress> = {
      userName: 'Test User',
      supabaseCredentials: {
        url: 'https://demo.supabase.co',
        anonKey: 'demo-key-12345'
      }
    };
    saveProgress(testData);
  }, [saveProgress]);

  return {
    // State
    ...state,
    
    // Setters
    setCurrentGroup,
    setCurrentSubStep,
    setSupabaseCredentials,
    setUserName,
    setAdminUserData,
    saveProgress,
    
    // Utilities
    resetState,
    fillTestData,
  };
}