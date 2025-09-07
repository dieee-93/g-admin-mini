// ==============================================
// 📁 src/components/layout/ModuleHeader.tsx
// ==============================================

import { Box, Heading, Button, HStack, Separator } from '@chakra-ui/react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { Breadcrumb } from '../navigation/Breadcrumb';
import { useNavigation } from '@/contexts/NavigationContext';
import { Icon } from '../ui';

interface ModuleHeaderProps {
  title: string;
  color?: string;
  onBack?: () => void;
  rightActions?: React.ReactNode;
}

export function ModuleHeader({ 
  title, 
  color = 'gray', 
  onBack,
  rightActions 
}: ModuleHeaderProps) {
  const { breadcrumbs, navigateBack, canNavigateBack } = useNavigation();
  
  return (
    <Box>
      {/* Header Principal - Breadcrumb removed to avoid duplication */}
      <Box 
        bg="bg.canvas"
        borderLeft={`4px solid`} 
        borderColor={`${color}.400`}
        p={4} 
        mb={6}
      >
        <HStack justify="space-between" align="center">
          <HStack gap={3}>
            {/* Usar navegación unificada si no se proporciona onBack personalizado */}
            {(onBack || canNavigateBack) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack || navigateBack}
                color={`${color}.600`}
                _hover={{ bg: `${color}.100` }}
              >
                <Icon icon={ArrowLeftIcon} size="sm" />
                Volver
              </Button>
            )}
            
            {(onBack || canNavigateBack) && <Separator orientation="vertical" h="6" />}
            
            <Heading 
              size="lg" 
              color="text.primary"
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