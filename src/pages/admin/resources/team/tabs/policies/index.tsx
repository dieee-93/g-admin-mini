/**
 * STAFF POLICIES TAB
 * 
 * Configure HR policies and staff management rules
 */

import { useState } from 'react';
import {
  Section,
  Stack,
  Button,
  Badge,
  Switch,
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
import { PencilSquareIcon } from '@heroicons/react/24/outline';

export function StaffPoliciesTab() {
  const policiesFormModal = useDisclosure();

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

  if (isLoading) {
    return (
      <Box p={8}>
        <Text>Cargando configuración de políticas...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={8}>
        <Text color="red.500">Error al cargar las políticas de personal</Text>
      </Box>
    );
  }

  if (!policies) {
    return (
      <Box p={8}>
        <Text>No se encontró configuración de políticas</Text>
      </Box>
    );
  }

  return (
    <Stack gap="6">
      {/* Working Hours Section */}
      <Section
        title="Horarios Laborales"
        actions={
          <Button size="sm" variant="outline" onClick={handleOpenForm}>
            <PencilSquareIcon style={{ width: '16px', height: '16px' }} />
            Editar
          </Button>
        }
      >
        <Stack gap="4">
          <Flex justify="space-between" align="center" p="4" bg="gray.50" borderRadius="md">
            <Box>
              <Text fontWeight="medium">Horas por día</Text>
              <Text fontSize="sm" color="gray.600">
                {policies.standard_hours_per_day} horas
              </Text>
            </Box>
            <Badge colorPalette="blue" size="sm">
              {policies.standard_hours_per_day}h
            </Badge>
          </Flex>

          <Flex justify="space-between" align="center" p="4" bg="gray.50" borderRadius="md">
            <Box>
              <Text fontWeight="medium">Días por semana</Text>
              <Text fontSize="sm" color="gray.600">
                {policies.standard_days_per_week} días laborables
              </Text>
            </Box>
            <Badge colorPalette="blue" size="sm">
              {policies.standard_days_per_week} días
            </Badge>
          </Flex>

          <Flex justify="space-between" align="center" p="4" bg="gray.50" borderRadius="md">
            <Box>
              <Text fontWeight="medium">Jornada semanal</Text>
              <Text fontSize="sm" color="gray.600">
                {policies.standard_hours_per_day * policies.standard_days_per_week} horas totales
              </Text>
            </Box>
            <Badge colorPalette="purple" size="sm">
              {policies.standard_hours_per_day * policies.standard_days_per_week}h/semana
            </Badge>
          </Flex>
        </Stack>
      </Section>

      {/* Vacation Policies */}
      <Section title="Políticas de Vacaciones">
        <Stack gap="4">
          <Flex justify="space-between" align="center" p="4" bg="gray.50" borderRadius="md">
            <Box>
              <Text fontWeight="medium">Días de vacaciones anuales</Text>
              <Text fontSize="sm" color="gray.600">
                {policies.vacation_days_per_year} días por año
              </Text>
            </Box>
            <Badge colorPalette="green" size="sm">
              {policies.vacation_days_per_year} días
            </Badge>
          </Flex>

          <Flex justify="space-between" align="center" p="4" bg="gray.50" borderRadius="md">
            <Box>
              <Text fontWeight="medium">Días de enfermedad anuales</Text>
              <Text fontSize="sm" color="gray.600">
                {policies.sick_days_per_year} días por año
              </Text>
            </Box>
            <Badge colorPalette="orange" size="sm">
              {policies.sick_days_per_year} días
            </Badge>
          </Flex>

          <Flex justify="space-between" align="center" p="4" bg="gray.50" borderRadius="md">
            <Box>
              <Text fontWeight="medium">Acumulación de vacaciones</Text>
              <Text fontSize="sm" color="gray.600">
                {policies.vacation_carryover_enabled ? 'Permitida' : 'No permitida'}
              </Text>
            </Box>
            <Badge colorPalette={policies.vacation_carryover_enabled ? 'green' : 'gray'} size="sm">
              {policies.vacation_carryover_enabled ? 'Activa' : 'Inactiva'}
            </Badge>
          </Flex>

          {policies.vacation_carryover_enabled && (
            <Flex justify="space-between" align="center" p="4" bg="blue.50" borderRadius="md">
              <Box>
                <Text fontWeight="medium">Máximo de días acumulables</Text>
                <Text fontSize="sm" color="gray.600">
                  {policies.vacation_carryover_max_days} días máximo
                </Text>
              </Box>
              <Badge colorPalette="blue" size="sm">
                {policies.vacation_carryover_max_days} días
              </Badge>
            </Flex>
          )}
        </Stack>
      </Section>

      {/* Overtime Policies */}
      <Section title="Políticas de Horas Extras">
        <Stack gap="4">
          <Flex justify="space-between" align="center" p="4" bg="gray.50" borderRadius="md">
            <Box>
              <Text fontWeight="medium">Horas extras habilitadas</Text>
              <Text fontSize="sm" color="gray.600">
                {policies.overtime_enabled ? 'Permitidas' : 'No permitidas'}
              </Text>
            </Box>
            <Switch
              checked={policies.overtime_enabled}
              onCheckedChange={handleToggleOvertime}
              disabled={toggleOvertime.isPending}
            />
          </Flex>

          {policies.overtime_enabled && (
            <>
              <Flex justify="space-between" align="center" p="4" bg="blue.50" borderRadius="md">
                <Box>
                  <Text fontWeight="medium">Multiplicador de horas extras</Text>
                  <Text fontSize="sm" color="gray.600">
                    {policies.overtime_multiplier}x del salario base
                  </Text>
                </Box>
                <Badge colorPalette="blue" size="sm">
                  {policies.overtime_multiplier}x
                </Badge>
              </Flex>

              <Flex justify="space-between" align="center" p="4" bg="orange.50" borderRadius="md">
                <Box>
                  <Text fontWeight="medium">Límite de horas extras mensuales</Text>
                  <Text fontSize="sm" color="gray.600">
                    {policies.overtime_max_hours_per_month} horas máximo
                  </Text>
                </Box>
                <Badge colorPalette="orange" size="sm">
                  {policies.overtime_max_hours_per_month}h/mes
                </Badge>
              </Flex>
            </>
          )}
        </Stack>
      </Section>

      {/* Absence Policies */}
      <Section title="Políticas de Ausencias">
        <Stack gap="4">
          <Flex justify="space-between" align="center" p="4" bg="gray.50" borderRadius="md">
            <Box>
              <Text fontWeight="medium">Límite de ausencias anuales</Text>
              <Text fontSize="sm" color="gray.600">
                {policies.absence_limit_per_year} ausencias permitidas
              </Text>
            </Box>
            <Badge colorPalette="red" size="sm">
              {policies.absence_limit_per_year} ausencias
            </Badge>
          </Flex>

          <Flex justify="space-between" align="center" p="4" bg="red.50" borderRadius="md">
            <Box>
              <Text fontWeight="medium">Penalización por ausencia</Text>
              <Text fontSize="sm" color="gray.600">
                {policies.absence_penalty_percentage}% de descuento
              </Text>
            </Box>
            <Badge colorPalette="red" size="sm">
              -{policies.absence_penalty_percentage}%
            </Badge>
          </Flex>
        </Stack>
      </Section>

      {/* Training Policies */}
      <Section title="Políticas de Capacitación">
        <Stack gap="4">
          <Flex justify="space-between" align="center" p="4" bg="gray.50" borderRadius="md">
            <Box>
              <Text fontWeight="medium">Horas obligatorias anuales</Text>
              <Text fontSize="sm" color="gray.600">
                {policies.required_training_hours_per_year} horas por empleado
              </Text>
            </Box>
            <Badge colorPalette="purple" size="sm">
              {policies.required_training_hours_per_year}h/año
            </Badge>
          </Flex>

          <Flex justify="space-between" align="center" p="4" bg="gray.50" borderRadius="md">
            <Box>
              <Text fontWeight="medium">Seguimiento de certificaciones</Text>
              <Text fontSize="sm" color="gray.600">
                {policies.certification_tracking_enabled ? 'Activo' : 'Inactivo'}
              </Text>
            </Box>
            <Switch
              checked={policies.certification_tracking_enabled}
              onCheckedChange={handleToggleCertificationTracking}
              disabled={toggleCertificationTracking.isPending}
            />
          </Flex>

          <Flex justify="space-between" align="center" p="4" bg="gray.50" borderRadius="md">
            <Box>
              <Text fontWeight="medium">Cursos obligatorios</Text>
              <Text fontSize="sm" color="gray.600">
                {policies.mandatory_training_courses} cursos requeridos
              </Text>
            </Box>
            <Badge colorPalette="blue" size="sm">
              {policies.mandatory_training_courses} cursos
            </Badge>
          </Flex>
        </Stack>
      </Section>

      {/* Performance Evaluation */}
      <Section title="Evaluaciones de Desempeño">
        <Stack gap="4">
          <Flex justify="space-between" align="center" p="4" bg="gray.50" borderRadius="md">
            <Box>
              <Text fontWeight="medium">Frecuencia de evaluaciones</Text>
              <Text fontSize="sm" color="gray.600">
                Cada {policies.performance_review_frequency_months} meses
              </Text>
            </Box>
            <Badge colorPalette="indigo" size="sm">
              {policies.performance_review_frequency_months} meses
            </Badge>
          </Flex>

          <Flex justify="space-between" align="center" p="4" bg="gray.50" borderRadius="md">
            <Box>
              <Text fontWeight="medium">KPIs evaluados</Text>
              <Text fontSize="sm" color="gray.600">
                {policies.performance_review_kpis} indicadores
              </Text>
            </Box>
            <Badge colorPalette="purple" size="sm">
              {policies.performance_review_kpis} KPIs
            </Badge>
          </Flex>
        </Stack>
      </Section>

      {/* Hiring Policies */}
      <Section title="Políticas de Contratación">
        <Stack gap="4">
          <Flex justify="space-between" align="center" p="4" bg="gray.50" borderRadius="md">
            <Box>
              <Text fontWeight="medium">Período de prueba</Text>
              <Text fontSize="sm" color="gray.600">
                {policies.probation_period_days} días
              </Text>
            </Box>
            <Badge colorPalette="yellow" size="sm">
              {policies.probation_period_days} días
            </Badge>
          </Flex>

          <Flex justify="space-between" align="center" p="4" bg="gray.50" borderRadius="md">
            <Box>
              <Text fontWeight="medium">Documentos requeridos</Text>
              <Text fontSize="sm" color="gray.600">
                {policies.required_documents_count} documentos obligatorios
              </Text>
            </Box>
            <Badge colorPalette="gray" size="sm">
              {policies.required_documents_count} docs
            </Badge>
          </Flex>
        </Stack>
      </Section>

      {/* Shift Management */}
      <Section title="Gestión de Turnos">
        <Stack gap="4">
          <Flex justify="space-between" align="center" p="4" bg="gray.50" borderRadius="md">
            <Box>
              <Text fontWeight="medium">Intercambio de turnos requiere aprobación</Text>
              <Text fontSize="sm" color="gray.600">
                {policies.shift_swap_approval_required ? 'Requiere aprobación' : 'Libre intercambio'}
              </Text>
            </Box>
            <Switch
              checked={policies.shift_swap_approval_required}
              onCheckedChange={handleToggleShiftSwapApproval}
              disabled={toggleShiftSwapApproval.isPending}
            />
          </Flex>

          <Flex justify="space-between" align="center" p="4" bg="gray.50" borderRadius="md">
            <Box>
              <Text fontWeight="medium">Notificación anticipada mínima</Text>
              <Text fontSize="sm" color="gray.600">
                {policies.shift_notice_hours} horas de anticipación
              </Text>
            </Box>
            <Badge colorPalette="cyan" size="sm">
              {policies.shift_notice_hours}h
            </Badge>
          </Flex>
        </Stack>
      </Section>

      {/* Benefits */}
      <Section title="Beneficios del Personal">
        <Stack gap="4">
          <Flex justify="space-between" align="center" p="4" bg="gray.50" borderRadius="md">
            <Box>
              <Text fontWeight="medium">Bono anual</Text>
              <Text fontSize="sm" color="gray.600">
                {policies.annual_bonus_percentage}% del salario anual
              </Text>
            </Box>
            <Badge colorPalette="green" size="sm">
              {policies.annual_bonus_percentage}%
            </Badge>
          </Flex>

          <Flex justify="space-between" align="center" p="4" bg="gray.50" borderRadius="md">
            <Box>
              <Text fontWeight="medium">Seguro médico incluido</Text>
              <Text fontSize="sm" color="gray.600">
                {policies.health_insurance_included ? 'Incluido' : 'No incluido'}
              </Text>
            </Box>
            <Badge colorPalette={policies.health_insurance_included ? 'green' : 'gray'} size="sm">
              {policies.health_insurance_included ? 'Activo' : 'Inactivo'}
            </Badge>
          </Flex>
        </Stack>
      </Section>

      {/* Form Modal */}
      <StaffPoliciesFormModal
        isOpen={policiesFormModal.isOpen}
        onClose={policiesFormModal.onClose}
        settings={policies}
      />
    </Stack>
  );
}
