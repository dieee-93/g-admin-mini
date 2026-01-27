// ============================================
// RISK FACTORS PANEL
// ============================================
// Panel displaying supplier risk factors with mitigation actions

import { VStack, Text, Alert, HStack, Badge, Collapsible, Stack } from '@/shared/ui';
import type { SupplierAnalysis, SupplierRiskFactor } from '@/modules/materials/services';
import { useMemo } from 'react';
import {
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';

interface RiskFactorsPanelProps {
  suppliers: SupplierAnalysis[];
}

/**
 * Risk Factors Panel Component
 * Shows risk factors across all suppliers with mitigation actions
 */
export function RiskFactorsPanel({ suppliers }: RiskFactorsPanelProps) {
  // Aggregate all risk factors from all suppliers
  const { highRiskSuppliers, allRiskFactors } = useMemo(() => {
    const highRisk = suppliers.filter(
      s => s.riskLevel === 'high' || s.riskLevel === 'critical'
    );

    const risks: Array<SupplierRiskFactor & { supplierName: string; supplierId: string }> = [];

    suppliers.forEach(supplier => {
      supplier.riskFactors.forEach(risk => {
        risks.push({
          ...risk,
          supplierName: supplier.name,
          supplierId: supplier.id
        });
      });
    });

    // Sort by severity and impact
    risks.sort((a, b) => {
      const severityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
      const severityDiff =
        severityOrder[b.severity as keyof typeof severityOrder] -
        severityOrder[a.severity as keyof typeof severityOrder];

      if (severityDiff !== 0) return severityDiff;
      return b.impact - a.impact;
    });

    return {
      highRiskSuppliers: highRisk,
      allRiskFactors: risks
    };
  }, [suppliers]);

  if (highRiskSuppliers.length === 0 && allRiskFactors.length === 0) {
    return (
      <Alert status="success" title="✅ No se identificaron riesgos significativos">
        Todos los proveedores están operando dentro de parámetros aceptables.
      </Alert>
    );
  }

  return (
    <VStack align="stretch" gap="4">
      {/* High Risk Suppliers Summary */}
      {highRiskSuppliers.length > 0 && (
        <Alert.Root status="warning">
          <Alert.Indicator>
            <ShieldExclamationIcon width={20} height={20} />
          </Alert.Indicator>
          <Alert.Content>
            <Alert.Title>
              {highRiskSuppliers.length} proveedor(es) de alto riesgo identificados
            </Alert.Title>
            <Alert.Description>
              {highRiskSuppliers.map(s => s.name).join(', ')}
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      )}

      <Text fontSize="xl" fontWeight="bold">
        Factores de Riesgo Identificados
      </Text>

      {/* Risk Factors List */}
      <Stack direction="column" gap="3">
        {allRiskFactors.map((risk, index) => (
          <Alert.Root
            key={`${risk.supplierId}-${risk.id}-${index}`}
            status={getRiskSeverityStatus(risk.severity)}
          >
            <VStack align="stretch" width="full" gap="2">
              <HStack justify="space-between" width="full">
                <VStack align="start" gap="1">
                  <HStack>
                    <Text fontWeight="bold">{risk.title}</Text>
                    <Badge size="sm" colorPalette={getRiskCategoryColor(risk.category)}>
                      {getRiskCategoryLabel(risk.category)}
                    </Badge>
                  </HStack>
                  <Text fontSize="sm" color="fg.muted">
                    Proveedor: {risk.supplierName}
                  </Text>
                  <Text fontSize="sm">{risk.description}</Text>
                </VStack>

                <VStack align="end" gap="1">
                  <Badge colorPalette={getRiskSeverityColor(risk.severity)}>
                    {getRiskSeverityLabel(risk.severity)}
                  </Badge>
                  <Text fontSize="xs" color="fg.muted">
                    Impacto: {risk.impact}/100
                  </Text>
                  <Text fontSize="xs" color="fg.muted">
                    Probabilidad: {risk.likelihood}/100
                  </Text>
                </VStack>
              </HStack>

              {/* Mitigation Actions (Collapsible) */}
              {risk.mitigationActions.length > 0 && (
                <Collapsible.Root>
                  <Collapsible.Trigger>
                    <Text fontSize="sm" fontWeight="semibold" color="blue.500">
                      Ver acciones de mitigación ({risk.mitigationActions.length})
                    </Text>
                  </Collapsible.Trigger>
                  <Collapsible.Content>
                    <VStack align="start" gap="1" mt="2" pl="4">
                      {risk.mitigationActions.map((action, idx) => (
                        <HStack key={idx} gap="2">
                          <Text fontSize="xs">•</Text>
                          <Text fontSize="sm">{action}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  </Collapsible.Content>
                </Collapsible.Root>
              )}
            </VStack>
          </Alert.Root>
        ))}
      </Stack>
    </VStack>
  );
}

/**
 * Get alert status based on risk severity
 */
function getRiskSeverityStatus(
  severity: string
): 'info' | 'warning' | 'error' | 'success' {
  switch (severity) {
    case 'critical':
      return 'error';
    case 'high':
      return 'error';
    case 'medium':
      return 'warning';
    case 'low':
      return 'info';
    default:
      return 'info';
  }
}

/**
 * Get color for risk severity
 */
function getRiskSeverityColor(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'red';
    case 'high':
      return 'orange';
    case 'medium':
      return 'yellow';
    case 'low':
      return 'blue';
    default:
      return 'gray';
  }
}

/**
 * Get label for risk severity
 */
function getRiskSeverityLabel(severity: string): string {
  switch (severity) {
    case 'critical':
      return 'Crítico';
    case 'high':
      return 'Alto';
    case 'medium':
      return 'Medio';
    case 'low':
      return 'Bajo';
    default:
      return severity;
  }
}

/**
 * Get color for risk category
 */
function getRiskCategoryColor(category: string): string {
  switch (category) {
    case 'financial':
      return 'red';
    case 'operational':
      return 'orange';
    case 'strategic':
      return 'purple';
    case 'compliance':
      return 'blue';
    default:
      return 'gray';
  }
}

/**
 * Get label for risk category
 */
function getRiskCategoryLabel(category: string): string {
  switch (category) {
    case 'financial':
      return 'Financiero';
    case 'operational':
      return 'Operacional';
    case 'strategic':
      return 'Estratégico';
    case 'compliance':
      return 'Cumplimiento';
    default:
      return category;
  }
}
