// ====================================
// src/components/navigation/BottomNavigation.tsx - ICONOS CORREGIDOS
// ====================================

import { useNavigationState, useNavigationActions } from '@/contexts/NavigationContext';
import { Icon, Button, Stack, Typography, Badge } from '@/shared/ui';

export function BottomNavigation() {
  const navState = useNavigationState(); const navActions = useNavigationActions(); const { modules, currentModule } = navState; const { navigate } = navActions;

  // Limitar a primeros 5 módulos principales en mobile
  const visibleModules = modules.filter(m => !m.isHidden).slice(0, 5);

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'var(--chakra-colors-bg-surface)',
        borderTop: '1px solid var(--chakra-colors-border-default)',
        padding: '0.5rem 0',
        height: '70px',
        zIndex: 1002,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.1)'
      }}
    >
      <Stack direction="row" justify="space-around" align="center" height="100%" px="2">
        {visibleModules.map((module) => {
          const isActive = currentModule?.id === module.id;
          
          return (
            <div key={module.id} style={{ position: 'relative', minWidth: '60px', height: '54px' }}>
              <Button
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