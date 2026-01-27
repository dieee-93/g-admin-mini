/**
 * AppShell - Application Layout Shell
 * 
 * Single layout component for all authenticated routes.
 * Uses React Router <Outlet /> pattern for child routes.
 * 
 * Industry Alignment:
 * - Strapi: AuthenticatedLayout with <Outlet />
 * - React Admin: <Layout> with children
 * - Remix: Root layout with <Outlet />
 * 
 * Replaces:
 * - AdminLayout, CustomerLayout (thin wrappers)
 * - ResponsiveLayout (core container)
 * - MobileLayout, DesktopLayout (responsive navigation)
 */

import { Box } from '@chakra-ui/react';
import { useBreakpointValue } from '@chakra-ui/react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/shared/navigation/Header';
import { Sidebar } from '@/shared/navigation/Sidebar';
import { BottomNavigation } from '@/shared/navigation/BottomNavigation';
import { FloatingActionButton } from '@/shared/navigation/FloatingActionButton';
import { ActionToolbar } from '@/shared/navigation/ActionToolbar';
import { memo, type ReactNode } from 'react';

export interface AppShellProps {
  /**
   * Custom header actions (right side of header)
   * 
   * @example Admin
   * <AppShell headerActions={<AdminHeaderActions />} />
   * 
   * @example Customer
   * <AppShell headerActions={<CustomerHeaderActions />} />
   */
  headerActions?: ReactNode;
}

/**
 * AppShell - Main application container
 * 
 * Renders navigation (responsive mobile/desktop) + child routes via <Outlet />.
 * 
 * @example Usage in App.tsx
 * <Route 
 *   path="/admin" 
 *   element={<AppShell headerActions={<AdminHeaderActions />} />}
 * >
 *   <Route path="sales" element={<SalesPage />} />
 *   <Route path="products" element={<ProductsPage />} />
 * </Route>
 */
export const AppShell = memo(function AppShell({ 
  headerActions 
}: AppShellProps) {
  // Detect mobile/desktop automatically (< 768px = mobile)
  const isMobile = useBreakpointValue(
    { base: true, md: false },
    { fallback: 'md' }
  );

  return (
    <Box 
      w="100%" 
      minH="100vh" 
      bg="bg.canvas" 
      position="relative"
    >
      {/* ✅ Universal Header */}
      <Header actions={headerActions} />

      {/* ✅ Responsive Navigation - renders ONCE for all child routes */}
      {isMobile ? (
        <>
          {/* Mobile: Bottom navigation + FAB */}
          <FloatingActionButton />
          <BottomNavigation />
        </>
      ) : (
        <>
          {/* Desktop: Sidebar + Toolbar */}
          <Sidebar />
          <ActionToolbar />
        </>
      )}

      {/* ✅ Main Content - Child routes render here via <Outlet /> */}
      {/* ⚠️ NO padding here - each page handles its own layout (Magic Patterns pattern) */}
      <Box
        as="main"
        mt="60px"                                              // Header height
        ml={isMobile ? "0" : { base: "0", md: "3rem" }}       // Sidebar width (desktop only)
        pb={isMobile ? "90px" : "0"}                          // Bottom nav height (mobile only)
        overflow={isMobile ? "auto" : "visible"}
        minH="calc(100vh - 60px)"
        w="100%"
      >
        <Outlet />  {/* ← CRITICAL: Child routes render here */}
      </Box>
    </Box>
  );
});
