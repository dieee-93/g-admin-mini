/**
 * STAFF POLICIES SETTINGS PAGE
 * 
 * Configure HR policies and staff management rules
 * Route: /admin/settings/staff/policies
 * 
 * @version 1.0.0
 */

import { useState } from 'react';
import {
  ContentLayout,
  PageHeader,
  Section,
  Stack,
  Button,
  Badge,
  Switch,
  Card,
  Text,
  Flex,
  Box,
} from '@/shared/ui';
import {
  useSystemStaffPolicies,
  useToggleOvertime,
  useToggleCertificationTracking,
  useToggleShiftSwapApproval,
} from '@/modules/team/hooks';
import { StaffPoliciesFormModal } from './components/StaffPoliciesFormModal';

export default function StaffPoliciesPage() {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  const { data: policies, isLoading, error } = useSystemStaffPolicies();

  const toggleOvertime = useToggleOvertime();
  const toggleCertificationTracking = useToggleCertificationTracking();
  const toggleShiftSwapApproval = useToggleShiftSwapApproval();

  const handleToggleOvertime = () => {
    if (!policies) return;
    toggleOvertime.mutate({ id: policies.id, enabled: !policies.overtime_enabled });
  };

  const handleToggleCertificationTracking = () => {
    if (!policies) return;
    toggleCertificationTracking.mutate({
      id: policies.id,
      enabled: !policies.certification_tracking_enabled,
    });
  };

  const handleToggleShiftSwapApproval = () => {
    if (!policies) return;
    toggleShiftSwapApproval.mutate({
      id: policies.id,
      required: !policies.shift_swap_approval_required,
    });
  };

  const handleOpenForm = () => setIsFormModalOpen(true);
  const handleCloseForm = () => setIsFormModalOpen(false);

  if (isLoading) {
    return (
      <ContentLayout spacing="normal">
        <PageHeader title="Políticas de Personal" />
        <Box p={8}>
          <Text>Cargando configuración...</Text>
        </Box>
      </ContentLayout>
    );
  }

  if (error) {
    return (
      <ContentLayout spacing="normal">
        <PageHeader title="Políticas de Personal" />
        <Box p={8}>
          <Text color="red.500">Error al cargar las políticas de personal</Text>
        </Box>
      </ContentLayout>
    );
  }

  if (!policies) {
    return (
      <ContentLayout spacing="normal">
        <PageHeader title="Políticas de Personal" />
        <Box p={8}>
          <Text>No se encontró configuración de políticas</Text>
        </Box>
      </ContentLayout>
    );
  }

  return (
    <ContentLayout spacing="normal">
      <PageHeader
        title="Políticas de Personal"
        subtitle="Configura políticas de RR.HH., turnos, asistencia y capacitación"
        action={
          <Button onClick={handleOpenForm} colorScheme="blue">
            Editar Políticas
          </Button>
        }
      />

      <Stack gap={6}>
        {/* Organization Section */}
        <Section title="Organización">
          <Stack gap={4}>
            <Card.Root>
              <Card.Body>
                <Text fontWeight="semibold" mb={3}>
                  Departamentos
                </Text>
                <Flex gap={2} wrap="wrap">
                  {policies.departments.map((dept) => (
                    <Badge
                      key={dept.id}
                      size="lg"
                      style={{ backgroundColor: dept.color }}
                    >
                      {dept.name}
                    </Badge>
                  ))}
                </Flex>
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Body>
                <Text fontWeight="semibold" mb={3}>
                  Puestos Configurados
                </Text>
                <Text color="gray.600">{policies.positions.length} puestos de trabajo</Text>
              </Card.Body>
            </Card.Root>
          </Stack>
        </Section>

        {/* Overtime Policies */}
        <Section title="Políticas de Horas Extras">
          <Stack gap={4}>
            <Card.Root>
              <Card.Body>
                <Flex justify="space-between" align="center">
                  <Box flex="1">
                    <Text fontWeight="semibold" fontSize="lg">
                      Horas Extras
                    </Text>
                    <Text color="gray.600" fontSize="sm">
                      Cálculo automático de tiempo extra
                    </Text>
                  </Box>
                  <Switch
                    checked={policies.overtime_enabled}
                    onCheckedChange={handleToggleOvertime}
                    disabled={toggleOvertime.isPending}
                  />
                </Flex>
              </Card.Body>
            </Card.Root>

            {policies.overtime_enabled && (
              <Card.Root>
                <Card.Body>
                  <Stack gap={3}>
                    <Flex justify="space-between">
                      <Text color="gray.600">Umbral:</Text>
                      <Text fontWeight="semibold">
                        {policies.overtime_threshold_hours} horas
                      </Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="gray.600">Multiplicador:</Text>
                      <Text fontWeight="semibold">{policies.overtime_multiplier}x</Text>
                    </Flex>
                    <Flex justify="space-between">
                      <Text color="gray.600">Período:</Text>
                      <Text fontWeight="semibold">
                        {policies.overtime_calculation_period === 'weekly'
                          ? 'Semanal'
                          : policies.overtime_calculation_period === 'biweekly'
                          ? 'Quincenal'
                          : policies.overtime_calculation_period === 'monthly'
                          ? 'Mensual'
                          : 'Diario'}
                      </Text>
                    </Flex>
                  </Stack>
                </Card.Body>
              </Card.Root>
            )}
          </Stack>
        </Section>

        {/* Break Policies */}
        <Section title="Políticas de Descansos">
          <Stack gap={4}>
            <Card.Root>
              <Card.Body>
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontWeight="semibold" fontSize="lg">
                      Duración de Descanso
                    </Text>
                    <Text color="gray.600" fontSize="sm">
                      Tiempo estándar de descanso
                    </Text>
                  </Box>
                  <Badge colorPalette="blue" size="lg">
                    {policies.break_duration_minutes} minutos
                  </Badge>
                </Flex>
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Body>
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontWeight="semibold" fontSize="lg">
                      Frecuencia de Descansos
                    </Text>
                    <Text color="gray.600" fontSize="sm">
                      Horas trabajadas antes de descanso
                    </Text>
                  </Box>
                  <Badge colorPalette="green" size="lg">
                    Cada {policies.break_frequency_hours} horas
                  </Badge>
                </Flex>
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Body>
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontWeight="semibold" fontSize="lg">
                      Umbral de Descanso No Pagado
                    </Text>
                    <Text color="gray.600" fontSize="sm">
                      Horas para descanso no remunerado (ley laboral)
                    </Text>
                  </Box>
                  <Badge colorPalette="orange" size="lg">
                    {policies.unpaid_break_threshold} horas
                  </Badge>
                </Flex>
              </Card.Body>
            </Card.Root>
          </Stack>
        </Section>

        {/* Shift Management */}
        <Section title="Gestión de Turnos">
          <Stack gap={4}>
            <Card.Root>
              <Card.Body>
                <Flex justify="space-between" align="center">
                  <Box flex="1">
                    <Text fontWeight="semibold" fontSize="lg">
                      Aprobación de Cambios de Turno
                    </Text>
                    <Text color="gray.600" fontSize="sm">
                      Requiere autorización gerencial
                    </Text>
                  </Box>
                  <Switch
                    checked={policies.shift_swap_approval_required}
                    onCheckedChange={handleToggleShiftSwapApproval}
                    disabled={toggleShiftSwapApproval.isPending}
                  />
                </Flex>
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Body>
                <Stack gap={3}>
                  <Flex justify="space-between">
                    <Text color="gray.600">Aviso mínimo:</Text>
                    <Text fontWeight="semibold">
                      {policies.shift_swap_advance_notice_hours} horas
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="gray.600">Límite mensual:</Text>
                    <Text fontWeight="semibold">
                      {policies.shift_swap_limit_per_month} cambios
                    </Text>
                  </Flex>
                </Stack>
              </Card.Body>
            </Card.Root>
          </Stack>
        </Section>

        {/* Attendance Policies */}
        <Section title="Políticas de Asistencia">
          <Stack gap={4}>
            <Card.Root>
              <Card.Body>
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontWeight="semibold" fontSize="lg">
                      Período de Gracia
                    </Text>
                    <Text color="gray.600" fontSize="sm">
                      Tolerancia al registrar entrada
                    </Text>
                  </Box>
                  <Badge colorPalette="cyan" size="lg">
                    {policies.attendance_grace_period_minutes} minutos
                  </Badge>
                </Flex>
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Body>
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontWeight="semibold" fontSize="lg">
                      Umbral de Tardanza
                    </Text>
                    <Text color="gray.600" fontSize="sm">
                      Minutos para considerar tardanza
                    </Text>
                  </Box>
                  <Badge colorPalette="yellow" size="lg">
                    {policies.late_threshold_minutes} minutos
                  </Badge>
                </Flex>
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Body>
                <Stack gap={3}>
                  <Flex justify="space-between">
                    <Text color="gray.600">Tardanzas máximas/mes:</Text>
                    <Text fontWeight="semibold">{policies.max_late_arrivals_per_month}</Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="gray.600">Ausencias máximas/mes:</Text>
                    <Text fontWeight="semibold">
                      {policies.max_unexcused_absences_per_month}
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="gray.600">Redondeo de reloj:</Text>
                    <Text fontWeight="semibold">
                      {policies.time_clock_rounding_minutes === 0
                        ? 'Desactivado'
                        : `${policies.time_clock_rounding_minutes} minutos`}
                    </Text>
                  </Flex>
                </Stack>
              </Card.Body>
            </Card.Root>
          </Stack>
        </Section>

        {/* Training & Certifications */}
        <Section title="Capacitación y Certificaciones">
          <Stack gap={4}>
            <Card.Root>
              <Card.Body>
                <Flex justify="space-between" align="center">
                  <Box flex="1">
                    <Text fontWeight="semibold" fontSize="lg">
                      Seguimiento de Certificaciones
                    </Text>
                    <Text color="gray.600" fontSize="sm">
                      Rastrear vencimientos y renovaciones
                    </Text>
                  </Box>
                  <Switch
                    checked={policies.certification_tracking_enabled}
                    onCheckedChange={handleToggleCertificationTracking}
                    disabled={toggleCertificationTracking.isPending}
                  />
                </Flex>
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Body>
                <Text fontWeight="semibold" mb={3}>
                  Capacitaciones Requeridas
                </Text>
                <Stack gap={2}>
                  {policies.training_requirements.map((training, idx) => (
                    <Text key={idx}>• {training}</Text>
                  ))}
                </Stack>
              </Card.Body>
            </Card.Root>

            {policies.certification_tracking_enabled && (
              <Card.Root>
                <Card.Body>
                  <Text fontWeight="semibold" mb={3}>
                    Certificaciones Obligatorias
                  </Text>
                  <Stack gap={2}>
                    {policies.mandatory_certifications.map((cert, idx) => (
                      <Text key={idx}>• {cert}</Text>
                    ))}
                  </Stack>
                </Card.Body>
              </Card.Root>
            )}
          </Stack>
        </Section>

        {/* Performance & Onboarding */}
        <Section title="Evaluación y Onboarding">
          <Stack gap={4}>
            <Card.Root>
              <Card.Body>
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontWeight="semibold" fontSize="lg">
                      Frecuencia de Evaluaciones
                    </Text>
                    <Text color="gray.600" fontSize="sm">
                      Revisiones de desempeño
                    </Text>
                  </Box>
                  <Badge colorPalette="purple" size="lg">
                    Cada {policies.performance_review_frequency_days} días
                  </Badge>
                </Flex>
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Body>
                <Stack gap={3}>
                  <Flex justify="space-between">
                    <Text color="gray.600">Checklist de onboarding:</Text>
                    <Text fontWeight="semibold">
                      {policies.onboarding_checklist_required ? 'Requerido' : 'Opcional'}
                    </Text>
                  </Flex>
                  <Flex justify="space-between">
                    <Text color="gray.600">Duración de onboarding:</Text>
                    <Text fontWeight="semibold">{policies.onboarding_duration_days} días</Text>
                  </Flex>
                </Stack>
              </Card.Body>
            </Card.Root>
          </Stack>
        </Section>

        {/* Termination Policies */}
        <Section title="Políticas de Término">
          <Stack gap={4}>
            <Card.Root>
              <Card.Body>
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontWeight="semibold" fontSize="lg">
                      Período de Aviso
                    </Text>
                    <Text color="gray.600" fontSize="sm">
                      Días de preaviso para terminación
                    </Text>
                  </Box>
                  <Badge colorPalette="red" size="lg">
                    {policies.termination_notice_period_days} días
                  </Badge>
                </Flex>
              </Card.Body>
            </Card.Root>

            <Card.Root>
              <Card.Body>
                <Flex justify="space-between" align="center">
                  <Box>
                    <Text fontWeight="semibold" fontSize="lg">
                      Entrevista de Salida
                    </Text>
                    <Text color="gray.600" fontSize="sm">
                      Requerida al terminar contrato
                    </Text>
                  </Box>
                  <Badge colorPalette={policies.exit_interview_required ? 'green' : 'gray'} size="lg">
                    {policies.exit_interview_required ? 'Requerida' : 'Opcional'}
                  </Badge>
                </Flex>
              </Card.Body>
            </Card.Root>
          </Stack>
        </Section>
      </Stack>

      <StaffPoliciesFormModal
        isOpen={isFormModalOpen}
        onClose={handleCloseForm}
        policies={policies}
      />
    </ContentLayout>
  );
}
