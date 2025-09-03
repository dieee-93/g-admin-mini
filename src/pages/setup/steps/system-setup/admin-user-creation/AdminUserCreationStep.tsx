import React from 'react';
import { Box, VStack } from '@chakra-ui/react';
import { useAdminUserForm } from './hooks/useAdminUserForm';
import { HeaderSection } from './components/HeaderSection';
import { InfoAlert } from './components/InfoAlert';
import { AdminUserForm } from './components/AdminUserForm';
import { ActionButtons } from './components/ActionButtons';
import type { AdminUserData } from './config/constants';

interface AdminUserCreationStepProps {
  onStepComplete: (userData: AdminUserData) => void;
  onBack: () => void;
}

export function AdminUserCreationStep({ onStepComplete, onBack }: AdminUserCreationStepProps) {
  const form = useAdminUserForm({ onStepComplete });

  return (
    <Box maxW="500px" mx="auto" p={6}>
      <VStack gap={6} align="stretch">
        {/* Header */}
        <HeaderSection />

        {/* Info Alert */}
        <InfoAlert />

        {/* Form */}
        <AdminUserForm
          fullName={form.fullName}
          email={form.email}
          password={form.password}
          confirmPassword={form.confirmPassword}
          errors={form.errors}
          onFullNameChange={form.setFullName}
          onEmailChange={form.setEmail}
          onPasswordChange={form.setPassword}
          onConfirmPasswordChange={form.setConfirmPassword}
        />

        {/* Action Buttons */}
        <ActionButtons
          canProceed={form.canProceed}
          isCreating={form.isCreating}
          onBack={onBack}
          onSubmit={form.handleSubmit}
        />
      </VStack>
    </Box>
  );
}