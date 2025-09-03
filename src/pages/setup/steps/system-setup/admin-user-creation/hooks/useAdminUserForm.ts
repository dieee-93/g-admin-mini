import { useState, useCallback } from 'react';
import { ADMIN_USER_CONFIG, AdminUserData, FormErrors } from '../config/constants';

export interface UseAdminUserFormReturn {
  // Form state
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  
  // Error state
  errors: FormErrors;
  
  // Processing state
  isCreating: boolean;
  
  // Form actions
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  setConfirmPassword: (value: string) => void;
  setFullName: (value: string) => void;
  
  // Validation
  validateField: (field: keyof FormErrors) => boolean;
  validateAllFields: () => boolean;
  
  // Form submission
  handleSubmit: () => Promise<void>;
  
  // Computed state
  canProceed: boolean;
}

interface UseAdminUserFormProps {
  onComplete: (userData: AdminUserData) => void;
}

export function useAdminUserForm({ onComplete }: UseAdminUserFormProps): UseAdminUserFormReturn {
  const [email, setEmailState] = useState('');
  const [password, setPasswordState] = useState('');
  const [confirmPassword, setConfirmPasswordState] = useState('');
  const [fullName, setFullNameState] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  const [errors, setErrors] = useState<FormErrors>({
    email: '',
    fullName: '',
    password: '',
    confirmPassword: ''
  });

  const { VALIDATION, TEXTS } = ADMIN_USER_CONFIG;

  const validateEmail = useCallback((emailValue: string): boolean => {
    if (!emailValue?.trim()) {
      setErrors(prev => ({ ...prev, email: TEXTS.validation.emailRequired }));
      return false;
    }
    if (!VALIDATION.EMAIL_REGEX.test(emailValue)) {
      setErrors(prev => ({ ...prev, email: TEXTS.validation.emailInvalid }));
      return false;
    }
    setErrors(prev => ({ ...prev, email: '' }));
    return true;
  }, []);

  const validateFullName = useCallback((nameValue: string): boolean => {
    if (!nameValue?.trim()) {
      setErrors(prev => ({ ...prev, fullName: TEXTS.validation.nameRequired }));
      return false;
    }
    if (nameValue.trim().length < VALIDATION.MIN_NAME_LENGTH) {
      setErrors(prev => ({ ...prev, fullName: TEXTS.validation.nameMinLength }));
      return false;
    }
    setErrors(prev => ({ ...prev, fullName: '' }));
    return true;
  }, []);

  const validatePassword = useCallback((passwordValue: string): boolean => {
    if (!passwordValue) {
      setErrors(prev => ({ ...prev, password: TEXTS.validation.passwordRequired }));
      return false;
    }
    if (passwordValue.length < VALIDATION.MIN_PASSWORD_LENGTH) {
      setErrors(prev => ({ ...prev, password: TEXTS.validation.passwordMinLength }));
      return false;
    }
    if (!VALIDATION.PASSWORD_REQUIREMENTS.UPPERCASE.test(passwordValue)) {
      setErrors(prev => ({ ...prev, password: TEXTS.validation.passwordUppercase }));
      return false;
    }
    if (!VALIDATION.PASSWORD_REQUIREMENTS.LOWERCASE.test(passwordValue)) {
      setErrors(prev => ({ ...prev, password: TEXTS.validation.passwordLowercase }));
      return false;
    }
    if (!VALIDATION.PASSWORD_REQUIREMENTS.NUMBER.test(passwordValue)) {
      setErrors(prev => ({ ...prev, password: TEXTS.validation.passwordNumber }));
      return false;
    }
    setErrors(prev => ({ ...prev, password: '' }));
    return true;
  }, []);

  const validateConfirmPassword = useCallback((confirmValue: string): boolean => {
    if (confirmValue !== password) {
      setErrors(prev => ({ ...prev, confirmPassword: TEXTS.validation.passwordsNoMatch }));
      return false;
    }
    setErrors(prev => ({ ...prev, confirmPassword: '' }));
    return true;
  }, [password]);

  const validateField = useCallback((field: keyof FormErrors): boolean => {
    switch (field) {
      case 'email':
        return validateEmail(email);
      case 'fullName':
        return validateFullName(fullName);
      case 'password':
        return validatePassword(password);
      case 'confirmPassword':
        return validateConfirmPassword(confirmPassword);
      default:
        return true;
    }
  }, [email, fullName, password, confirmPassword, validateEmail, validateFullName, validatePassword, validateConfirmPassword]);

  const validateAllFields = useCallback((): boolean => {
    const isEmailValid = validateEmail(email);
    const isNameValid = validateFullName(fullName);
    const isPasswordValid = validatePassword(password);
    const isConfirmValid = validateConfirmPassword(confirmPassword);

    return isEmailValid && isNameValid && isPasswordValid && isConfirmValid;
  }, [email, fullName, password, confirmPassword, validateEmail, validateFullName, validatePassword, validateConfirmPassword]);

  const setEmail = useCallback((value: string) => {
    setEmailState(value);
    if (errors.email) validateEmail(value);
  }, [errors.email, validateEmail]);

  const setPassword = useCallback((value: string) => {
    setPasswordState(value);
    if (errors.password) validatePassword(value);
    if (confirmPassword) validateConfirmPassword(confirmPassword);
  }, [errors.password, confirmPassword, validatePassword, validateConfirmPassword]);

  const setConfirmPassword = useCallback((value: string) => {
    setConfirmPasswordState(value);
    validateConfirmPassword(value);
  }, [validateConfirmPassword]);

  const setFullName = useCallback((value: string) => {
    setFullNameState(value);
    if (errors.fullName) validateFullName(value);
  }, [errors.fullName, validateFullName]);

  const handleSubmit = useCallback(async (): Promise<void> => {
    if (!validateAllFields()) {
      return;
    }

    setIsCreating(true);
    
    try {
      // Simulate processing delay for better UX
      await new Promise(resolve => setTimeout(resolve, ADMIN_USER_CONFIG.PROCESSING_DELAY));
      
      onComplete({
        email: email.trim(),
        password,
        fullName: fullName.trim()
      });
    } catch (error) {
      console.error('Error creating admin user:', error);
    } finally {
      setIsCreating(false);
    }
  }, [email, password, fullName, validateAllFields, onComplete]);

  const canProceed = Boolean(
    email.trim() && 
    fullName.trim() && 
    password && 
    confirmPassword && 
    !errors.email && 
    !errors.fullName && 
    !errors.password && 
    !errors.confirmPassword
  );

  return {
    // Form state
    email,
    password,
    confirmPassword,
    fullName,
    
    // Error state
    errors,
    
    // Processing state
    isCreating,
    
    // Form actions
    setEmail,
    setPassword,
    setConfirmPassword,
    setFullName,
    
    // Validation
    validateField,
    validateAllFields,
    
    // Form submission
    handleSubmit,
    
    // Computed state
    canProceed,
  };
}