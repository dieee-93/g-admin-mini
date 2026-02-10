/**
 * OverheadConfigSection - Global overhead configuration in Settings
 *
 * Allows admin to configure:
 * - Monthly overhead expenses (rent, utilities, supervision, etc.)
 * - Allocation base (labor hours, machine hours, direct cost %)
 * - Automatic rate calculation
 * - Integration with other modules (Cash, Staff, Suppliers) - Phase 2
 *
 * Industry Standard: Based on SAP, Odoo, NetSuite approaches
 * - Overhead Rate = Total Monthly Overhead / Total Labor Hours
 * - Applied consistently across all products (GAAP compliant)
 */

import { Box, Stack, Typography, InputField, Button, SelectField, Flex } from '@/shared/ui';
import { useState, useEffect, useMemo, memo } from 'react';
import { DecimalUtils } from '@/lib/decimal';

interface OverheadExpenses {
  rent: number;
  electricity_general: number;
  gas_general: number;
  water: number;
  internet: number;
  supervision_salaries: number;
  admin_salaries: number;
  insurance: number;
  cleaning: number;
  security: number;
  general_maintenance: number;
  other: number;
}

type AllocationBase = 'per_labor_hour' | 'per_machine_hour' | 'per_direct_cost';

export const OverheadConfigSection = memo(function OverheadConfigSection() {
  const [expenses, setExpenses] = useState<OverheadExpenses>({
    rent: 0,
    electricity_general: 0,
    gas_general: 0,
    water: 0,
    internet: 0,
    supervision_salaries: 0,
    admin_salaries: 0,
    insurance: 0,
    cleaning: 0,
    security: 0,
    general_maintenance: 0,
    other: 0
  });

  const [allocationBase, setAllocationBase] = useState<AllocationBase>('per_labor_hour');
  const [totalLaborHours, setTotalLaborHours] = useState(0);
  const [totalMachineHours, setTotalMachineHours] = useState(0);
  const [totalDirectCost, setTotalDirectCost] = useState(0);

  // Calculate total overhead
  const totalOverhead = useMemo(() => {
    return Object.values(expenses).reduce((sum, val) => sum + val, 0);
  }, [expenses]);

  // Calculate rate based on allocation base
  const overheadRate = useMemo(() => {
    if (allocationBase === 'per_labor_hour' && totalLaborHours > 0) {
      return totalOverhead / totalLaborHours;
    }
    if (allocationBase === 'per_machine_hour' && totalMachineHours > 0) {
      return totalOverhead / totalMachineHours;
    }
    if (allocationBase === 'per_direct_cost' && totalDirectCost > 0) {
      return (totalOverhead / totalDirectCost) * 100; // Percentage
    }
    return 0;
  }, [allocationBase, totalOverhead, totalLaborHours, totalMachineHours, totalDirectCost]);

  // TODO Phase 2: Auto-populate from other modules
  useEffect(() => {
    // TODO: Fetch from Cash/Expenses module
    // TODO: Fetch from Staff module (supervision salaries)
    // TODO: Fetch from Suppliers module (utilities bills)
    // TODO: Calculate total labor hours from production records
  }, []);

  const handleExpenseChange = (field: keyof OverheadExpenses, value: number) => {
    setExpenses(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // TODO: Save to settings store/database
    console.log('Saving overhead config:', {
      expenses,
      allocationBase,
      totalOverhead,
      overheadRate
    });
  };

  return (
    <Box maxW="1200px" mx="auto" p="6">
      <Stack gap="6">
        {/* Header */}
        <Stack gap="2">
          <Typography fontSize="2xl" fontWeight="bold">
            Configuración de Overhead
          </Typography>
          <Typography fontSize="sm" color="fg.muted">
            Configure los costos indirectos de manufactura para cálculo automático en productos elaborados
          </Typography>
        </Stack>

        {/* Warning about duplication */}
        <Box p="4" bg="orange.50" borderRadius="md" borderWidth="2px" borderColor="orange.300">
          <Typography fontSize="sm" fontWeight="700" color="orange.700" mb="2">
            ⚠️ IMPORTANTE: Evitar Duplicación de Costos
          </Typography>
          <Typography fontSize="xs" color="orange.700">
            NO incluir costos ya calculados en equipment hourly rates:
          </Typography>
          <Stack gap="1" mt="2" pl="4">
            <Typography fontSize="xs" color="orange.600">
              • ❌ Electricidad de equipos productivos (ya en hourly rate)
            </Typography>
            <Typography fontSize="xs" color="orange.600">
              • ❌ Gas de equipos productivos (ya en hourly rate)
            </Typography>
            <Typography fontSize="xs" color="orange.600">
              • ❌ Mantenimiento de equipos (ya en hourly rate)
            </Typography>
            <Typography fontSize="xs" color="orange.600">
              • ❌ Depreciación de equipos (ya en hourly rate)
            </Typography>
          </Stack>
          <Typography fontSize="xs" color="orange.700" mt="2">
            ✅ Solo incluir costos GENERALES no atribuibles a equipos específicos
          </Typography>
        </Box>

        {/* Overhead Expenses */}
        <Box p="5" bg="bg.panel" borderRadius="lg" borderWidth="2px">
          <Typography fontSize="lg" fontWeight="700" mb="4">
            Gastos de Overhead Mensual
          </Typography>

          <Stack gap="3">
            <InputField
              label="Alquiler/Hipoteca"
              type="number"
              step="0.01"
              value={expenses.rent || ''}
              onChange={(e) => handleExpenseChange('rent', parseFloat(e.target.value) || 0)}
            />

            <InputField
              label="Electricidad GENERAL (no equipos)"
              type="number"
              step="0.01"
              value={expenses.electricity_general || ''}
              onChange={(e) => handleExpenseChange('electricity_general', parseFloat(e.target.value) || 0)}
              helperText="Luces, AC, oficinas - NO equipos de producción"
            />

            <InputField
              label="Gas GENERAL (no equipos)"
              type="number"
              step="0.01"
              value={expenses.gas_general || ''}
              onChange={(e) => handleExpenseChange('gas_general', parseFloat(e.target.value) || 0)}
              helperText="Calefacción - NO equipos de producción"
            />

            <InputField
              label="Agua"
              type="number"
              step="0.01"
              value={expenses.water || ''}
              onChange={(e) => handleExpenseChange('water', parseFloat(e.target.value) || 0)}
            />

            <InputField
              label="Internet/Teléfono"
              type="number"
              step="0.01"
              value={expenses.internet || ''}
              onChange={(e) => handleExpenseChange('internet', parseFloat(e.target.value) || 0)}
            />

            <InputField
              label="Supervisión (salarios)"
              type="number"
              step="0.01"
              value={expenses.supervision_salaries || ''}
              onChange={(e) => handleExpenseChange('supervision_salaries', parseFloat(e.target.value) || 0)}
            />

            <InputField
              label="Administración producción"
              type="number"
              step="0.01"
              value={expenses.admin_salaries || ''}
              onChange={(e) => handleExpenseChange('admin_salaries', parseFloat(e.target.value) || 0)}
            />

            <InputField
              label="Seguros planta"
              type="number"
              step="0.01"
              value={expenses.insurance || ''}
              onChange={(e) => handleExpenseChange('insurance', parseFloat(e.target.value) || 0)}
            />

            <InputField
              label="Limpieza"
              type="number"
              step="0.01"
              value={expenses.cleaning || ''}
              onChange={(e) => handleExpenseChange('cleaning', parseFloat(e.target.value) || 0)}
            />

            <InputField
              label="Seguridad"
              type="number"
              step="0.01"
              value={expenses.security || ''}
              onChange={(e) => handleExpenseChange('security', parseFloat(e.target.value) || 0)}
            />

            <InputField
              label="Mantenimiento edificio (NO equipos)"
              type="number"
              step="0.01"
              value={expenses.general_maintenance || ''}
              onChange={(e) => handleExpenseChange('general_maintenance', parseFloat(e.target.value) || 0)}
              helperText="Mantenimiento del edificio - NO de equipos de producción"
            />

            <InputField
              label="Otros"
              type="number"
              step="0.01"
              value={expenses.other || ''}
              onChange={(e) => handleExpenseChange('other', parseFloat(e.target.value) || 0)}
            />
          </Stack>

          {/* Total */}
          <Box mt="4" p="4" bg="blue.100" borderRadius="md">
            <Typography fontSize="lg" fontWeight="800">
              TOTAL OVERHEAD MENSUAL: ${totalOverhead.toFixed(2)}
            </Typography>
          </Box>
        </Box>

        {/* Allocation Method */}
        <Box p="5" bg="bg.panel" borderRadius="lg" borderWidth="2px">
          <Typography fontSize="lg" fontWeight="700" mb="4">
            Método de Asignación
          </Typography>

          <Stack gap="4">
            <Box>
              <Typography fontSize="sm" fontWeight="600" mb="2">
                Base de Cálculo
              </Typography>
              <Stack gap="2">
                <Box
                  p="3"
                  borderRadius="md"
                  borderWidth="2px"
                  borderColor={allocationBase === 'per_labor_hour' ? 'blue.500' : 'border.default'}
                  bg={allocationBase === 'per_labor_hour' ? 'blue.50' : 'bg.subtle'}
                  cursor="pointer"
                  onClick={() => setAllocationBase('per_labor_hour')}
                >
                  <Flex align="center" gap="2">
                    <Box
                      w="16px"
                      h="16px"
                      borderRadius="full"
                      borderWidth="2px"
                      borderColor={allocationBase === 'per_labor_hour' ? 'blue.500' : 'border.default'}
                      bg={allocationBase === 'per_labor_hour' ? 'blue.500' : 'transparent'}
                    />
                    <Stack gap="0">
                      <Typography fontSize="sm" fontWeight="600">
                        Por Labor Hour (más común) ⭐
                      </Typography>
                      <Typography fontSize="xs" color="fg.muted">
                        Industry standard para manufactura
                      </Typography>
                    </Stack>
                  </Flex>
                </Box>

                <Box
                  p="3"
                  borderRadius="md"
                  borderWidth="2px"
                  borderColor={allocationBase === 'per_machine_hour' ? 'blue.500' : 'border.default'}
                  bg={allocationBase === 'per_machine_hour' ? 'blue.50' : 'bg.subtle'}
                  cursor="pointer"
                  onClick={() => setAllocationBase('per_machine_hour')}
                >
                  <Flex align="center" gap="2">
                    <Box
                      w="16px"
                      h="16px"
                      borderRadius="full"
                      borderWidth="2px"
                      borderColor={allocationBase === 'per_machine_hour' ? 'blue.500' : 'border.default'}
                      bg={allocationBase === 'per_machine_hour' ? 'blue.500' : 'transparent'}
                    />
                    <Stack gap="0">
                      <Typography fontSize="sm" fontWeight="600">
                        Por Machine Hour
                      </Typography>
                      <Typography fontSize="xs" color="fg.muted">
                        Para procesos altamente automatizados
                      </Typography>
                    </Stack>
                  </Flex>
                </Box>

                <Box
                  p="3"
                  borderRadius="md"
                  borderWidth="2px"
                  borderColor={allocationBase === 'per_direct_cost' ? 'blue.500' : 'border.default'}
                  bg={allocationBase === 'per_direct_cost' ? 'blue.50' : 'bg.subtle'}
                  cursor="pointer"
                  onClick={() => setAllocationBase('per_direct_cost')}
                >
                  <Flex align="center" gap="2">
                    <Box
                      w="16px"
                      h="16px"
                      borderRadius="full"
                      borderWidth="2px"
                      borderColor={allocationBase === 'per_direct_cost' ? 'blue.500' : 'border.default'}
                      bg={allocationBase === 'per_direct_cost' ? 'blue.500' : 'transparent'}
                    />
                    <Stack gap="0">
                      <Typography fontSize="sm" fontWeight="600">
                        Por Direct Cost Total (%)
                      </Typography>
                      <Typography fontSize="xs" color="fg.muted">
                        Más simple, menos preciso
                      </Typography>
                    </Stack>
                  </Flex>
                </Box>
              </Stack>
            </Box>

            {allocationBase === 'per_labor_hour' && (
              <InputField
                label="Total Labor Hours (este mes)"
                type="number"
                step="1"
                value={totalLaborHours || ''}
                onChange={(e) => setTotalLaborHours(parseFloat(e.target.value) || 0)}
                helperText="Horas totales de producción del mes (TODO: auto-calcular desde registros)"
              />
            )}

            {allocationBase === 'per_machine_hour' && (
              <InputField
                label="Total Machine Hours (este mes)"
                type="number"
                step="1"
                value={totalMachineHours || ''}
                onChange={(e) => setTotalMachineHours(parseFloat(e.target.value) || 0)}
                helperText="Horas totales de uso de máquinas del mes (TODO: auto-calcular)"
              />
            )}

            {allocationBase === 'per_direct_cost' && (
              <InputField
                label="Total Direct Cost (este mes)"
                type="number"
                step="0.01"
                value={totalDirectCost || ''}
                onChange={(e) => setTotalDirectCost(parseFloat(e.target.value) || 0)}
                helperText="Costo directo total del mes (TODO: auto-calcular)"
              />
            )}

            {/* Calculated Rate */}
            <Box mt="4" p="4" bg="green.100" borderRadius="md">
              <Typography fontSize="xl" fontWeight="800" color="green.700">
                OVERHEAD RATE CALCULADO:
              </Typography>
              <Typography fontSize="2xl" fontWeight="900" color="green.800" mt="1">
                {allocationBase === 'per_direct_cost'
                  ? `${overheadRate.toFixed(2)}%`
                  : `$${overheadRate.toFixed(2)}/${allocationBase === 'per_labor_hour' ? 'labor hour' : 'machine hour'}`
                }
              </Typography>
              <Typography fontSize="xs" color="green.700" mt="2">
                Este rate se aplicará automáticamente a nuevos materiales elaborados
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Actions */}
        <Stack direction="row" gap="3" justify="flex-end">
          <Button variant="outline">Cancelar</Button>
          <Button colorPalette="blue" onClick={handleSave}>
            Guardar Configuración
          </Button>
        </Stack>

        {/* Auto-integration buttons (Phase 2) */}
        <Box p="4" bg="gray.50" borderRadius="md">
          <Typography fontSize="sm" fontWeight="700" mb="3">
            Integración Automática (Phase 2 - Futuro)
          </Typography>
          <Stack gap="2">
            <Button size="sm" variant="ghost" disabled>
              📊 Actualizar desde Módulo de Cash/Expenses
            </Button>
            <Button size="sm" variant="ghost" disabled>
              👥 Actualizar desde Módulo de Staff
            </Button>
            <Button size="sm" variant="ghost" disabled>
              📄 Actualizar desde Facturas de Servicios
            </Button>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
});
