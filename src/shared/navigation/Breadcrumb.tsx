// src/components/navigation/Breadcrumb.tsx
// Breadcrumb contextual para desktop
// ✅ CORREGIDO: Clickeable navigation

import { Stack, Button } from '@chakra-ui/react';
import { Typography, Icon } from '@/shared/ui';
import { ChevronRightIcon } from '@heroicons/react/24/outline';
import { useNavigation } from '@/contexts/NavigationContext';

export function Breadcrumb() {
  const { breadcrumbs, navigate } = useNavigation();

  if (breadcrumbs.length === 0) return null;

  return (
    <Stack direction="row" gap="2" align="center">
      {breadcrumbs.map((crumb, index) => (
        <Stack direction="row" key={index} gap="2" align="center">
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
              color={crumb.isActive ? "text.primary" : "text.secondary"}
              fontWeight={crumb.isActive ? 'semibold' : 'normal'}
            >
              {crumb.label}
            </Button>
          ) : (
            <Typography variant="body"
              fontSize="sm"
              color={crumb.isActive ? "text.primary" : "text.secondary"}
              fontWeight={crumb.isActive ? 'semibold' : 'normal'}
            >
              {crumb.label}
            </Typography>
          )}
          
          {index < breadcrumbs.length - 1 && (
            <Icon 
              icon={ChevronRightIcon} 
              size="sm" 
              color="text.muted" 
            />
          )}
        </Stack>
      ))}
    </Stack>
  );
}