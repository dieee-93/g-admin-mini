// Tools - Stratified tools organization following G-Admin Mini architecture
// 
// TIER 1: Intelligence Tools - Recipe Intelligence, Menu Engineering, Business Analytics
// TIER 2: Operational Tools - Advanced Reporting, System Diagnostics
// TIER 3: Admin Tools - Enterprise Management, API Integrations

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ToolsMainPage from './ToolsPage';
// Temporarily import only working components
import RecipesPage from './intelligence/RecipesPage';
// import { ExecutiveDashboard } from './intelligence/business/ExecutiveDashboard';
// import { CrossModuleAnalytics } from './intelligence/business/CrossModuleAnalytics';
// import { CustomReporting } from './intelligence/business/CustomReporting';

// Import intelligence tools
import MenuEngineeringPage from './intelligence/menu-engineering';
import BusinessAnalyticsPage from './intelligence/analytics';
import PredictiveAnalyticsPage from './intelligence/predictive';
import ABCAnalysisPage from './intelligence/abc-analysis';

// Import operational tools
import DiagnosticsPage from './operational/diagnostics';
import ReportingPage from './operational/reporting';

// Import admin tools  
import EnterprisePage from './admin/enterprise';
import IntegrationsPage from './admin/integrations';

// Temporary placeholder components
const ExecutiveDashboard = () => <div>Executive Dashboard - En desarrollo</div>;
const CrossModuleAnalytics = () => <div>Cross Module Analytics - En desarrollo</div>;  
const CustomReporting = () => <div>Custom Reporting - En desarrollo</div>;

// Main Tools routing component
function ToolsPage() {
  return (
    <Routes>
      <Route index element={<ToolsMainPage />} />
      
      {/* Intelligence Tools Routes */}
      <Route path="intelligence/recipes" element={<RecipesPage />} />
      <Route path="intelligence/menu-engineering" element={<MenuEngineeringPage />} />
      <Route path="intelligence/analytics" element={<BusinessAnalyticsPage />} />
      <Route path="intelligence/predictive" element={<PredictiveAnalyticsPage />} />
      <Route path="intelligence/abc-analysis" element={<ABCAnalysisPage />} />
      <Route path="intelligence/business" element={<ExecutiveDashboard />} />
      <Route path="intelligence/reports" element={<CustomReporting />} />
      
      {/* Operational Tools Routes */}
      <Route path="operational/diagnostics" element={<DiagnosticsPage />} />
      <Route path="operational/reporting" element={<ReportingPage />} />
      
      {/* Admin Tools Routes */}
      <Route path="admin/enterprise" element={<EnterprisePage />} />
      <Route path="admin/integrations" element={<IntegrationsPage />} />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/tools" replace />} />
    </Routes>
  );
}

// Export the main ToolsPage component
export { ToolsPage };

export * from './intelligence/exports';
export * from './operational'; 
export * from './admin';