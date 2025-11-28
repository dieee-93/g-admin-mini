/**
 * Ejemplo de Uso: Alert Components Wrappers
 *
 * Este archivo muestra cómo reemplazar componentes genéricos de Chakra
 * con wrappers específicos para mejorar la trazabilidad en React Scan
 */

import { memo } from 'react';
import {
  AlertContainer,
  AlertStack,
  AlertActions,
  AlertHeader,
  AlertButton,
  AlertBadge,
  AlertListItem,
  AlertMetadata,
  Icon,
  Text,
  AlertComponents
} from '@/shared/ui';
import { ExclamationTriangleIcon, XMarkIcon } from '@heroicons/react/24/outline';

// ============================================
// ANTES: Componentes Genéricos
// ============================================

export const MaterialsAlertsOld = memo(function MaterialsAlertsOld({ alerts }) {
  return (
    // ❌ React Scan muestra: "Box"
    <Box>
      {/* ❌ React Scan muestra: "Stack" */}
      <Stack direction="column" gap="sm">
        {alerts.map((alert) => (
          // ❌ React Scan muestra: "Box"
          <Box key={alert.id} p="3" borderRadius="md" borderWidth="1px">
            {/* ❌ React Scan muestra: "Stack" */}
            <Stack direction="row" justify="space-between">
              {/* ❌ React Scan muestra: "Stack" */}
              <Stack direction="row" gap="sm">
                <Icon icon={ExclamationTriangleIcon} />
                <Text>{alert.title}</Text>
                {/* ❌ React Scan muestra: "Badge" */}
                <Badge colorPalette="red">{alert.severity}</Badge>
              </Stack>

              {/* ❌ React Scan muestra: "Stack" */}
              <Stack direction="row" gap="xs">
                {/* ❌ React Scan muestra: "Button" */}
                <Button size="sm" onClick={() => handleAcknowledge(alert.id)}>
                  Reconocer
                </Button>
                {/* ❌ React Scan muestra: "Button" */}
                <Button size="sm" variant="ghost" onClick={() => handleDismiss(alert.id)}>
                  <Icon icon={XMarkIcon} />
                </Button>
              </Stack>
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  );
});

// ============================================
// DESPUÉS: Componentes con Nombres Descriptivos
// ============================================

export const MaterialsAlertsNew = memo(function MaterialsAlertsNew({ alerts }) {
  return (
    // ✅ React Scan muestra: "AlertContainer"
    <AlertContainer>
      {/* ✅ React Scan muestra: "AlertStack" */}
      <AlertStack gap="sm">
        {alerts.map((alert) => (
          // ✅ React Scan muestra: "AlertListItem"
          <AlertListItem key={alert.id}>
            {/* ✅ React Scan muestra: "AlertHeader" */}
            <AlertHeader justify="space-between">
              {/* ✅ React Scan muestra: "AlertContentBox" (Box horizontal interno) */}
              <AlertComponents.ContentBox>
                <Icon icon={ExclamationTriangleIcon} />
                <Text>{alert.title}</Text>
                {/* ✅ React Scan muestra: "AlertBadge" */}
                <AlertBadge type="severity" colorPalette="red">
                  {alert.severity}
                </AlertBadge>
              </AlertComponents.ContentBox>

              {/* ✅ React Scan muestra: "AlertActions" */}
              <AlertActions gap="xs">
                {/* ✅ React Scan muestra: "AlertButton" */}
                <AlertButton
                  action="acknowledge"
                  size="sm"
                  onClick={() => handleAcknowledge(alert.id)}
                >
                  Reconocer
                </AlertButton>
                {/* ✅ React Scan muestra: "AlertButton" */}
                <AlertButton
                  action="dismiss"
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDismiss(alert.id)}
                >
                  <Icon icon={XMarkIcon} />
                </AlertButton>
              </AlertActions>
            </AlertHeader>
          </AlertListItem>
        ))}
      </AlertStack>
    </AlertContainer>
  );
});

// ============================================
// COMPARACIÓN EN REACT SCAN
// ============================================

/**
 * ANTES:
 * - Box (rendered 739 times)
 * - Stack (rendered 510 times)
 * - Button (rendered 693 times)
 * - Badge (rendered 142 times)
 *
 * ❌ Imposible saber qué componentes específicos están causando re-renders
 *
 * DESPUÉS:
 * - AlertContainer (rendered 5 times)
 * - AlertStack (rendered 5 times)
 * - AlertListItem (rendered 15 times)
 * - AlertHeader (rendered 15 times)
 * - AlertContent (rendered 15 times)
 * - AlertActions (rendered 15 times)
 * - AlertButton (rendered 30 times)
 * - AlertBadge (rendered 15 times)
 *
 * ✅ Puedes identificar exactamente qué parte del sistema de alertas está re-renderizando
 */

// ============================================
// USO CON ALERTCOMPONENTS NAMESPACE
// ============================================

export const MaterialsAlertsWithNamespace = memo(function MaterialsAlertsWithNamespace({ alerts }) {
  const { Container, Stack, ListItem, Header, ContentBox, Actions, Button, Badge } = AlertComponents;

  return (
    <Container>
      <Stack gap="sm">
        {alerts.map((alert) => (
          <ListItem key={alert.id}>
            <Header justify="space-between">
              <ContentBox>
                <Icon icon={ExclamationTriangleIcon} />
                <Text>{alert.title}</Text>
                <Badge type="severity" colorPalette="red">
                  {alert.severity}
                </Badge>
              </ContentBox>

              <Actions gap="xs">
                <Button action="acknowledge" size="sm" onClick={() => handleAcknowledge(alert.id)}>
                  Reconocer
                </Button>
                <Button action="dismiss" size="sm" variant="ghost" onClick={() => handleDismiss(alert.id)}>
                  <Icon icon={XMarkIcon} />
                </Button>
              </Actions>
            </Header>
          </ListItem>
        ))}
      </Stack>
    </Container>
  );
});

// ============================================
// BENEFICIOS
// ============================================

/**
 * 1. MEJOR DEBUGGING
 *    - Identificas exactamente qué parte del sistema está re-renderizando
 *    - React Scan muestra nombres descriptivos como "AlertButton" vs "Button"
 *
 * 2. MEJOR PERFORMANCE PROFILING
 *    - Puedes ver si AlertActions re-renderiza más que AlertContent
 *    - Identificas bottlenecks específicos del sistema de alertas
 *
 * 3. MEJOR MANTENIBILIDAD
 *    - Código auto-documentado: AlertButton vs Button genérico
 *    - Búsqueda más fácil en el codebase
 *
 * 4. OVERHEAD MÍNIMO
 *    - Los wrappers solo agregan un componente memo adicional
 *    - El overhead es insignificante comparado con los beneficios
 */
