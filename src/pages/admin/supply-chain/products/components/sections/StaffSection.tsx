/**
 * STAFF SECTION - Redesigned v2.0
 *
 * Sección condicional para definir personal requerido.
 * Visible para: physical_product, service, rental (si feature 'staff_labor_cost_tracking' activa)
 *
 * ✅ Compact table layout
 * ✅ Quick add row
 * ✅ Real-time cost calculation
 * ✅ ModuleRegistry integration
 *
 * @design PRODUCTS_FORM_SECTIONS_SPEC.md - Section 4
 * @pattern Cross-Module Data Fetching via ModuleRegistry.getExports()
 */

import { useState } from 'react';
import { Stack, Switch, Button, IconButton, Text, Box, HStack, Alert, Icon, SelectField, NumberField, Table } from '@/shared/ui';
import type { FormSectionProps, StaffFields, StaffAllocation, ProductType } from '../../types/productForm';
import { calculateLaborCost } from '../../services/productCostCalculation';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { ModuleRegistry } from '@/lib/modules';
import type { StaffAPI } from '@/modules/staff/manifest';

interface StaffSectionProps extends Omit<FormSectionProps, 'data' | 'onChange'> {
  data: StaffFields;
  productType: ProductType;
  hasBooking?: boolean;  // Si booking está activo, duration es REQUIRED
  onChange: (data: StaffFields) => void;
}

export function StaffSection({
  data,
  productType,
  hasBooking = false,
  onChange,
  errors = [],
  readOnly = false
}: StaffSectionProps) {
  // ✅ CROSS-MODULE DATA FETCHING via ModuleRegistry
  const registry = ModuleRegistry.getInstance();
  const staffModule = registry.getExports<StaffAPI>('staff');
  const useEmployeesList = staffModule?.hooks?.useEmployeesList;
  const employeesHook = useEmployeesList ? useEmployeesList() : null;
  const { items: employees = [], loading: employeesLoading } = employeesHook || { items: [], loading: false };

  // Quick add state
  const [quickAddEmployeeId, setQuickAddEmployeeId] = useState<string>('');
  const [quickAddCount, setQuickAddCount] = useState<number>(1);
  const [quickAddDuration, setQuickAddDuration] = useState<number>(hasBooking ? 60 : 30);

  // Handle field changes
  const handleChange = <K extends keyof StaffFields>(
    field: K,
    value: StaffFields[K]
  ) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  // Handle staff allocation changes
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

  // ✅ Quick add handler
  const handleQuickAdd = () => {
    if (!quickAddEmployeeId) return;

    const employee = employees.find(e => e.id === quickAddEmployeeId);
    if (!employee) return;

    const allocations = [...(data.staff_allocation || [])];
    allocations.push({
      role_id: quickAddEmployeeId,
      role_name: `${employee.first_name} ${employee.last_name}`,
      count: quickAddCount,
      duration_minutes: quickAddDuration,
      hourly_rate: employee.hourly_rate || 0,
      total_hours: quickAddDuration / 60,
      total_cost: ((quickAddDuration / 60) * (employee.hourly_rate || 0) * quickAddCount)
    });

    handleChange('staff_allocation', allocations);

    // Reset quick add
    setQuickAddEmployeeId('');
    setQuickAddCount(1);
    setQuickAddDuration(hasBooking ? 60 : 30);
  };

  // Calculate total labor cost
  const totalLaborCost = data.staff_allocation ? calculateLaborCost(data.staff_allocation) : 0;

  // Prepare employee options
  const employeeOptions = employees
    .filter(e => e.is_active !== false)
    .map(e => ({
      value: e.id,
      label: `${e.first_name} ${e.last_name}${e.position ? ` - ${e.position}` : ''}${e.hourly_rate ? ` ($${e.hourly_rate}/h)` : ''}`
    }));

  // Get helper text based on product type
  const getHelperText = () => {
    switch (productType) {
      case 'physical_product':
        return 'Personal necesario para preparación (ej: chef, cocinero)';
      case 'service':
        return 'Personal que realizará el servicio (ej: masajista, estilista)';
      case 'rental':
        return 'Personal incluido con el alquiler (ej: chofer, operador)';
      default:
        return 'Personal requerido para este producto';
    }
  };

  return (
    <Stack gap="4">
      {/* Toggle principal */}
      <Stack gap="2">
        <Switch
          checked={data.has_staff_requirements || false}
          onCheckedChange={(e) => handleChange('has_staff_requirements', e.checked)}
          disabled={readOnly}
        >
          Este producto requiere personal
        </Switch>
        <Text color="fg.muted" fontSize="sm">
          {getHelperText()}
        </Text>
      </Stack>

      {data.has_staff_requirements && (
        <Stack gap="4">
          {/* ✅ Compact Table Layout */}
          {data.staff_allocation && data.staff_allocation.length > 0 ? (
            <Box borderWidth="1px" borderRadius="md" overflow="hidden">
              <Table.Root size="sm" variant="outline">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeader>Empleado</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="center">Cantidad</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="center">Duración</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="right">Tarifa/h</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="right">Subtotal</Table.ColumnHeader>
                    <Table.ColumnHeader width="50px"></Table.ColumnHeader>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {data.staff_allocation.map((allocation, index) => (
                    <StaffTableRow
                      key={index}
                      allocation={allocation}
                      employees={employees}
                      employeesLoading={employeesLoading}
                      hasBooking={hasBooking}
                      onUpdate={(updated) => updateStaffAllocation(index, updated)}
                      onRemove={() => removeStaffAllocation(index)}
                      readOnly={readOnly}
                    />
                  ))}

                  {/* Total Row */}
                  <Table.Row bg="bg.muted">
                    <Table.Cell colSpan={4} textAlign="right" fontWeight="bold">
                      Total Labor:
                    </Table.Cell>
                    <Table.Cell textAlign="right" fontWeight="bold" fontSize="lg">
                      ${totalLaborCost.toFixed(2)}
                    </Table.Cell>
                    <Table.Cell></Table.Cell>
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
                  Define qué roles se necesitan para este producto usando el formulario de abajo
                </Alert.Description>
              </Alert.Content>
            </Alert.Root>
          )}

          {/* ✅ Quick Add Row */}
          {!readOnly && (
            <Box borderWidth="1px" borderRadius="md" p={3} bg="bg.subtle">
              <Stack gap="3">
                <Text fontWeight="medium" fontSize="sm">
                  Agregar Personal
                </Text>
                <HStack gap="2">
                  <Box flex={2}>
                    <SelectField
                      placeholder={employeesLoading ? "Cargando..." : "Selecciona empleado"}
                      value={quickAddEmployeeId ? [quickAddEmployeeId] : []}
                      onValueChange={(details) => setQuickAddEmployeeId(details.value[0] || '')}
                      disabled={employeesLoading}
                      options={employeeOptions}
                      size="sm"
                    />
                  </Box>
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
                      placeholder="Min."
                      value={quickAddDuration}
                      onChange={(val) => setQuickAddDuration(val)}
                      size="sm"
                    />
                  </Box>
                  <Button
                    variant="solid"
                    colorPalette="blue"
                    size="sm"
                    onClick={handleQuickAdd}
                    disabled={!quickAddEmployeeId || quickAddCount <= 0 || quickAddDuration <= 0}
                  >
                    <Icon icon={PlusIcon} />
                    Agregar
                  </Button>
                </HStack>
              </Stack>
            </Box>
          )}

          {/* Duration requirement info */}
          {hasBooking && (
            <Text fontSize="xs" color="orange.500">
              ⚠️ La duración es requerida para calcular disponibilidad en reservas
            </Text>
          )}

          {/* Cost calculation info */}
          {data.staff_allocation && data.staff_allocation.length > 0 && (
            <Text fontSize="xs" color="fg.muted">
              💡 Los costos se calculan según duración × tarifa por hora × cantidad
            </Text>
          )}
        </Stack>
      )}
    </Stack>
  );
}

/**
 * Staff Table Row - Inline editable row
 */
interface StaffTableRowProps {
  allocation: StaffAllocation;
  employees: any[];
  employeesLoading: boolean;
  hasBooking: boolean;
  onUpdate: (allocation: StaffAllocation) => void;
  onRemove: () => void;
  readOnly?: boolean;
}

function StaffTableRow({
  allocation,
  employees,
  employeesLoading,
  hasBooking,
  onUpdate,
  onRemove,
  readOnly = false
}: StaffTableRowProps) {
  const [isEditing, setIsEditing] = useState(false);
  const selectedEmployee = employees.find(e => e.id === allocation.role_id);

  // Prepare options for editing
  const employeeOptions = employees
    .filter(e => e.is_active !== false)
    .map(e => ({
      value: e.id,
      label: `${e.first_name} ${e.last_name}${e.position ? ` - ${e.position}` : ''}${e.hourly_rate ? ` ($${e.hourly_rate}/h)` : ''}`
    }));

  const hours = allocation.duration_minutes ? (allocation.duration_minutes / 60).toFixed(1) : '0';
  const subtotal = ((allocation.duration_minutes || 0) / 60) * (allocation.hourly_rate || 0) * (allocation.count || 1);

  if (isEditing && !readOnly) {
    return (
      <Table.Row>
        <Table.Cell>
          <SelectField
            value={allocation.role_id ? [allocation.role_id] : []}
            onValueChange={(details) => {
              const newEmployeeId = details.value[0];
              const employee = employees.find(e => e.id === newEmployeeId);
              onUpdate({
                ...allocation,
                role_id: newEmployeeId,
                role_name: employee ? `${employee.first_name} ${employee.last_name}` : '',
                hourly_rate: employee?.hourly_rate || allocation.hourly_rate
              });
            }}
            disabled={employeesLoading}
            options={employeeOptions}
            size="sm"
          />
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
        <Table.Cell textAlign="right">
          <NumberField
            step={0.01}
            min={0}
            value={allocation.hourly_rate || 0}
            onChange={(val) => onUpdate({ ...allocation, hourly_rate: val })}
            size="sm"
          />
        </Table.Cell>
        <Table.Cell textAlign="right">
          <Text fontWeight="medium">${subtotal.toFixed(2)}</Text>
        </Table.Cell>
        <Table.Cell>
          <HStack gap="1">
            <Button size="xs" variant="ghost" onClick={() => setIsEditing(false)}>
              ✓
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
      cursor={readOnly ? 'default' : 'pointer'}
      onClick={() => !readOnly && setIsEditing(true)}
      _hover={readOnly ? {} : { bg: 'bg.subtle' }}
    >
      <Table.Cell>
        <Stack gap="0">
          <Text fontWeight="medium" fontSize="sm">
            {selectedEmployee
              ? `${selectedEmployee.first_name} ${selectedEmployee.last_name}`
              : allocation.role_name || 'Empleado desconocido'}
          </Text>
          <Text fontSize="xs" color="fg.muted">
            {selectedEmployee?.position || 'Sin cargo'}
          </Text>
        </Stack>
      </Table.Cell>
      <Table.Cell textAlign="center">
        <Text fontSize="sm">{allocation.count || 1}</Text>
      </Table.Cell>
      <Table.Cell textAlign="center">
        <Stack gap="0">
          <Text fontSize="sm">{allocation.duration_minutes || 0} min</Text>
          <Text fontSize="xs" color="fg.muted">({hours}h)</Text>
        </Stack>
      </Table.Cell>
      <Table.Cell textAlign="right">
        <Text fontSize="sm">${(allocation.hourly_rate || 0).toFixed(2)}</Text>
      </Table.Cell>
      <Table.Cell textAlign="right">
        <Text fontWeight="medium">${subtotal.toFixed(2)}</Text>
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

