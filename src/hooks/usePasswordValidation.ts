import { useMemo } from 'react';

interface PasswordValidationOptions {
  context: 'login' | 'register' | 'admin-creation';
  password: string;
}

interface PasswordValidationResult {
  isValid: boolean;
  strength: number;
  strengthLabel: string;
  strengthColor: 'red' | 'orange' | 'green';
  errors: string[];
  requirements: {
    label: string;
    met: boolean;
  }[];
}

/**
 * Hook para validación de contraseñas con diferentes niveles de exigencia
 * según el contexto de uso
 */
export function usePasswordValidation({ 
  context, 
  password 
}: PasswordValidationOptions): PasswordValidationResult {
  
  return useMemo(() => {
    const errors: string[] = [];
    const requirements: { label: string; met: boolean }[] = [];
    
    // Definir requisitos según contexto
    const contextRequirements = {
      'login': {
        minLength: 3,
        requireUppercase: false,
        requireNumbers: false,
        requireSpecialChars: false,
        description: 'Validación relajada para login diario'
      },
      'register': {
        minLength: 6,
        requireUppercase: false,
        requireNumbers: false,
        requireSpecialChars: false,
        description: 'Validación básica para registro de clientes'
      },
      'admin-creation': {
        minLength: 8,
        requireUppercase: true,
        requireNumbers: true,
        requireSpecialChars: true,
        description: 'Validación estricta para usuarios administrativos'
      }
    };
    
    const rules = contextRequirements[context];
    
    // Validar longitud mínima
    const lengthMet = password.length >= rules.minLength;
    requirements.push({
      label: `Mínimo ${rules.minLength} caracteres`,
      met: lengthMet
    });
    
    if (!lengthMet) {
      errors.push(`La contraseña debe tener al menos ${rules.minLength} caracteres`);
    }
    
    // Validar mayúsculas (solo para admin)
    if (rules.requireUppercase) {
      const uppercaseMet = /[A-Z]/.test(password);
      requirements.push({
        label: 'Al menos una mayúscula',
        met: uppercaseMet
      });
      
      if (!uppercaseMet) {
        errors.push('Debe contener al menos una letra mayúscula');
      }
    }
    
    // Validar números (solo para admin)
    if (rules.requireNumbers) {
      const numbersMet = /[0-9]/.test(password);
      requirements.push({
        label: 'Al menos un número',
        met: numbersMet
      });
      
      if (!numbersMet) {
        errors.push('Debe contener al menos un número');
      }
    }
    
    // Validar caracteres especiales (solo para admin)
    if (rules.requireSpecialChars) {
      const specialCharsMet = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
      requirements.push({
        label: 'Al menos un carácter especial',
        met: specialCharsMet
      });
      
      if (!specialCharsMet) {
        errors.push('Debe contener al menos un carácter especial (!@#$%^&*)');
      }
    }
    
    // Calcular fuerza según contexto
    let strength = 0;
    
    switch (context) {
      case 'login':
        // Más permisivo para login
        if (password.length >= 3) strength += 40;
        if (password.length >= 6) strength += 30;
        if (/[A-Z]/.test(password) || /[0-9]/.test(password)) strength += 30;
        break;
        
      case 'register':
        // Moderado para registro
        if (password.length >= 6) strength += 35;
        if (password.length >= 8) strength += 25;
        if (/[A-Z]/.test(password)) strength += 20;
        if (/[0-9]/.test(password)) strength += 20;
        break;
        
      case 'admin-creation':
        // Estricto para admins
        if (password.length >= 8) strength += 20;
        if (password.length >= 12) strength += 20;
        if (/[A-Z]/.test(password) && /[a-z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 20;
        if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) strength += 15;
        break;
    }
    
    strength = Math.min(strength, 100);
    
    // Determinar etiqueta y color
    let strengthLabel: string;
    let strengthColor: 'red' | 'orange' | 'green';
    
    if (context === 'admin-creation') {
      // Más exigente para admins
      if (strength >= 90) {
        strengthLabel = 'Corporativa';
        strengthColor = 'green';
      } else if (strength >= 70) {
        strengthLabel = 'Buena';
        strengthColor = 'orange';
      } else {
        strengthLabel = 'Insuficiente';
        strengthColor = 'red';
      }
    } else {
      // Más permisivo para login/registro
      if (strength >= 70) {
        strengthLabel = 'Excelente';
        strengthColor = 'green';
      } else if (strength >= 40) {
        strengthLabel = 'Buena';
        strengthColor = 'orange';
      } else {
        strengthLabel = 'Válida';
        strengthColor = 'red';
      }
    }
    
    const isValid = errors.length === 0;
    
    return {
      isValid,
      strength,
      strengthLabel,
      strengthColor,
      errors,
      requirements
    };
  }, [context, password]);
}