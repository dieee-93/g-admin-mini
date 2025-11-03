import React from 'react';
import { VStack, HStack, Badge, Text } from '@chakra-ui/react';
import { Section, Stack } from '@/shared/ui';
import { SUPABASE_CONNECTION_CONFIG, ANIMATION_CLASSES } from '../config/constants';

export function WhatHappensNext() {
  const { whatHappensNext } = SUPABASE_CONNECTION_CONFIG.TEXTS;

  return (
    <Section 
      variant="outline" 
      style={{
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.02) 0%, rgba(134, 239, 172, 0.05) 100%)',
        animation: ANIMATION_CLASSES.fadeInUp
      }}
    >
      <VStack gap="md" align="stretch">
        <HStack>
          <Badge variant="outline" colorPalette="green">{whatHappensNext.title}</Badge>
        </HStack>
        <VStack gap="xs" align="start" pl="4">
          {whatHappensNext.steps.map((step, index) => (
            <Stack 
              key={index}
              direction="row" 
              align="center" 
              gap="xs"
              fontSize="sm"
              opacity={0.8}
              _hover={{ 
                opacity: 1, 
                transform: 'translateX(4px)',
                color: 'green.700'
              }}
              transition="all 0.2s ease"
              style={{
                animation: ANIMATION_CLASSES.fadeInLeft(index)
              }}
            >
              <Text>• {step}</Text>
            </Stack>
          ))}
        </VStack>
      </VStack>
    </Section>
  );
}