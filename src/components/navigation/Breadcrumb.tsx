// src/components/navigation/Breadcrumb.tsx
// Breadcrumb contextual para desktop
// ✅ CORREGIDO: Clickeable navigation

import { HStack, Text, Button } from '@chakra-ui/react';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { useNavigation } from '@/contexts/NavigationContext';

export function Breadcrumb() {
  const { breadcrumbs, navigate } = useNavigation();

  if (breadcrumbs.length === 0) return null;

  return (
    <HStack gap="2" align="center">
      {breadcrumbs.map((crumb, index) => (
        <HStack key={index} gap="2" align="center">
          {crumb.path ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (crumb.path === '/') {
                  navigate('dashboard');
                } else {
                  window.location.href = crumb.path;
                }
              }}
              color={crumb.isActive ? 'gray.800' : 'gray.600'}
              fontWeight={crumb.isActive ? 'semibold' : 'normal'}
            >
              {crumb.label}
            </Button>
          ) : (
            <Text
              fontSize="sm"
              color={crumb.isActive ? 'gray.800' : 'gray.600'}
              fontWeight={crumb.isActive ? 'semibold' : 'normal'}
            >
              {crumb.label}
            </Text>
          )}
          
          {index < breadcrumbs.length - 1 && (
            <ChevronRightIcon style={{ width: '16px', height: '16px', color: '#9CA3AF' }} />
          )}
        </HStack>
      ))}
    </HStack>
  );
}