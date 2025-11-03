/**
 * Settings Tab
 *
 * Delivery configuration options:
 * - Auto-assignment preferences
 * - Notification settings
 * - GPS tracking configuration
 * - Default values
 *
 * Phase 1 - Part 3: Delivery Sub-Module (Task 13)
 */

import { useState, useEffect } from 'react';
import {
  Stack,
  Text,
  Alert,
  Box,
  Button,
  Field,
  Switch,
  Input,
  Textarea
} from '@/shared/ui';
import { logger } from '@/lib/logging';

interface SettingsTabProps {
  onRefresh: () => void;
}

interface DeliverySettings {
  // Auto-assignment
  autoAssignEnabled: boolean;
  autoAssignRadius: number;
  autoAssignPriority: 'nearest' | 'rating' | 'workload';

  // Notifications
  notifyDriverOnAssignment: boolean;
  notifyCustomerOnDispatch: boolean;
  notifyCustomerOnArrival: boolean;

  // GPS Tracking
  trackingUpdateInterval: number;
  trackingAccuracyThreshold: number;

  // Defaults
  defaultDeliveryFee: number;
  defaultEstimatedTime: number;
  defaultNotes: string;
}

const DEFAULT_SETTINGS: DeliverySettings = {
  autoAssignEnabled: false,
  autoAssignRadius: 5,
  autoAssignPriority: 'nearest',
  notifyDriverOnAssignment: true,
  notifyCustomerOnDispatch: true,
  notifyCustomerOnArrival: true,
  trackingUpdateInterval: 30,
  trackingAccuracyThreshold: 100,
  defaultDeliveryFee: 0,
  defaultEstimatedTime: 30,
  defaultNotes: ''
};

const STORAGE_KEY = 'delivery_settings';

export default function SettingsTab({ onRefresh }: SettingsTabProps) {
  logger.debug('SettingsTab', 'Rendering');

  const [settings, setSettings] = useState<DeliverySettings>(DEFAULT_SETTINGS);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as DeliverySettings;
        setSettings(parsed);
        logger.info('SettingsTab', 'Settings loaded from localStorage', parsed);
      }
    } catch (error) {
      logger.error('SettingsTab', 'Failed to load settings', { error });
    }
  }, []);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      logger.info('SettingsTab', 'Saving delivery settings', settings);

      // Save to localStorage
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

      logger.info('SettingsTab', 'Settings saved successfully to localStorage');
      onRefresh();
    } catch (error) {
      logger.error('SettingsTab', 'Failed to save settings', { error });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Stack gap="md" p="md">
      <Text fontSize="lg" fontWeight="semibold">
        Configuración de Delivery
      </Text>

      {saveSuccess && (
        <Alert status="success" title="Configuración guardada">
          Los cambios se aplicaron correctamente.
        </Alert>
      )}

      {/* Auto-Assignment Section */}
      <Box p="md" borderWidth="1px" borderRadius="md">
        <Stack gap="md">
          <Text fontWeight="semibold" fontSize="md">
            Asignación Automática
          </Text>

          <Field label="Activar asignación automática">
            <Switch
              checked={settings.autoAssignEnabled}
              onCheckedChange={(e) =>
                setSettings({ ...settings, autoAssignEnabled: e.checked })
              }
            />
          </Field>

          {settings.autoAssignEnabled && (
            <>
              <Field label="Radio de búsqueda (km)">
                <Input
                  type="number"
                  value={settings.autoAssignRadius}
                  onChange={(e) =>
                    setSettings({ ...settings, autoAssignRadius: Number(e.target.value) })
                  }
                  min={1}
                  max={50}
                />
              </Field>

              <Field label="Prioridad de asignación">
                <select
                  value={settings.autoAssignPriority}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      autoAssignPriority: e.target.value as 'nearest' | 'rating' | 'workload'
                    })
                  }
                  className="chakra-input"
                >
                  <option value="nearest">Más cercano</option>
                  <option value="rating">Mejor calificación</option>
                  <option value="workload">Menor carga de trabajo</option>
                </select>
              </Field>
            </>
          )}
        </Stack>
      </Box>

      {/* Notifications Section */}
      <Box p="md" borderWidth="1px" borderRadius="md">
        <Stack gap="md">
          <Text fontWeight="semibold" fontSize="md">
            Notificaciones
          </Text>

          <Field label="Notificar repartidor al asignar">
            <Switch
              checked={settings.notifyDriverOnAssignment}
              onCheckedChange={(e) =>
                setSettings({ ...settings, notifyDriverOnAssignment: e.checked })
              }
            />
          </Field>

          <Field label="Notificar cliente al despachar">
            <Switch
              checked={settings.notifyCustomerOnDispatch}
              onCheckedChange={(e) =>
                setSettings({ ...settings, notifyCustomerOnDispatch: e.checked })
              }
            />
          </Field>

          <Field label="Notificar cliente al llegar">
            <Switch
              checked={settings.notifyCustomerOnArrival}
              onCheckedChange={(e) =>
                setSettings({ ...settings, notifyCustomerOnArrival: e.checked })
              }
            />
          </Field>
        </Stack>
      </Box>

      {/* GPS Tracking Section */}
      <Box p="md" borderWidth="1px" borderRadius="md">
        <Stack gap="md">
          <Text fontWeight="semibold" fontSize="md">
            Tracking GPS
          </Text>

          <Field label="Intervalo de actualización (segundos)">
            <Input
              type="number"
              value={settings.trackingUpdateInterval}
              onChange={(e) =>
                setSettings({ ...settings, trackingUpdateInterval: Number(e.target.value) })
              }
              min={10}
              max={300}
            />
          </Field>

          <Field label="Precisión mínima (metros)">
            <Input
              type="number"
              value={settings.trackingAccuracyThreshold}
              onChange={(e) =>
                setSettings({ ...settings, trackingAccuracyThreshold: Number(e.target.value) })
              }
              min={10}
              max={500}
            />
          </Field>
        </Stack>
      </Box>

      {/* Defaults Section */}
      <Box p="md" borderWidth="1px" borderRadius="md">
        <Stack gap="md">
          <Text fontWeight="semibold" fontSize="md">
            Valores Predeterminados
          </Text>

          <Field label="Tarifa de delivery ($)">
            <Input
              type="number"
              value={settings.defaultDeliveryFee}
              onChange={(e) =>
                setSettings({ ...settings, defaultDeliveryFee: Number(e.target.value) })
              }
              min={0}
              step={0.01}
            />
          </Field>

          <Field label="Tiempo estimado (minutos)">
            <Input
              type="number"
              value={settings.defaultEstimatedTime}
              onChange={(e) =>
                setSettings({ ...settings, defaultEstimatedTime: Number(e.target.value) })
              }
              min={5}
              max={300}
            />
          </Field>

          <Field label="Notas predeterminadas">
            <Textarea
              value={settings.defaultNotes}
              onChange={(e) =>
                setSettings({ ...settings, defaultNotes: e.target.value })
              }
              placeholder="Ej: Llamar 5 minutos antes de llegar"
              rows={3}
            />
          </Field>
        </Stack>
      </Box>

      {/* Save Button */}
      <Stack direction="row" justify="flex-end">
        <Button
          variant="solid"
          colorPalette="blue"
          onClick={handleSave}
          loading={isSaving}
        >
          Guardar Configuración
        </Button>
      </Stack>
    </Stack>
  );
}
