// ====================================
// src/components/navigation/BottomNavigation.tsx - ICONOS CORREGIDOS
// ====================================

import { useNavigation } from '@/contexts/NavigationContext';
import { Icon, Button, Stack, Typography, Badge } from '@/shared/ui';

export function BottomNavigation() {
  const { modules, currentModule, navigate } = useNavigation();

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: 'var(--colors-bg-canvas)',
        borderTop: '1px solid var(--colors-border-subtle)',
        padding: '0.5rem',
        height: '70px',
        zIndex: 1002,
        boxShadow: 'var(--shadows-lg)'
      }}
    >
      <Stack direction="row" justify="space-around" align="center" height="100%">
        {modules.map((module) => {
          const isActive = currentModule?.id === module.id;
          
          return (
            <div style={{ position: 'relative', minWidth: '60px', height: '54px' }}>
              <Button
                key={module.id}
                variant="ghost"
                size="sm"
                onClick={() => navigate(module.id)}
                colorPalette="gray"
              >
              <Stack gap="xs" align="center">
                <Icon 
                  icon={module.icon}
                  size="md"
                  color={isActive ? 'accent' : 'secondary'}
                />
                <Typography 
                  variant="body"
                  size="xs" 
                  color={isActive ? 'accent' : 'secondary'}
                  fontWeight={isActive ? 'semibold' : 'normal'}
                >
                  {module.title}
                </Typography>
              </Stack>

              {/* ✅ Badge para alertas/notificaciones */}
              {module.badge && (
                <div
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    background: 'var(--colors-error-500)',
                    color: 'white',
                    borderRadius: '50%',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    minWidth: '18px',
                    height: '18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid white'
                  }}
                >
                  {module.badge}
                </div>
              )}
              </Button>
            </div>
          );
        })}
      </Stack>
    </nav>
  );
}