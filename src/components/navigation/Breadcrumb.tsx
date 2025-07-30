// ==============================================
// 📁 src/components/navigation/Breadcrumb.tsx
// ==============================================

import { Box, HStack, Text, Button } from '@chakra-ui/react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import type { BreadcrumbItem } from '../../types/navigation';

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
}

export function Breadcrumb({ items, separator }: BreadcrumbProps) {
  const defaultSeparator = (
    <ChevronRightIcon className="w-4 h-4 text-gray-400" />
  );

  return (
    <Box py={2} px={4} bg="gray.50" borderRadius="md" mb={4}>
      <HStack gap={2} flexWrap="wrap">
        {items.map((item, index) => (
          <HStack key={index} gap={2}>
            {/* Separador entre items */}
            {index > 0 && (separator || defaultSeparator)}
            
            {/* Item actual (no clickeable) */}
            {item.isCurrentPage ? (
              <HStack gap={2}>
                {item.icon}
                <Text 
                  fontSize="sm" 
                  fontWeight="medium" 
                  color="gray.800"
                >
                  {item.label}
                </Text>
              </HStack>
            ) : (
              /* Item navegable (clickeable) */
              <Button
                variant="ghost"
                size="sm"
                onClick={item.onClick}
                color="blue.600"
                fontSize="sm"
                fontWeight="medium"
                h="auto"
                p={1}
                _hover={{ 
                  bg: "blue.50",
                  textDecoration: "underline" 
                }}
              >
                <HStack gap={2}>
                  {item.icon}
                  <Text>{item.label}</Text>
                </HStack>
              </Button>
            )}
          </HStack>
        ))}
      </HStack>
    </Box>
  );
}