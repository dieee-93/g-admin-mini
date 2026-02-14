import React from 'react';
import { Stack, Button } from '@/shared/ui';
import { ADMIN_USER_CONFIG } from '../config/constants';

interface ActionButtonsProps {
  canProceed: boolean;
  isCreating: boolean;
  onBack: () => void;
  onSubmit: () => void;
}

export function ActionButtons({
  canProceed,
  isCreating,
  onBack,
  onSubmit,
}: ActionButtonsProps) {
  const { buttons } = ADMIN_USER_CONFIG.TEXTS;

  return (
    <Stack direction="row" justify="space-between">
      <Button
        variant="ghost"
        onClick={onBack}
      >
        {buttons.back}
      </Button>
      
      <Button
        onClick={onSubmit}
        disabled={!canProceed}
        loading={isCreating}
      >
        {isCreating ? buttons.creating : buttons.create}
      </Button>
    </Stack>
  );
}