import React from 'react';
import {
  Flex,
  HStack,
  Stack,
  Text,
  Box,
  Circle,
} from '@chakra-ui/react';
import { CheckIcon } from '@heroicons/react/24/outline';

interface ChannelOptionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isChecked: boolean;
  onChange: () => void;
}

export function ChannelOption({
  icon,
  title,
  description,
  isChecked,
  onChange,
}: ChannelOptionProps) {
  return (
    <Flex
      p={4}
      borderWidth="1px"
      borderColor={isChecked ? 'gray.400' : 'gray.200'}
      borderRadius="lg"
      bg={isChecked ? 'gray.100' : 'transparent'}
      align="center"
      justify="space-between"
      cursor="pointer"
      onClick={onChange}
      transition="all 0.2s"
      _hover={{
        borderColor: isChecked ? 'gray.400' : 'gray.300',
        transform: 'translateY(-1px)',
        boxShadow: 'sm',
      }}
    >
      <HStack gap={3}>
        <Circle
          size="32px"
          bg={isChecked ? 'gray.700' : 'gray.100'}
          color={isChecked ? 'gray.50' : 'gray.600'}
        >
          {icon}
        </Circle>
        <Stack gap={0}>
          <Text fontWeight="medium" fontSize="sm">
            {title}
          </Text>
          <Text fontSize="xs" color="gray.600">
            {description}
          </Text>
        </Stack>
      </HStack>
      <Box
        w="20px"
        h="20px"
        borderRadius="sm"
        border="2px solid"
        borderColor={isChecked ? 'gray.700' : 'gray.300'}
        bg={isChecked ? 'gray.700' : 'transparent'}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        {isChecked && <CheckIcon width={12} height={12} color="gray.50" />}
      </Box>
    </Flex>
  );
}