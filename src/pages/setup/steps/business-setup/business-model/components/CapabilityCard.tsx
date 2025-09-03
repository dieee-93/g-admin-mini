import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Flex,
  HStack,
  Stack,
  Text,
  Circle,
  Collapsible,
} from '@chakra-ui/react';
import {
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';

interface CapabilityCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onToggle: () => void;
  children: React.ReactNode;
}

export function CapabilityCard({
  icon,
  title,
  description,
  isSelected,
  isExpanded,
  onSelect,
  onToggle,
  children,
}: CapabilityCardProps) {
  return (
    <Box>
      <Box
        borderWidth="1px"
        borderColor={isSelected ? 'gray.400' : 'gray.200'}
        borderRadius="lg"
        bg={isSelected ? 'gray.100' : 'transparent'}
        transition="all 0.2s"
        _hover={{
          borderColor: isSelected ? 'gray.400' : 'gray.300',
          bg: isSelected ? 'gray.200' : 'gray.100',
          transform: 'translateY(-1px)',
          boxShadow: 'sm',
        }}
        overflow="hidden"
      >
        <Flex
          p={4}
          align="center"
          justify="space-between"
          onClick={onSelect}
          cursor="pointer"
        >
          <HStack gap={3}>
            <Circle
              size="36px"
              bg={isSelected ? 'gray.700' : 'gray.100'}
              color={isSelected ? 'gray.50' : 'gray.600'}
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
          {isSelected && (
            <Box
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
              cursor="pointer"
              p={1}
              borderRadius="md"
              _hover={{ bg: 'gray.200' }}
            >
              {isExpanded ? (
                <ChevronUpIcon width={16} height={16} />
              ) : (
                <ChevronDownIcon width={16} height={16} />
              )}
            </Box>
          )}
        </Flex>

        <AnimatePresence>
          {isSelected && isExpanded && (
            <Collapsible.Root open={isExpanded}>
              <Collapsible.Content>
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Box
                    p={4}
                    pt={0}
                    borderTop="1px solid"
                    borderColor="gray.200"
                  >
                    {children}
                  </Box>
                </motion.div>
              </Collapsible.Content>
            </Collapsible.Root>
          )}
        </AnimatePresence>
      </Box>
    </Box>
  );
}