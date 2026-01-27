/**
 * Team Validation Hook
 * Validation rules for team-level operations
 */

import { useCallback } from 'react';

interface TeamValidationResult {
  isValid: boolean;
  errors: string[];
}

export function useTeamValidation() {
  const validateTeamSize = useCallback((teamSize: number): TeamValidationResult => {
    const errors: string[] = [];

    if (teamSize < 0) {
      errors.push('Team size cannot be negative');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, []);

  const validateTeamName = useCallback((name: string): TeamValidationResult => {
    const errors: string[] = [];

    if (!name || name.trim().length === 0) {
      errors.push('Team name is required');
    }

    if (name.length > 100) {
      errors.push('Team name must be less than 100 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, []);

  return {
    validateTeamSize,
    validateTeamName,
  };
}
