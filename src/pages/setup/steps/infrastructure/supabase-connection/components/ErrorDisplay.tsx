import React from 'react';
import { HStack, Badge } from '@chakra-ui/react';
import { Section, Typography } from '@/shared/ui';
import { ANIMATION_CLASSES } from '../config/constants';

interface ErrorDisplayProps {
  error: string;
}

export function ErrorDisplay({ error }: ErrorDisplayProps) {
  if (!error) return null;

  return (
    <Section 
      variant="flat"
      style={{
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.05) 0%, rgba(252, 165, 165, 0.05) 100%)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '12px',
        animation: ANIMATION_CLASSES.fadeInShake
      }}
    >
      <HStack gap="sm">
        <Badge variant="solid" colorPalette="red">❌ ERROR</Badge>
        <Typography variant="default" color="red.700" fontSize="sm">{error}</Typography>
      </HStack>
    </Section>
  );
}