/**
 * STAFF SELECTOR v1.0 - Reusable Staff Assignment Component
 * 
 * A compact, injectable component for assigning staff to tasks across modules.
 * Designed for products, production orders, recipes, services, and more.
 * 
 * FEATURES:
 * - Compact UI for forms (mobile-friendly)
 * - Two-selector pattern: Role first, TeamMember optional
 * - Labor cost calculation via staff module API
 * - Cross-module data via ModuleRegistry (single source of truth)
 * 
 * ARCHITECTURE:
 * - Uses staff module exports for data (no duplicate API calls)
 * - Follows cross-module patterns from CROSS_MODULE_DATA_ARCHITECTURE.md
 * - Respects DecimalUtils for financial calculations
 * 
 * @example
 * ```tsx
 * <StaffSelector
 *   value={staffAssignments}
 *   onChange={setStaffAssignments}
 *   variant="compact"
 *   showCost={true}
 *   onCostChange={(cost) => setTotalLaborCost(cost)}
 * />
 * ```
 */

import { useState, useCallback, useMemo, useEffect, memo } from 'react';
import {
  Stack,
  Box,
  Text,
  Badge,
  Button,
  IconButton,
  Icon,
  SelectField,
  NumberField,
  Spinner,
  HStack
} from '@/shared/ui';
import {
  PlusIcon,
  TrashIcon,
  UserIcon,
  UsersIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { ModuleRegistry } from '@/lib/modules';
import { DecimalUtils } from '@/lib/decimal';
import type {
  StaffSelectorProps,
  StaffAssignment,
  StaffRoleOption,
  EmployeeOption,
  QuickAddState
} from './types';
import type { StaffAPI } from '@/modules/team/manifest';

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate labor cost for a single assignment
 * Uses DecimalUtils for financial precision
 */
function calculateAssignmentCost(
  assignment: StaffAssignment,
  role?: StaffRoleOption
): { hours: number; cost: number; loadedHourlyCost: number } {
  const durationMinutes = assignment.duration_minutes || 0;
  const count = assignment.count || 1;
  
  // Calculate hours: duration_minutes / 60 * count
  const hours = DecimalUtils.multiply(
    DecimalUtils.divide(durationMinutes.toString(), '60', 'financial'),
    count.toString(),
    'financial'
  ).toNumber();
  
  // Rate hierarchy: assignment override > role default > 0
  const baseRate = assignment.hourly_rate ?? role?.default_hourly_rate ?? 0;
  
  // Loaded factor hierarchy: assignment override > role > 1.0
  const loadedFactor = assignment.loaded_factor ?? role?.loaded_factor ?? 1.0;
  
  // Calculate loaded hourly cost: baseRate * loadedFactor
  const loadedHourlyCost = DecimalUtils.multiply(
    baseRate.toString(),
    loadedFactor.toString(),
    'financial'
  ).toNumber();
  
  // Calculate total cost: hours * loadedHourlyCost
  const cost = DecimalUtils.multiply(
    hours.toString(),
    loadedHourlyCost.toString(),
    'financial'
  ).toNumber();
  
  return { hours, cost, loadedHourlyCost };
}

/**
 * Format currency for display
 */
function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Compact assignment row display
 */
const AssignmentRow = memo(function AssignmentRow({
  assignment,
  roleOptions,
  showCost,
  onRemove,
  readOnly
}: {
  assignment: StaffAssignment;
  roleOptions: StaffRoleOption[];
  showCost: boolean;
  onRemove: () => void;
  readOnly: boolean;
}) {
  const role = roleOptions.find(r => r.id === assignment.role_id);
  const { cost, loadedHourlyCost } = calculateAssignmentCost(assignment, role);
  
  return (
    <HStack
      gap="2"
      p="2"
      bg="bg.subtle"
      borderRadius="md"
      justify="space-between"
      align="center"
    >
      {/* Role and TeamMember Info */}
      <Stack gap="0" flex="1" minW="0">
        <HStack gap="1" align="center">
          <Icon icon={UsersIcon} boxSize="3" color="fg.muted" />
          <Text fontSize="sm" fontWeight="medium" lineClamp={1}>
            {assignment.role_name || role?.name || 'Rol'}
          </Text>
          {role?.department && (
            <Badge size="sm" variant="subtle" colorPalette="gray">
              {role.department}
            </Badge>
          )}
        </HStack>
        
        {assignment.employee_name && (
          <HStack gap="1" align="center">
            <Icon icon={UserIcon} boxSize="3" color="fg.muted" />
            <Text fontSize="xs" color="fg.muted" lineClamp={1}>
              {assignment.employee_name}
            </Text>
          </HStack>
        )}
      </Stack>
      
      {/* Count and Duration */}
      <HStack gap="2" flexShrink={0}>
        <Badge size="sm" variant="outline" colorPalette="blue">
          {assignment.count || 1} pers
        </Badge>
        <Badge size="sm" variant="outline" colorPalette="gray">
          <Icon icon={ClockIcon} boxSize="3" />
          {assignment.duration_minutes}m
        </Badge>
      </HStack>
      
      {/* Cost Badge */}
      {showCost && (
        <Box flexShrink={0}>
          <Badge
            size="sm"
            variant="solid"
            colorPalette="green"
          >
            {formatCurrency(cost)}
          </Badge>
        </Box>
      )}
      
      {/* Remove Button */}
      {!readOnly && (
        <IconButton
          variant="ghost"
          colorPalette="red"
          size="xs"
          onClick={onRemove}
          aria-label="Eliminar asignacion"
        >
          <Icon icon={TrashIcon} />
        </IconButton>
      )}
    </HStack>
  );
});

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const StaffSelector = memo(function StaffSelector({
  value = [],
  onChange,
  variant = 'compact',
  placeholder = 'Seleccionar rol...',
  disabled = false,
  readOnly = false,
  showCost = true,
  showEmployeeSelector = true,
  showDuration = true,
  showCount = true,
  defaultDuration = 30,
  maxAssignments,
  filterByDepartment,
  onCostChange
}: StaffSelectorProps) {
  // ============================================================================
  // CROSS-MODULE DATA FETCHING
  // Following CROSS_MODULE_DATA_ARCHITECTURE.md patterns
  // ============================================================================
  
  const registry = ModuleRegistry.getInstance();
  const staffModule = registry.getExports<StaffAPI>('staff');
  
  // Get StaffRoles hook from staff module
  const useStaffRoles = staffModule?.hooks?.useStaffRoles;
  const rolesHook = useStaffRoles ? useStaffRoles() : null;
  const allRoles = (rolesHook?.items || []) as StaffRoleOption[];
  const rolesLoading = rolesHook?.loading || false;
  
  // Get Employees hook from staff module
  const useEmployeesList = staffModule?.hooks?.useEmployeesList;
  const employeesHook = useEmployeesList ? useEmployeesList() : null;
  const teamMembers = (employeesHook?.items || []) as EmployeeOption[];
  const employeesLoading = employeesHook?.loading || false;
  
  // Filter and prepare role options
  const roleOptions: StaffRoleOption[] = useMemo(() => {
    let filtered = allRoles.filter(r => r.is_active !== false);
    
    if (filterByDepartment) {
      filtered = filtered.filter(r => r.department === filterByDepartment);
    }
    
    // Calculate loaded_hourly_cost for each role
    return filtered.map(r => ({
      ...r,
      loaded_hourly_cost: DecimalUtils.multiply(
        (r.default_hourly_rate ?? 0).toString(),
        (r.loaded_factor ?? 1).toString(),
        'financial'
      ).toNumber()
    }));
  }, [allRoles, filterByDepartment]);
  
  // ============================================================================
  // QUICK ADD STATE
  // ============================================================================
  
  const [quickAdd, setQuickAdd] = useState<QuickAddState>({
    roleId: '',
    employeeId: '',
    duration: defaultDuration,
    count: 1
  });
  
  // Employees filtered by selected role
  const filteredEmployees = useMemo(() => {
    if (!quickAdd.roleId) return [];
    return teamMembers.filter(
      e => e.staff_role_id === quickAdd.roleId && e.is_active !== false
    );
  }, [quickAdd.roleId, teamMembers]);
  
  // Reset teamMember when role changes
  useEffect(() => {
    setQuickAdd(prev => ({ ...prev, employeeId: '' }));
  }, [quickAdd.roleId]);
  
  // ============================================================================
  // CALCULATED VALUES
  // ============================================================================
  
  // Total labor cost
  const totalCost = useMemo(() => {
    return value.reduce((sum, assignment) => {
      const role = roleOptions.find(r => r.id === assignment.role_id);
      const { cost } = calculateAssignmentCost(assignment, role);
      return DecimalUtils.add(sum.toString(), cost.toString(), 'financial').toNumber();
    }, 0);
  }, [value, roleOptions]);
  
  // Notify parent of cost change
  useEffect(() => {
    if (onCostChange) {
      onCostChange(totalCost);
    }
  }, [totalCost, onCostChange]);
  
  // ============================================================================
  // HANDLERS
  // ============================================================================
  
  const handleQuickAdd = useCallback(() => {
    if (!quickAdd.roleId) return;
    
    const role = roleOptions.find(r => r.id === quickAdd.roleId);
    if (!role) return;
    
    const teamMember = quickAdd.employeeId
      ? teamMembers.find(e => e.id === quickAdd.employeeId)
      : null;
    
    const { cost, loadedHourlyCost } = calculateAssignmentCost(
      {
        id: '',
        role_id: quickAdd.roleId,
        duration_minutes: quickAdd.duration,
        count: quickAdd.count,
        hourly_rate: teamMember?.hourly_rate ?? role.default_hourly_rate ?? undefined
      },
      role
    );
    
    const newAssignment: StaffAssignment = {
      id: crypto.randomUUID(),
      role_id: quickAdd.roleId,
      role_name: role.name,
      employee_id: quickAdd.employeeId || null,
      employee_name: teamMember
        ? `${teamMember.first_name} ${teamMember.last_name}`
        : undefined,
      duration_minutes: quickAdd.duration,
      count: quickAdd.count,
      hourly_rate: teamMember?.hourly_rate ?? role.default_hourly_rate ?? undefined,
      loaded_factor: role.loaded_factor,
      loaded_hourly_cost: loadedHourlyCost,
      total_cost: cost
    };
    
    onChange([...value, newAssignment]);
    
    // Reset quick add
    setQuickAdd({
      roleId: '',
      employeeId: '',
      duration: defaultDuration,
      count: 1
    });
  }, [quickAdd, roleOptions, teamMembers, value, onChange, defaultDuration]);
  
  const handleRemove = useCallback((id: string) => {
    onChange(value.filter(a => a.id !== id));
  }, [value, onChange]);
  
  // ============================================================================
  // SELECT OPTIONS
  // ============================================================================
  
  const roleSelectOptions = useMemo(() => {
    return roleOptions.map(r => ({
      value: r.id,
      label: `${r.name}${r.department ? ` (${r.department})` : ''} - ${formatCurrency(r.loaded_hourly_cost)}/h`
    }));
  }, [roleOptions]);
  
  const employeeSelectOptions = useMemo(() => {
    return filteredEmployees.map(e => ({
      value: e.id,
      label: `${e.first_name} ${e.last_name}${e.hourly_rate ? ` ($${e.hourly_rate}/h)` : ''}`
    }));
  }, [filteredEmployees]);
  
  // ============================================================================
  // CHECK LIMITS
  // ============================================================================
  
  const canAddMore = !maxAssignments || value.length < maxAssignments;
  
  // ============================================================================
  // RENDER
  // ============================================================================
  
  const isLoading = rolesLoading || employeesLoading;
  
  return (
    <Stack gap="3" w="full">
      {/* Current Assignments */}
      {value.length > 0 && (
        <Stack gap="2">
          {value.map(assignment => (
            <AssignmentRow
              key={assignment.id}
              assignment={assignment}
              roleOptions={roleOptions}
              showCost={showCost}
              onRemove={() => handleRemove(assignment.id)}
              readOnly={readOnly}
            />
          ))}
          
          {/* Total Cost */}
          {showCost && (
            <HStack justify="end" pt="1">
              <Text fontSize="xs" color="fg.muted">
                Total Labor:
              </Text>
              <Badge colorPalette="blue" variant="solid" size="sm">
                {formatCurrency(totalCost)}
              </Badge>
            </HStack>
          )}
        </Stack>
      )}
      
      {/* Quick Add Form */}
      {!readOnly && canAddMore && (
        <Box
          p="3"
          borderWidth="1px"
          borderRadius="md"
          borderColor="border.subtle"
          bg="bg.subtle"
        >
          {isLoading ? (
            <HStack justify="center" py="2">
              <Spinner size="sm" />
              <Text fontSize="sm" color="fg.muted">
                Cargando roles...
              </Text>
            </HStack>
          ) : (
            <Stack gap="2">
              {/* Row 1: Role Selector */}
              <SelectField
                placeholder={rolesLoading ? 'Cargando...' : placeholder}
                value={quickAdd.roleId ? [quickAdd.roleId] : []}
                onValueChange={(details) =>
                  setQuickAdd(prev => ({ ...prev, roleId: details.value[0] || '' }))
                }
                disabled={disabled || rolesLoading}
                options={roleSelectOptions}
                size="sm"
              />
              
              {/* Row 2: TeamMember (optional) + Count + Duration */}
              {quickAdd.roleId && (
                <HStack gap="2" flexWrap="wrap">
                  {/* TeamMember Selector */}
                  {showEmployeeSelector && (
                    <Box flex="1" minW="120px">
                      <SelectField
                        placeholder={
                          filteredEmployees.length === 0
                            ? 'Sin empleados'
                            : 'Empleado (opc.)'
                        }
                        value={quickAdd.employeeId ? [quickAdd.employeeId] : []}
                        onValueChange={(details) =>
                          setQuickAdd(prev => ({
                            ...prev,
                            employeeId: details.value[0] || ''
                          }))
                        }
                        disabled={disabled || filteredEmployees.length === 0}
                        options={employeeSelectOptions}
                        size="sm"
                      />
                    </Box>
                  )}
                  
                  {/* Count */}
                  {showCount && (
                    <Box w="70px">
                      <NumberField
                        min={1}
                        max={99}
                        placeholder="Cant"
                        value={quickAdd.count}
                        onChange={(val) =>
                          setQuickAdd(prev => ({ ...prev, count: val }))
                        }
                        size="sm"
                      />
                    </Box>
                  )}
                  
                  {/* Duration */}
                  {showDuration && (
                    <Box w="80px">
                      <NumberField
                        min={1}
                        placeholder="Min"
                        value={quickAdd.duration}
                        onChange={(val) =>
                          setQuickAdd(prev => ({ ...prev, duration: val }))
                        }
                        size="sm"
                      />
                    </Box>
                  )}
                  
                  {/* Add Button */}
                  <Button
                    variant="solid"
                    colorPalette="blue"
                    size="sm"
                    onClick={handleQuickAdd}
                    disabled={
                      disabled ||
                      !quickAdd.roleId ||
                      quickAdd.count <= 0 ||
                      quickAdd.duration <= 0
                    }
                  >
                    <Icon icon={PlusIcon} />
                  </Button>
                </HStack>
              )}
            </Stack>
          )}
        </Box>
      )}
      
      {/* Empty State */}
      {value.length === 0 && readOnly && (
        <Text fontSize="sm" color="fg.muted" textAlign="center" py="2">
          Sin personal asignado
        </Text>
      )}
      
      {/* Max reached message */}
      {!readOnly && !canAddMore && (
        <Text fontSize="xs" color="orange.500" textAlign="center">
          Maximo de {maxAssignments} asignaciones alcanzado
        </Text>
      )}
    </Stack>
  );
});

export default StaffSelector;
