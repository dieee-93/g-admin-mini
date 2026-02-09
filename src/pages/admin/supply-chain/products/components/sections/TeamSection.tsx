/**
 * STAFF SECTION - Redesigned v3.0 (StaffRoles-based)
 *
 * Section for defining PRODUCTION staff required for a product.
 * Uses StaffRoles (job roles) with optional TeamMember drill-down.
 * 
 * KEY CHANGES from v2:
 * - Uses StaffRoles instead of Employees directly
 * - Two-selector pattern: Role first, then optional specific TeamMember
 * - Integrates loaded_factor for accurate labor costing
 * - Clarifies this is for PRODUCTION staff only (not service staff)
 *
 * Visible for: physical_product, service, rental (if feature 'staff_labor_cost_tracking' active)
 *
 * @design docs/product/COSTING_ARCHITECTURE.md (Sections 5 & 9)
 * @pattern Cross-Module Data Fetching via ModuleRegistry.getExports()
 */

import { useState, useEffect, useCallback } from 'react';
import { 
  Stack, Switch, Button, IconButton, Text, Box, HStack, Alert, Icon, 
  SelectField, NumberField, Table, Badge, Tooltip 
} from '@/shared/ui';
import type { FormSectionProps, StaffFields, StaffAllocation, ProductType } from '../../types/productForm';
import { PlusIcon, TrashIcon, UserIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { ModuleRegistry } from '@/lib/modules';
import type { StaffAPI } from '@/modules/team/manifest';

// ============================================
// TYPES
// ============================================

interface StaffSectionProps extends Omit<FormSectionProps, 'data' | 'onChange'> {
  data: StaffFields;
  productType: ProductType;
  hasBooking?: boolean;  // If booking is active, duration is REQUIRED
  onChange: (data: StaffFields) => void;
}

interface StaffRoleOption {
  id: string;
  name: string;
  department?: string | null;
  default_hourly_rate?: number | null;
  loaded_factor: number;
  loaded_hourly_cost: number;
  is_active?: boolean;
}

interface EmployeeOption {
  id: string;
  first_name: string;
  last_name: string;
  position?: string;
  hourly_rate?: number;
  staff_role_id?: string;
  is_active?: boolean;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Calculate labor cost for a single allocation
 */
function calculateAllocationCost(
  allocation: StaffAllocation,
  role?: StaffRoleOption
): { hours: number; cost: number; loadedHourlyCost: number } {
  const hours = (allocation.duration_minutes / 60) * (allocation.count || 1);
  
  // Rate hierarchy: override > role default > 0
  const baseRate = allocation.hourly_rate_override ?? role?.default_hourly_rate ?? 0;
  
  // Loaded factor hierarchy: override > role > 1.0
  const loadedFactor = allocation.loaded_factor_override ?? role?.loaded_factor ?? 1.0;
  
  const loadedHourlyCost = baseRate * loadedFactor;
  const cost = hours * loadedHourlyCost;
  
  return { hours, cost, loadedHourlyCost };
}

/**
 * Get helper text based on product type
 */
function getHelperText(productType: ProductType): string {
  switch (productType) {
    case 'physical_product':
      return 'Personal de PRODUCCION necesario para preparar este producto (ej: cocinero, preparador)';
    case 'service':
      return 'Personal que REALIZA el servicio (ej: masajista, estilista, consultor)';
    case 'rental':
      return 'Personal incluido con el alquiler (ej: operador, chofer)';
    default:
      return 'Personal de produccion requerido para este producto';
  }
}

// ============================================
// MAIN COMPONENT
// ============================================

export function StaffSection({
  data,
  productType,
  hasBooking = false,
  onChange,
  errors = [],
  readOnly = false
}: StaffSectionProps) {
  // ============================================
  // CROSS-MODULE DATA FETCHING
  // ============================================
  
  const registry = ModuleRegistry.getInstance();
  const staffModule = registry.getExports<StaffAPI>('staff');
  
  // StaffRoles (primary selector)
  const useStaffRoles = staffModule?.hooks?.useStaffRoles;
  const rolesHook = useStaffRoles ? useStaffRoles() : null;
  const roles = (rolesHook?.items || []) as StaffRoleOption[];
  const rolesLoading = rolesHook?.loading || false;
  
  // Employees (secondary selector, filtered by role)
  const useEmployeesList = staffModule?.hooks?.useEmployeesList;
  const employeesHook = useEmployeesList ? useEmployeesList() : null;
  const teamMembers = (employeesHook?.items || []) as EmployeeOption[];
  const employeesLoading = employeesHook?.loading || false;

  // Prepare role options with calculated loaded_hourly_cost
  const roleOptions: StaffRoleOption[] = (roles as StaffRoleOption[])
    .filter(r => r.is_active !== false)
    .map(r => ({
      ...r,
      loaded_hourly_cost: (r.default_hourly_rate ?? 0) * (r.loaded_factor ?? 1)
    }));

  // ============================================
  // QUICK ADD STATE
  // ============================================
  
  const [quickAddRoleId, setQuickAddRoleId] = useState<string>('');
  const [quickAddEmployeeId, setQuickAddEmployeeId] = useState<string>('');
  const [quickAddCount, setQuickAddCount] = useState<number>(1);
  const [quickAddDuration, setQuickAddDuration] = useState<number>(hasBooking ? 60 : 30);

  // Get teamMembers filtered by selected role
  const filteredEmployees = quickAddRoleId
    ? (teamMembers as EmployeeOption[]).filter(e => e.staff_role_id === quickAddRoleId && e.is_active !== false)
    : [];

  // Reset teamMember when role changes
  useEffect(() => {
    setQuickAddEmployeeId('');
  }, [quickAddRoleId]);

  // ============================================
  // HANDLERS
  // ============================================
  
  const handleChange = <K extends keyof StaffFields>(
    field: K,
    value: StaffFields[K]
  ) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  const updateStaffAllocation = (index: number, updated: StaffAllocation) => {
    const allocations = [...(data.staff_allocation || [])];
    allocations[index] = updated;
    handleChange('staff_allocation', allocations);
  };

  const removeStaffAllocation = (index: number) => {
    const allocations = [...(data.staff_allocation || [])];
    allocations.splice(index, 1);
    handleChange('staff_allocation', allocations);
  };

  const handleQuickAdd = useCallback(() => {
    if (!quickAddRoleId) return;

    const role = roleOptions.find(r => r.id === quickAddRoleId);
    if (!role) return;

    const teamMember = quickAddEmployeeId 
      ? (teamMembers as EmployeeOption[]).find(e => e.id === quickAddEmployeeId)
      : null;

    const newAllocation: StaffAllocation = {
      role_id: quickAddRoleId,
      role_name: role.name,
      employee_id: quickAddEmployeeId || null,
      employee_name: teamMember ? `${teamMember.first_name} ${teamMember.last_name}` : undefined,
      count: quickAddCount,
      duration_minutes: quickAddDuration,
      // Use teamMember's rate if specific teamMember selected, otherwise role's default
      hourly_rate_override: teamMember?.hourly_rate ?? null,
      loaded_factor_override: null, // Use role's factor by default
    };

    // Calculate costs for display
    const { hours, cost, loadedHourlyCost } = calculateAllocationCost(newAllocation, role);
    newAllocation.total_hours = hours;
    newAllocation.total_cost = cost;
    newAllocation.loaded_hourly_cost = loadedHourlyCost;
    newAllocation.effective_hourly_rate = newAllocation.hourly_rate_override ?? role.default_hourly_rate ?? 0;

    const allocations = [...(data.staff_allocation || []), newAllocation];
    handleChange('staff_allocation', allocations);

    // Reset quick add form
    setQuickAddRoleId('');
    setQuickAddEmployeeId('');
    setQuickAddCount(1);
    setQuickAddDuration(hasBooking ? 60 : 30);
  }, [quickAddRoleId, quickAddEmployeeId, quickAddCount, quickAddDuration, roleOptions, teamMembers, data.staff_allocation, hasBooking, handleChange]);

  // ============================================
  // CALCULATIONS
  // ============================================
  
  const totalLaborCost = (data.staff_allocation || []).reduce((sum, alloc) => {
    const role = roleOptions.find(r => r.id === alloc.role_id);
    const { cost } = calculateAllocationCost(alloc, role);
    return sum + cost;
  }, 0);

  const totalHours = (data.staff_allocation || []).reduce((sum, alloc) => {
    return sum + (alloc.duration_minutes / 60) * (alloc.count || 1);
  }, 0);

  // ============================================
  // PREPARE SELECT OPTIONS
  // ============================================
  
  const roleSelectOptions = roleOptions.map(r => ({
    value: r.id,
    label: `${r.name}${r.department ? ` (${r.department})` : ''} - $${r.loaded_hourly_cost.toFixed(2)}/h`
  }));

  const employeeSelectOptions = filteredEmployees.map(e => ({
    value: e.id,
    label: `${e.first_name} ${e.last_name}${e.hourly_rate ? ` ($${e.hourly_rate}/h)` : ''}`
  }));

  // ============================================
  // RENDER
  // ============================================
  
  return (
    <Stack gap="4">
      {/* Header with info tooltip */}
      <Stack gap="2">
        <HStack gap="2">
          <Switch
            checked={data.has_staff_requirements || false}
            onChange={(checked) => handleChange('has_staff_requirements', checked)}
            disabled={readOnly}
          >
            Este producto requiere personal
          </Switch>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <Box as="span" cursor="help">
                <Icon icon={InformationCircleIcon} color="fg.muted" boxSize="4" />
              </Box>
            </Tooltip.Trigger>
            <Tooltip.Positioner>
              <Tooltip.Content>
                Define el personal necesario para PRODUCIR este producto. El personal de SERVICIO (mesero, repartidor) se configura por separado en Contextos de Entrega.
              </Tooltip.Content>
            </Tooltip.Positioner>
          </Tooltip.Root>
        </HStack>
        <Text color="fg.muted" fontSize="sm">
          {getHelperText(productType)}
        </Text>
      </Stack>

      {data.has_staff_requirements && (
        <Stack gap="4">
          {/* Production Staff Label */}
          <Badge colorPalette="blue" variant="subtle" size="sm">
            Personal de Produccion
          </Badge>

          {/* Staff Allocations Table */}
          {data.staff_allocation && data.staff_allocation.length > 0 ? (
            <Box borderWidth="1px" borderRadius="md" overflow="hidden">
              <Table.Root size="sm" variant="outline">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Rol / Empleado</Table.ColumnHeader>
                    <Table.ColumnHeader numeric>Cant.</Table.ColumnHeader>
                    <Table.ColumnHeader numeric>Duracion</Table.ColumnHeader>
                    <Table.ColumnHeader numeric>Tarifa Cargada</Table.ColumnHeader>
                    <Table.ColumnHeader numeric>Subtotal</Table.ColumnHeader>
                    <Table.ColumnHeader style={{ width: '50px' }}>{' '}</Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {data.staff_allocation.map((allocation, index) => (
                    <StaffTableRow
                      key={allocation.id || index}
                      allocation={allocation}
                      roleOptions={roleOptions}
                      teamMembers={teamMembers as EmployeeOption[]}
                      rolesLoading={rolesLoading}
                      employeesLoading={employeesLoading}
                      hasBooking={hasBooking}
                      onUpdate={(updated) => updateStaffAllocation(index, updated)}
                      onRemove={() => removeStaffAllocation(index)}
                      readOnly={readOnly}
                    />
                  ))}

                  {/* Totals Row */}
                  <Table.Row style={{ backgroundColor: 'var(--colors-bg-muted)' }}>
                    <Table.Cell colSpan={2} style={{ textAlign: 'right', fontWeight: 500 }}>
                      Total:
                    </Table.Cell>
                    <Table.Cell numeric style={{ fontWeight: 500 }}>
                      {totalHours.toFixed(1)}h
                    </Table.Cell>
                    <Table.Cell numeric style={{ fontWeight: 700 }}>
                      Costo Labor:
                    </Table.Cell>
                    <Table.Cell numeric style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--colors-blue-600)' }}>
                      ${totalLaborCost.toFixed(2)}
                    </Table.Cell>
                    <Table.Cell>{' '}</Table.Cell>
                  </Table.Row>
                </Table.Body>
              </Table.Root>
            </Box>
          ) : (
            <Alert.Root status="info" variant="subtle">
              <Alert.Indicator />
              <Alert.Content>
                <Alert.Title>Sin personal asignado</Alert.Title>
                <Alert.Description>
                  Selecciona un rol de trabajo para agregar personal de produccion a este producto
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>
          )}

          {/* Quick Add Row */}
          {!readOnly && (
            <Box borderWidth="1px" borderRadius="md" p={3} bg="bg.subtle">
              <Stack gap="3">
                <Text fontWeight="medium" fontSize="sm">
                  Agregar Personal de Produccion
                </Text>
                <Stack gap="2">
                  {/* Row 1: Role selector */}
                  <HStack gap="2">
                    <Box flex={2}>
                      <SelectField
                        placeholder={rolesLoading ? "Cargando roles..." : "Selecciona rol de trabajo *"}
                        value={quickAddRoleId ? [quickAddRoleId] : []}
                        onValueChange={(details) => setQuickAddRoleId(details.value[0] || '')}
                        disabled={rolesLoading}
                        options={roleSelectOptions}
                        size="sm"
                      />
                    </Box>
                    <Box flex={1}>
                      <SelectField
                        placeholder={!quickAddRoleId ? "Primero selecciona rol" : employeesLoading ? "Cargando..." : "Empleado (opcional)"}
                        value={quickAddEmployeeId ? [quickAddEmployeeId] : []}
                        onValueChange={(details) => setQuickAddEmployeeId(details.value[0] || '')}
                        disabled={!quickAddRoleId || employeesLoading || filteredEmployees.length === 0}
                        options={employeeSelectOptions}
                        size="sm"
                      />
                    </Box>
                  </HStack>
                  
                  {/* Row 2: Count, Duration, Add button */}
                  <HStack gap="2">
                    <Box flex={0.5}>
                      <NumberField
                        min={1}
                        placeholder="Cant."
                        value={quickAddCount}
                        onChange={(val) => setQuickAddCount(val)}
                        size="sm"
                      />
                    </Box>
                    <Box flex={0.8}>
                      <NumberField
                        min={1}
                        placeholder="Minutos"
                        value={quickAddDuration}
                        onChange={(val) => setQuickAddDuration(val)}
                        size="sm"
                      />
                    </Box>
                    <Text fontSize="xs" color="fg.muted" flex={0.5}>
                      = {(quickAddDuration / 60).toFixed(1)}h
                    </Text>
                    <Button
                      variant="solid"
                      colorPalette="blue"
                      size="sm"
                      onClick={handleQuickAdd}
                      disabled={!quickAddRoleId || quickAddCount <= 0 || quickAddDuration <= 0}
                    >
                      <Icon icon={PlusIcon} />
                      Agregar
                    </Button>
                  </HStack>
                </Stack>

                {/* Helper text for teamMember selection */}
                {quickAddRoleId && filteredEmployees.length === 0 && !employeesLoading && (
                  <Text fontSize="xs" color="orange.500">
                    No hay empleados asignados a este rol. Se usara la tarifa por defecto del rol.
                  </Text>
                )}
              </Stack>
            </Box>
          )}

          {/* Info messages */}
          {hasBooking && (
            <Text fontSize="xs" color="orange.500">
              La duracion es requerida para calcular disponibilidad en reservas
            </Text>
          )}

          {data.staff_allocation && data.staff_allocation.length > 0 && (
            <Stack gap="1">
              <Text fontSize="xs" color="fg.muted">
                Los costos incluyen el factor de carga (cargas sociales, beneficios).
              </Text>
              <Text fontSize="xs" color="fg.muted">
                Este es el personal de PRODUCCION. El personal de servicio (mesero, delivery) se configura en Contextos de Entrega.
              </Text>
            </Stack>
          )}
        </Stack>
      )}
    </Stack>
  );
}

// ============================================
// TABLE ROW COMPONENT
// ============================================

interface StaffTableRowProps {
  allocation: StaffAllocation;
  roleOptions: StaffRoleOption[];
  teamMembers: EmployeeOption[];
  rolesLoading: boolean;
  employeesLoading: boolean;
  hasBooking: boolean;
  onUpdate: (allocation: StaffAllocation) => void;
  onRemove: () => void;
  readOnly?: boolean;
}

function StaffTableRow({
  allocation,
  roleOptions,
  teamMembers,
  rolesLoading,
  employeesLoading,
  hasBooking,
  onUpdate,
  onRemove,
  readOnly = false
}: StaffTableRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  const selectedRole = roleOptions.find(r => r.id === allocation.role_id);
  const selectedEmployee = allocation.employee_id 
    ? teamMembers.find(e => e.id === allocation.employee_id)
    : null;

  // Calculate costs
  const { hours, cost, loadedHourlyCost } = calculateAllocationCost(allocation, selectedRole);

  // Employees filtered by this allocation's role
  const filteredEmployees = teamMembers.filter(e => e.staff_role_id === allocation.role_id);

  const roleSelectOptions = roleOptions.map(r => ({
    value: r.id,
    label: `${r.name}${r.department ? ` (${r.department})` : ''}`
  }));

  const employeeSelectOptions = filteredEmployees.map(e => ({
    value: e.id,
    label: `${e.first_name} ${e.last_name}`
  }));

  // Handle role change - reset teamMember and update rate
  const handleRoleChange = (newRoleId: string) => {
    const newRole = roleOptions.find(r => r.id === newRoleId);
    onUpdate({
      ...allocation,
      role_id: newRoleId,
      role_name: newRole?.name || '',
      employee_id: null,
      employee_name: undefined,
      hourly_rate_override: null, // Reset to use role's default
    });
  };

  // Handle teamMember change
  const handleEmployeeChange = (newEmployeeId: string | null) => {
    const teamMember = newEmployeeId ? teamMembers.find(e => e.id === newEmployeeId) : null;
    onUpdate({
      ...allocation,
      employee_id: newEmployeeId,
      employee_name: teamMember ? `${teamMember.first_name} ${teamMember.last_name}` : undefined,
      hourly_rate_override: teamMember?.hourly_rate ?? null,
    });
  };

  if (isEditing && !readOnly) {
    return (
      <Table.Row>
        <Table.Cell>
          <Stack gap="2">
            <SelectField
              value={allocation.role_id ? [allocation.role_id] : []}
              onValueChange={(details) => handleRoleChange(details.value[0] || '')}
              disabled={rolesLoading}
              options={roleSelectOptions}
              size="sm"
            />
            <SelectField
              placeholder="Empleado (opcional)"
              value={allocation.employee_id ? [allocation.employee_id] : []}
              onValueChange={(details) => handleEmployeeChange(details.value[0] || null)}
              disabled={employeesLoading || filteredEmployees.length === 0}
              options={employeeSelectOptions}
              size="sm"
            />
          </Stack>
        </Table.Cell>
        <Table.Cell>
          <NumberField
            min={1}
            value={allocation.count || 1}
            onChange={(val) => onUpdate({ ...allocation, count: val })}
            size="sm"
          />
        </Table.Cell>
        <Table.Cell>
          <NumberField
            min={1}
            value={allocation.duration_minutes || 0}
            onChange={(val) => onUpdate({ ...allocation, duration_minutes: val })}
            size="sm"
          />
        </Table.Cell>
        <Table.Cell numeric>
          <Text fontSize="sm">${loadedHourlyCost.toFixed(2)}/h</Text>
        </Table.Cell>
        <Table.Cell numeric>
          <Text fontWeight="medium">${cost.toFixed(2)}</Text>
        </Table.Cell>
        <Table.Cell>
          <HStack gap="1">
            <Button size="xs" variant="ghost" onClick={() => setIsEditing(false)}>
              Done
            </Button>
            <IconButton
              variant="ghost"
              colorPalette="red"
              size="xs"
              onClick={onRemove}
              aria-label="Eliminar"
            >
              <Icon icon={TrashIcon} />
            </IconButton>
          </HStack>
        </Table.Cell>
      </Table.Row>
    );
  }

  return (
    <Table.Row
      style={{ cursor: readOnly ? 'default' : 'pointer' }}
      onClick={() => !readOnly && setIsEditing(true)}
    >
      <Table.Cell>
        <Stack gap="0">
          <HStack gap="1">
            <Text fontWeight="medium" fontSize="sm">
              {selectedRole?.name || allocation.role_name || 'Rol desconocido'}
            </Text>
            {selectedRole?.department && (
              <Badge size="sm" variant="subtle" colorPalette="gray">
                {selectedRole.department}
              </Badge>
            )}
          </HStack>
          {selectedEmployee && (
            <HStack gap="1">
              <Icon icon={UserIcon} boxSize="3" color="fg.muted" />
              <Text fontSize="xs" color="fg.muted">
                {selectedEmployee.first_name} {selectedEmployee.last_name}
              </Text>
            </HStack>
          )}
          {!selectedEmployee && allocation.employee_name && (
            <Text fontSize="xs" color="fg.muted">
              {allocation.employee_name}
            </Text>
          )}
        </Stack>
      </Table.Cell>
      <Table.Cell numeric>
        <Text fontSize="sm">{allocation.count || 1}</Text>
      </Table.Cell>
      <Table.Cell numeric>
        <Stack gap="0">
          <Text fontSize="sm">{allocation.duration_minutes || 0} min</Text>
          <Text fontSize="xs" color="fg.muted">({hours.toFixed(1)}h)</Text>
        </Stack>
      </Table.Cell>
      <Table.Cell numeric>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <Text fontSize="sm" style={{ cursor: 'help' }}>${loadedHourlyCost.toFixed(2)}/h</Text>
          </Tooltip.Trigger>
          <Tooltip.Positioner>
            <Tooltip.Content>
              Base: ${(allocation.hourly_rate_override ?? selectedRole?.default_hourly_rate ?? 0).toFixed(2)} x Factor: {(allocation.loaded_factor_override ?? selectedRole?.loaded_factor ?? 1).toFixed(2)}
            </Tooltip.Content>
          </Tooltip.Positioner>
        </Tooltip.Root>
      </Table.Cell>
      <Table.Cell numeric>
        <Text fontWeight="medium">${cost.toFixed(2)}</Text>
      </Table.Cell>
      <Table.Cell>
        {!readOnly && (
          <IconButton
            variant="ghost"
            colorPalette="red"
            size="xs"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            aria-label="Eliminar"
          >
            <Icon icon={TrashIcon} />
          </IconButton>
        )}
      </Table.Cell>
    </Table.Row>
  );
}
