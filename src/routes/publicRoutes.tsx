/**
 * PUBLIC ROUTES
 * Routes accessible without authentication
 */
import { Route } from 'react-router-dom';
import { PublicOnlyRoute } from '@/components/auth';
import {
  LandingPage,
  CustomerLoginPage,
  AdminLoginPage,
  AdminPortalPage
} from '@/pages/public';
import { LazySetupWizard } from './lazyComponents';

export function PublicRoutes() {
  return (
    <>
      {/* Public Landing */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<PublicOnlyRoute><CustomerLoginPage /></PublicOnlyRoute>} />

      {/* Admin Portal & Login */}
      <Route path="/admin" element={<AdminPortalPage />} />
      <Route path="/admin/login" element={<PublicOnlyRoute><AdminLoginPage /></PublicOnlyRoute>} />

      {/* Setup Wizard (First-time onboarding) */}
      <Route path="/setup" element={<LazySetupWizard />} />
    </>
  );
}
