import React from 'react';
import { Box, VStack, Text } from '@/shared/ui';
import { ADMIN_USER_CONFIG } from '../config/constants';

interface PasswordRequirementsProps {
  password: string;
}

export function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const { requirements } = ADMIN_USER_CONFIG.TEXTS;
  const { VALIDATION } = ADMIN_USER_CONFIG;

  if (!password) return null;

  const requirements_list = [
    {
      text: requirements.minLength,
      valid: password.length >= VALIDATION.MIN_PASSWORD_LENGTH
    },
    {
      text: requirements.uppercase,
      valid: VALIDATION.PASSWORD_REQUIREMENTS.UPPERCASE.test(password)
    },
    {
      text: requirements.lowercase,
      valid: VALIDATION.PASSWORD_REQUIREMENTS.LOWERCASE.test(password)
    },
    {
      text: requirements.number,
      valid: VALIDATION.PASSWORD_REQUIREMENTS.NUMBER.test(password)
    }
  ];

  return (
    <Box>
      <Text fontSize="sm" color="gray.600" mb="2">
        {requirements.title}
      </Text>
      <VStack gap="1" align="start" fontSize="xs">
        {requirements_list.map((requirement, index) => (
          <Text
            key={index}
            color={requirement.valid ? "green.600" : "red.500"}
          >
            ✓ {requirement.text}
          </Text>
        ))}
      </VStack>
    </Box>
  );
}