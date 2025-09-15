// OfflineMode.tsx - Modo offline con todas sus sub-partes
import React from 'react';

// Sub-componentes internos
import { OfflineMaterialsPage } from './OfflineMaterialsPage';
import { OfflineMaterialsPageHeader } from './OfflineMaterialsPageHeader';
import { OfflineMaterialsStats } from './OfflineMaterialsStats';

interface OfflineModeProps {
  showHeader?: boolean;
  showStats?: boolean;
}

export function OfflineMode({ showHeader = true, showStats = true }: OfflineModeProps) {
  return (
    <div>
      {showHeader && <OfflineMaterialsPageHeader />}
      {showStats && <OfflineMaterialsStats />}
      <OfflineMaterialsPage />
    </div>
  );
}

export default OfflineMode;