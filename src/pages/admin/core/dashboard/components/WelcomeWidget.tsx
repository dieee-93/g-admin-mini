/**
 * WelcomeWidget - First-time onboarding experience
 *
 * Shown when user first arrives at dashboard after completing setup.
 * Displays:
 * - Personalized welcome message
 * - Pending milestones (next steps to unlock features)
 * - Quick actions to complete setup tasks
 * - Optional tour guide
 *
 * Based on:
 * - Gamification onboarding patterns (Yu-kai Chou)
 * - Progressive disclosure (NN/G)
 */

import React from 'react';
import {
  ContentLayout,
  Section,
  Stack,
  Typography,
  Button,
  Badge,
  Alert,
  CardGrid
} from '@/shared/ui';
import { useCapabilityStore } from '@/store/capabilityStore';
import { getFoundationalMilestone } from '@/config/RequirementsRegistry';
import { useNavigate } from 'react-router-dom';

export interface WelcomeWidgetProps {
  /** Show tour button */
  showTour?: boolean;
  /** Callback when tour is started */
  onStartTour?: () => void;
}

export const WelcomeWidget: React.FC<WelcomeWidgetProps> = ({
  showTour = true,
  onStartTour
}) => {
  const navigate = useNavigate();

  // ✅ CRITICAL FIX: Usar selectores directos para evitar objeto nuevo en cada render
  const profile = useCapabilityStore(state => state.profile);
  const pendingMilestones = useCapabilityStore(state => state.features.pendingMilestones);
  const blockedFeatures = useCapabilityStore(state => state.features.blockedFeatures);
  const validationErrors = useCapabilityStore(state => state.features.validationErrors);
  const activeFeatures = useCapabilityStore(state => state.features.activeFeatures);
  const dismissWelcome = useCapabilityStore(state => state.dismissWelcome);

  const userName = profile?.businessName || 'Bienvenido';

  // Group milestones by category for better display
  const groupedMilestones = React.useMemo(() => {
    const groups: Record<string, any[]> = {};

    pendingMilestones.slice(0, 6).forEach(milestoneId => {
      const milestone = getFoundationalMilestone(milestoneId);
      if (!milestone) return;

      if (!groups[milestone.category]) {
        groups[milestone.category] = [];
      }

      groups[milestone.category].push(milestone);
    });

    return groups;
  }, [pendingMilestones]);

  const handleMilestoneClick = (redirectUrl: string) => {
    navigate(redirectUrl);
  };

  return (
    <ContentLayout spacing="normal">
      <Stack gap={6}>
        {/* Hero Welcome */}
        <Section variant="flat">
          <Stack gap={4}>
            <Typography variant="heading" fontSize="2xl">
              🎉 ¡Bienvenido, {userName}!
            </Typography>
            <Typography variant="body" color="gray.600">
              Tu sistema está configurado. Completá estos pasos para desbloquear todas las funcionalidades.
            </Typography>

            {/* Stats Summary */}
            <Stack direction="row" gap={4}>
              <Badge colorScheme="green" p={2}>
                ✅ {activeFeatures.length} features activas
              </Badge>
              {blockedFeatures.length > 0 && (
                <Badge colorScheme="yellow" p={2}>
                  🔒 {blockedFeatures.length} bloqueadas
                </Badge>
              )}
              {pendingMilestones.length > 0 && (
                <Badge colorScheme="blue" p={2}>
                  🎯 {pendingMilestones.length} pasos pendientes
                </Badge>
              )}
            </Stack>
          </Stack>
        </Section>

        {/* Validation Errors (if any) */}
        {validationErrors.length > 0 && (
          <Section variant="elevated">
            <Stack gap={3}>
              <Typography variant="heading" fontSize="lg">
                ⚠️ Configuración requerida
              </Typography>
              {validationErrors.map((error, idx) => (
                <Alert key={idx} status="warning">
                  <Stack gap={2} width="100%">
                    <Typography variant="body" fontWeight="medium">
                      {error.message}
                    </Typography>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(error.redirectTo)}
                    >
                      Configurar ahora →
                    </Button>
                  </Stack>
                </Alert>
              ))}
            </Stack>
          </Section>
        )}

        {/* Pending Milestones */}
        {pendingMilestones.length > 0 && (
          <Section variant="elevated">
            <Stack gap={4}>
              <Typography variant="heading" fontSize="lg">
                🎯 Próximos pasos
              </Typography>
              <Typography variant="body" fontSize="sm" color="gray.600">
                Completá estos hitos para desbloquear funcionalidades avanzadas
              </Typography>

              <CardGrid columns={{ base: 1, md: 2, lg: 3 }}>
                {Object.entries(groupedMilestones).map(([category, milestones]) => (
                  <Stack key={category} gap={3}>
                    <Typography variant="body" fontWeight="medium" fontSize="sm" color="gray.500">
                      {category.toUpperCase()}
                    </Typography>
                    {milestones.map((milestone: any) => (
                      <Stack
                        key={milestone.id}
                        gap={2}
                        p={4}
                        borderWidth="1px"
                        borderRadius="md"
                        borderColor="gray.200"
                        bg="white"
                        cursor="pointer"
                        _hover={{ borderColor: 'gray.400', bg: 'gray.50' }}
                        onClick={() => handleMilestoneClick(milestone.redirectUrl)}
                      >
                        <Stack direction="row" justify="space-between" align="center">
                          <Typography variant="body" fontWeight="medium" fontSize="sm">
                            {milestone.icon} {milestone.name}
                          </Typography>
                          <Badge colorScheme="gray" fontSize="xs">
                            ~{milestone.estimatedMinutes}min
                          </Badge>
                        </Stack>
                        <Typography variant="body" fontSize="xs" color="gray.600">
                          {milestone.description}
                        </Typography>
                        <Button size="xs" variant="ghost" colorScheme="blue">
                          Ir a configurar →
                        </Button>
                      </Stack>
                    ))}
                  </Stack>
                ))}
              </CardGrid>
            </Stack>
          </Section>
        )}

        {/* Tour Guide */}
        {showTour && onStartTour && (
          <Section variant="flat">
            <Stack gap={3}>
              <Typography variant="heading" fontSize="md">
                🎓 ¿Primera vez aquí?
              </Typography>
              <Typography variant="body" fontSize="sm" color="gray.600">
                Hacé un tour rápido para conocer las secciones principales del dashboard
              </Typography>
              <Button
                variant="outline"
                colorScheme="blue"
                size="sm"
                onClick={onStartTour}
              >
                Iniciar tour guiado (2 min)
              </Button>
            </Stack>
          </Section>
        )}

        {/* No pending tasks - Success state */}
        {pendingMilestones.length === 0 && validationErrors.length === 0 && (
          <Section variant="elevated">
            <Stack gap={3} align="center" textAlign="center" py={8}>
              <Typography variant="heading" fontSize="2xl">
                ✨ ¡Todo listo!
              </Typography>
              <Typography variant="body" color="gray.600">
                No hay pasos pendientes. Tu sistema está completamente configurado.
              </Typography>
              <Button
                colorScheme="green"
                onClick={() => {
                  dismissWelcome();
                  navigate('/admin/sales');
                }}
              >
                Empezar a vender →
              </Button>
            </Stack>
          </Section>
        )}
      </Stack>
    </ContentLayout>
  );
};
