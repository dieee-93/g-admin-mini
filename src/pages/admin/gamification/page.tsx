// Gamification Module Router
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { GalaxiaHabilidadesPage } from './achievements/page';

export function GamificationRouter() {
  return (
    <Routes>
      {/* Ruta principal de achievements */}
      <Route path="/achievements" element={<GalaxiaHabilidadesPage />} />
      
      {/* Redirección por defecto a achievements */}
      <Route path="/" element={<Navigate to="/achievements" replace />} />
      
      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/achievements" replace />} />
    </Routes>
  );
}

// Export default para lazy loading
export default GamificationRouter;