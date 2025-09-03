import React from 'react';
import { HStack, Flex, Text } from '@chakra-ui/react';
import { CheckIcon } from '@heroicons/react/24/outline';

interface SubCapabilityOptionProps {
  label: string;
  isChecked: boolean;
  onChange: () => void;
}

export function SubCapabilityOption({
  label,
  isChecked,
  onChange,
}: SubCapabilityOptionProps) {
  return (
    <HStack
      gap={3}
      onClick={onChange}
      cursor="pointer"
      p={2}
      borderRadius="md"
      _hover={{ bg: 'gray.200' }}
    >
      <Flex
        w="16px"
        h="16px"
        borderRadius="sm"
        border="2px solid"
        borderColor={isChecked ? 'gray.700' : 'gray.300'}
        bg={isChecked ? 'gray.700' : 'transparent'}
        align="center"
        justify="center"
      >
        {isChecked && <CheckIcon width={10} height={10} color="gray.50" />}
      </Flex>
      <Text fontSize="sm">{label}</Text>
    </HStack>
  );
}