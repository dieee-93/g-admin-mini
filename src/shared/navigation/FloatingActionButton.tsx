// ====================================
// src/components/navigation/FloatingActionButton.tsx - MIGRADO AL DESIGN SYSTEM
// ====================================

import { PlusIcon } from '@heroicons/react/24/outline';
import { useNavigation } from '@/contexts/NavigationContext';
import { Button, Icon } from '@/shared/ui';

export function FloatingActionButton() {
  const { quickActions, currentModule } = useNavigation();
  
  const primaryAction = quickActions[0];
  
  if (!primaryAction) return null;

  // Mapear color del módulo a color palette válido
  const getColorPalette = (color?: string) => {
    switch (color) {
      case 'blue': return 'brand';
      case 'green': return 'success';
      case 'red': return 'error';
      case 'orange': return 'warning';
      case 'purple': return 'info';
      default: return 'brand';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '90px',
        right: '16px',
        zIndex: 1003
      }}
    >
      <div
        style={{
          borderRadius: '50%',
          width: '56px',
          height: '56px',
          boxShadow: 'var(--shadows-lg)',
          overflow: 'hidden'
        }}
      >
        <div style={{ width: '100%', height: '100%' }}>
          <Button
            colorPalette={getColorPalette(currentModule?.color)}
            size="lg"
            variant="solid"
            onClick={primaryAction.action}
          >
            <Icon icon={PlusIcon} size="lg" />
          </Button>
        </div>
      </div>
    </div>
  );
}