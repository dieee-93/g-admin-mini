// src/components/navigation/ActionToolbar.tsx
// Toolbar de acciones para desktop
// ✅ MIGRADO AL DESIGN SYSTEM

import { useNavigation } from '@/contexts/NavigationContext';
import { Stack, Button, Typography, Icon } from '@/shared/ui';

export function ActionToolbar() {
  const { quickActions } = useNavigation();

  if (quickActions.length === 0) return null;

  return (
    <div
      style={{
        padding: '0.75rem 1.5rem'
      }}
    >
      <Stack direction="row" gap="sm">
        {quickActions.map((action) => {
          // ✅ Map to valid Chakra colorPalette values only
          const colorPalette = action.color === 'blue' ? 'blue' : 
                              action.color === 'green' ? 'green' :
                              action.color === 'red' ? 'red' :
                              action.color === 'orange' ? 'orange' :
                              action.color === 'purple' ? 'purple' : 'gray';

          return (
            <Button
              key={action.id}
              variant="outline"
              size="sm"
              onClick={action.action}
              colorPalette={colorPalette}
            >
              <Stack direction="row" gap="xs" align="center">
                <Icon icon={action.icon} size="sm" />
                <Typography variant="body" size="sm">
                  {action.label}
                </Typography>
              </Stack>
            </Button>
          );
        })}
      </Stack>
    </div>
  );
}