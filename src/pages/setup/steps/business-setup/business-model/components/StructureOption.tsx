import React from 'react';
import {
  Flex,
  Text,
  Circle,
} from '@chakra-ui/react';

interface StructureOptionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isSelected: boolean;
  onClick: () => void;
}

export function StructureOption({
  icon,
  title,
  description,
  isSelected,
  onClick,
}: StructureOptionProps) {
  return (
    <Flex
      direction="column"
      p={4}
      borderWidth="1px"
      borderColor={isSelected ? 'gray.400' : 'gray.200'}
      borderRadius="lg"
      bg={isSelected ? 'gray.100' : 'transparent'}
      align="center"
      justify="center"
      textAlign="center"
      cursor="pointer"
      onClick={onClick}
      transition="all 0.2s"
      _hover={{
        borderColor: isSelected ? 'gray.400' : 'gray.300',
        transform: 'translateY(-1px)',
        boxShadow: 'sm',
      }}
      height="100%"
      minH="100px"
    >
      <Circle
        size="40px"
        bg={isSelected ? 'gray.700' : 'gray.100'}
        color={isSelected ? 'gray.50' : 'gray.600'}
        mb={2}
      >
        {icon}
      </Circle>
      <Text fontWeight="medium" fontSize="sm" mb={1}>
        {title}
      </Text>
      <Text fontSize="xs" color="gray.600">
        {description}
      </Text>
    </Flex>
  );
}