/**
 * DynamicDashboardGrid - Dashboard Widget System
 *
 * Renders dashboard widgets using the Hook System (Module Registry).
 * Modules register their widgets via manifest hooks.
 *
 * @version 2.1.0 - Direct rendering (no Stack wrapper)
 */

import React from 'react';
import { Box, SimpleGrid } from '@/shared/ui';
import { ModuleRegistry } from '@/lib/modules';
import { COMPONENT_TOKENS, DASHBOARD_TOKENS } from '@/theme/tokens';

export const DynamicDashboardGrid: React.FC = () => {
  // Get widgets directly from registry (without Stack wrapper)
  const registry = React.useMemo(() => ModuleRegistry.getInstance(), []);

  const widgets = React.useMemo(() => {
    const results = registry.doAction('dashboard.widgets');
    return results.filter((widget) => widget != null);
  }, [registry]);

  return (
    <Box>
      <Box p={DASHBOARD_TOKENS.spacing.pageContainer}>
        <SimpleGrid
          columns={{
            base: 1,
            sm: 2,
            md: 3,
            lg: 3
          }}
          gap={COMPONENT_TOKENS.ExecutiveOverview.cardGridGap}
        >
          {widgets.map((widget, index) => (
            <React.Fragment key={`widget-${index}`}>
              {widget}
            </React.Fragment>
          ))}
        </SimpleGrid>
      </Box>
    </Box>
  );
};

export default DynamicDashboardGrid;
