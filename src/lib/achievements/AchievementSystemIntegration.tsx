/**
 * Ejemplo de integración del Sistema de Logros en la aplicación principal
 * 
 * Este archivo muestra cómo inicializar el sistema de logros en App.tsx o main.tsx
 * para que esté disponible en toda la aplicación.
 */

import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext'; // Ajustar según tu contexto de auth
import { initializeAchievementSystem } from '@/lib/achievements/AchievementSystem';
import useAchievementNotifications from '@/lib/achievements/useAchievementNotifications';

/**
 * Componente wrapper que inicializa el sistema de logros
 */
export const AchievementSystemProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const { user } = useAuth(); // Obtener usuario autenticado
  const isInitialized = useRef(false);

  // Inicializar notificaciones de logros
  useAchievementNotifications();

  useEffect(() => {
    let mounted = true;

    const initializeSystem = async () => {
      // Prevenir múltiples inicializaciones
      if (isInitialized.current) {
        return;
      }

      try {
        await initializeAchievementSystem({
          userId: (user as any)?.id || 'demo-user',
          autoStart: true,
          enableLogging: process.env.NODE_ENV === 'development'
        });

        if (mounted) {
          isInitialized.current = true;
          console.log('[App] Sistema de logros inicializado');
        }
      } catch (error) {
        if (mounted) {
          console.error('[App] Error inicializando sistema de logros:', error);
        }
      }
    };

    if (user && !isInitialized.current) {
      initializeSystem();
    }

    return () => {
      mounted = false;
    };
  }, [user?.id]); // Solo observar user.id, no el objeto user completo

  return <>{children}</>;
};

/**
 * Ejemplo de uso en App.tsx:
 * 
 * ```tsx
 * import { AchievementSystemProvider } from './lib/achievements/AchievementSystemIntegration';
 * 
 * function App() {
 *   return (
 *     <ChakraProvider theme={theme}>
 *       <AuthProvider>
 *         <AchievementSystemProvider>
 *           <Router>
 *             <Routes>
 *               // ... tus rutas
 *             </Routes>
 *           </Router>
 *         </AchievementSystemProvider>
 *       </AuthProvider>
 *     </ChakraProvider>
 *   );
 * }
 * ```
 */

/**
 * Ejemplo de uso en un componente de dashboard:
 * 
 * ```tsx
 * import { OnboardingGuide } from '@/pages/admin/gamification/achievements';
 * import { useAuth } from '@/contexts/AuthContext';
 * 
 * function Dashboard() {
 *   const { user } = useAuth();
 * 
 *   return (
 *     <Container maxW="7xl" py={8}>
 *       <VStack gap={6}>
 *         <Text fontSize="2xl" fontWeight="bold">Dashboard</Text>
 *         
 *         {user && (
 *           <OnboardingGuide 
 *             userId={user.id}
 *             compact={false}
 *             maxCapabilities={4}
 *           />
 *         )}
 *         
 *         // ... resto del dashboard
 *       </VStack>
 *     </Container>
 *   );
 * }
 * ```
 */

/**
 * Ejemplo de eventos de negocio que activarán hitos:
 * 
 * ```tsx
 * import eventBus from '@/lib/events/EventBus';
 * 
 * // En un formulario de producto
 * const handleCreateProduct = async (productData) => {
 *   const product = await createProduct(productData);
 *   
 *   // Emitir evento que puede completar hito "create_first_product"
 *   await eventBus.emit('products.product.created', {
 *     type: 'products.product.created',
 *     timestamp: Date.now(),
 *     userId: user.id,
 *     data: { productId: product.id, productName: product.name }
 *   });
 * };
 * 
 * // En configuración de empresa
 * const handleUpdateBusinessInfo = async (businessData) => {
 *   await updateBusinessInfo(businessData);
 *   
 *   // Emitir evento que puede completar hito "setup_business_info"
 *   await eventBus.emit('business.info.updated', {
 *     type: 'business.info.updated',
 *     timestamp: Date.now(),
 *     userId: user.id,
 *     data: businessData
 *   });
 * };
 * ```
 */