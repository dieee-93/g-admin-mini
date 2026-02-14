import React from 'react';
import { VStack, HStack, Text, Badge, Section, Typography, Stack } from '@/shared/ui';
import { SUPABASE_CONNECTION_CONFIG } from '../config/constants';

export function InstructionsSection() {
  const { instructions } = SUPABASE_CONNECTION_CONFIG.TEXTS;

  return (
    <Section 
      variant="flat" 
      style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 197, 253, 0.05) 100%)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: '12px'
      }}
    >
      <VStack gap="sm" align="start">
        <HStack>
          <Badge variant="outline" colorPalette="blue">{instructions.title}</Badge>
          <Typography variant="medium" fontSize="sm">{instructions.subtitle}</Typography>
        </HStack>
        <VStack 
          gap="xs" 
          align="start" 
          fontSize="sm" 
          pl="4"
          opacity={0.9}
        >
          {instructions.steps.map((step, index) => (
            <Stack 
              key={index}
              direction="row" 
              align="center" 
              gap="xs"
              _hover={{ opacity: 1, transform: 'translateX(4px)' }}
              transition="all 0.2s ease"
            >
              <Text>{index + 1}. {step}</Text>
            </Stack>
          ))}
        </VStack>
      </VStack>
    </Section>
  );
}