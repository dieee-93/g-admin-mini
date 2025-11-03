import React from 'react';
import { Box, VStack } from '@chakra-ui/react';
import { CardWrapper } from '@/shared/ui/CardWrapper';
import { InputField } from '@/shared/ui';
import { ADMIN_USER_CONFIG } from '../config/constants';
import { PasswordRequirements } from './PasswordRequirements';
import type { FormErrors } from '../config/constants';

interface AdminUserFormProps {
  // Form values
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  
  // Form errors
  errors: FormErrors;
  
  // Form handlers
  onFullNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
}

export function AdminUserForm({
  fullName,
  email,
  password,
  confirmPassword,
  errors,
  onFullNameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
}: AdminUserFormProps) {
  const { form } = ADMIN_USER_CONFIG.TEXTS;

  return (
    <CardWrapper>
      <Box p="6">
        <VStack gap="4" align="stretch">
          <InputField
            label={form.fullNameLabel}
            placeholder={form.fullNamePlaceholder}
            value={fullName}
            onChange={(e) => onFullNameChange(e.target.value)}
            error={errors.fullName}
            required
          />

          <InputField
            label={form.emailLabel}
            type="email"
            placeholder={form.emailPlaceholder}
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            error={errors.email}
            required
          />

          <InputField
            label={form.passwordLabel}
            type="password"
            placeholder={form.passwordPlaceholder}
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
            error={errors.password}
            required
          />

          <InputField
            label={form.confirmPasswordLabel}
            type="password"
            placeholder={form.confirmPasswordPlaceholder}
            value={confirmPassword}
            onChange={(e) => onConfirmPasswordChange(e.target.value)}
            error={errors.confirmPassword}
            required
          />

          <PasswordRequirements password={password} />
        </VStack>
      </Box>
    </CardWrapper>
  );
}