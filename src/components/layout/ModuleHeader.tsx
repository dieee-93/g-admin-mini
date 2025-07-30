// ==============================================
// 📁 src/components/layout/ModuleHeader.tsx
// ==============================================

import { Box, Heading, Button, HStack, Separator } from '@chakra-ui/react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Breadcrumb } from '../navigation/Breadcrumb';
import type { BreadcrumbItem } from '../../types/navigation';

interface ModuleHeaderProps {
  title: string;
  color?: string;
  onBack?: () => void;
  breadcrumbItems?: BreadcrumbItem[];
  rightActions?: React.ReactNode;
}

export function ModuleHeader({ 
  title, 
  color = 'gray', 
  onBack, 
  breadcrumbItems,
  rightActions 
}: ModuleHeaderProps) {
  return (
    <Box>
      {/* Breadcrumb Navigation - Solo mostrar si hay más de 1 item */}
      {breadcrumbItems && breadcrumbItems.length > 1 && (
        <Breadcrumb items={breadcrumbItems} />
      )}

      {/* Header Principal */}
      <Box 
        bg={`${color}.50`} 
        borderLeft={`4px solid`} 
        borderColor={`${color}.400`}
        p={4} 
        mb={6}
      >
        <HStack justify="space-between" align="center">
          <HStack gap={3}>
            {onBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                color={`${color}.600`}
                _hover={{ bg: `${color}.100` }}
              >
                <ArrowLeftIcon className="w-4 h-4" />
                Volver
              </Button>
            )}
            
            {onBack && <Separator orientation="vertical" h="6" />}
            
            <Heading 
              size="lg" 
              color={`${color}.700`}
              fontWeight="bold"
            >
              {title}
            </Heading>
          </HStack>
          
          {rightActions && (
            <Box>
              {rightActions}
            </Box>
          )}
        </HStack>
      </Box>
    </Box>
  )};