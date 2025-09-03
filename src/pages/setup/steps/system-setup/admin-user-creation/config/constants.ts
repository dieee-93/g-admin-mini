export const ADMIN_USER_CONFIG = {
  // Validation rules
  VALIDATION: {
    MIN_NAME_LENGTH: 2,
    MIN_PASSWORD_LENGTH: 8,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PASSWORD_REQUIREMENTS: {
      UPPERCASE: /[A-Z]/,
      LOWERCASE: /[a-z]/,
      NUMBER: /\d/,
    }
  },

  // UI text
  TEXTS: {
    header: {
      title: 'Crear Usuario Administrador',
      subtitle: 'Este será el usuario principal que administrará el sistema. Tendrá acceso completo a todas las funciones.'
    },
    
    infoAlert: {
      title: 'Usuario Super Admin',
      description: 'Este usuario tendrá permisos completos para gestionar otros usuarios, configurar el sistema y acceder a todas las funcionalidades.'
    },
    
    form: {
      fullNameLabel: 'Nombre completo',
      fullNamePlaceholder: 'Ej: Juan Pérez',
      emailLabel: 'Email',
      emailPlaceholder: 'admin@minegocios.com',
      passwordLabel: 'Contraseña',
      passwordPlaceholder: 'Mínimo 8 caracteres',
      confirmPasswordLabel: 'Confirmar contraseña',
      confirmPasswordPlaceholder: 'Repetir contraseña',
    },
    
    validation: {
      emailRequired: 'El email es requerido',
      emailInvalid: 'Formato de email inválido',
      nameRequired: 'El nombre completo es requerido',
      nameMinLength: 'El nombre debe tener al menos 2 caracteres',
      passwordRequired: 'La contraseña es requerida',
      passwordMinLength: 'La contraseña debe tener al menos 8 caracteres',
      passwordUppercase: 'La contraseña debe tener al menos una mayúscula',
      passwordLowercase: 'La contraseña debe tener al menos una minúscula',
      passwordNumber: 'La contraseña debe tener al menos un número',
      passwordsNoMatch: 'Las contraseñas no coinciden'
    },
    
    requirements: {
      title: 'Requisitos de contraseña:',
      minLength: 'Mínimo 8 caracteres',
      uppercase: 'Al menos una mayúscula',
      lowercase: 'Al menos una minúscula',
      number: 'Al menos un número'
    },
    
    buttons: {
      back: '← Atrás',
      create: 'Crear Usuario Admin',
      creating: 'Creando usuario...'
    }
  },

  // Processing delay (for UX)
  PROCESSING_DELAY: 1000
};

export interface AdminUserData {
  email: string;
  password: string;
  fullName: string;
}

export interface FormErrors {
  email: string;
  fullName: string;
  password: string;
  confirmPassword: string;
}