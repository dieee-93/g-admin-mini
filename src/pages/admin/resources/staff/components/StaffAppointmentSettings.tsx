/**
 * Staff Appointment Settings Component
 * Based on: IMPLEMENTATION_ROADMAP_DISTRIBUTED_FEATURES.md Week 4
 * Modal for configuring appointment-related settings for staff members
 */

import { useState, useEffect } from 'react';
import { Stack, Text, Grid } from '@chakra-ui/react';
import {
  Dialog,
  Button,
  Field,
  Input,
  Textarea,
  Switch,
  Alert,
  Icon,
  Badge,
} from '@/shared/ui';
import {
  CalendarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
// TODO: Implement time slot selector using ClockIcon
// TODO: Implement staff profile preview using UserCircleIcon
// TODO: Implement service multi-select using NativeSelect
import { notify } from '@/lib/notifications';
import type { Employee } from '../types';

interface StaffAppointmentSettingsProps {
  isOpen: boolean;
  onClose: () => void;
  staff: Employee;
  onSave: (staffId: string, settings: AppointmentSettingsData) => Promise<void>;
  availableServices: Array<{ id: string; name: string }>;
}

export interface AppointmentSettingsData {
  accepts_appointments: boolean;
  services_provided: string[];
  booking_buffer_minutes: number;
  allow_online_booking: boolean;
  max_appointments_per_day: number;
  appointment_notes?: string;
  professional_bio?: string;
  years_of_experience?: number;
  avatar_url?: string;
}

export function StaffAppointmentSettings({
  isOpen,
  onClose,
  staff,
  onSave,
  availableServices,
}: StaffAppointmentSettingsProps) {
  const [settings, setSettings] = useState<AppointmentSettingsData>({
    accepts_appointments: staff.accepts_appointments || false,
    services_provided: staff.services_provided || [],
    booking_buffer_minutes: staff.booking_buffer_minutes || 15,
    allow_online_booking: staff.allow_online_booking ?? true,
    max_appointments_per_day: staff.max_appointments_per_day || 8,
    appointment_notes: staff.appointment_notes || '',
    professional_bio: staff.professional_bio || '',
    years_of_experience: staff.years_of_experience || undefined,
    avatar_url: staff.avatar_url || '',
  });

  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Reset settings when staff changes
  useEffect(() => {
    setSettings({
      accepts_appointments: staff.accepts_appointments || false,
      services_provided: staff.services_provided || [],
      booking_buffer_minutes: staff.booking_buffer_minutes || 15,
      allow_online_booking: staff.allow_online_booking ?? true,
      max_appointments_per_day: staff.max_appointments_per_day || 8,
      appointment_notes: staff.appointment_notes || '',
      professional_bio: staff.professional_bio || '',
      years_of_experience: staff.years_of_experience || undefined,
      avatar_url: staff.avatar_url || '',
    });
    setHasChanges(false);
  }, [staff]);

  const handleChange = <K extends keyof AppointmentSettingsData>(
    field: K,
    value: AppointmentSettingsData[K]
  ) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleServiceToggle = (serviceId: string) => {
    const currentServices = settings.services_provided || [];
    const newServices = currentServices.includes(serviceId)
      ? currentServices.filter((id) => id !== serviceId)
      : [...currentServices, serviceId];

    handleChange('services_provided', newServices);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await onSave(staff.id, settings);
      notify.success({
        title: 'Appointment settings updated',
        description: `Settings for ${staff.first_name} ${staff.last_name} have been saved.`,
      });
      setHasChanges(false);
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while saving appointment settings.';
      notify.error({
        title: 'Failed to save settings',
        description: errorMessage,
      });
    } finally {
      setSaving(false);
    }
  };

  const staffName = `${staff.first_name} ${staff.last_name}`;

  return (
    <Dialog.Root open={isOpen} onOpenChange={({ open }) => !open && onClose()} size="xl">
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Stack direction="row" gap="3" align="center">
              <Icon icon={CalendarIcon} size="lg" color="blue.600" />
              <Stack gap="1">
                <Dialog.Title>Appointment Settings</Dialog.Title>
                <Text fontSize="sm" color="text.muted">
                  Configure appointment booking settings for {staffName}
                </Text>
              </Stack>
            </Stack>
          </Dialog.Header>

          <Dialog.Body>
            <Stack gap="6">
              {/* Master Toggle */}
              <Alert
                variant="subtle"
                title="Appointments Feature"
                description="Enable this to allow customers to book appointments with this professional"
              >
                <Switch
                  checked={settings.accepts_appointments}
                  onCheckedChange={(details) =>
                    handleChange('accepts_appointments', details.checked)
                  }
                  colorPalette={settings.accepts_appointments ? 'green' : 'gray'}
                  size="lg"
                >
                  <Stack direction="row" gap="2" align="center">
                    <Text fontWeight="medium">
                      {settings.accepts_appointments ? 'Accepting Appointments' : 'Not Accepting Appointments'}
                    </Text>
                    {settings.accepts_appointments && (
                      <Icon icon={CheckCircleIcon} size="sm" color="green.600" />
                    )}
                  </Stack>
                </Switch>
              </Alert>

              {/* Only show detailed settings if appointments are enabled */}
              {settings.accepts_appointments && (
                <>
                  {/* Services Selection */}
                  <Field.Root>
                    <Field.Label>Services Provided</Field.Label>
                    <Stack gap="2">
                      {availableServices.length > 0 ? (
                        <Grid templateColumns="repeat(2, 1fr)" gap="2">
                          {availableServices.map((service) => {
                            const isSelected = settings.services_provided?.includes(service.id);
                            return (
                              <Badge
                                key={service.id}
                                colorPalette={isSelected ? 'blue' : 'gray'}
                                variant={isSelected ? 'solid' : 'outline'}
                                cursor="pointer"
                                onClick={() => handleServiceToggle(service.id)}
                                p="2"
                              >
                                {service.name}
                                {isSelected && (
                                  <Icon icon={CheckCircleIcon} size="xs" ml="1" />
                                )}
                              </Badge>
                            );
                          })}
                        </Grid>
                      ) : (
                        <Text fontSize="sm" color="text.muted">
                          No services available. Create services in the Products module first.
                        </Text>
                      )}
                    </Stack>
                    <Field.HelperText>
                      Select which services this professional can provide
                    </Field.HelperText>
                  </Field.Root>

                  {/* Booking Settings */}
                  <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap="4">
                    <Field.Root>
                      <Field.Label>Buffer Time (minutes)</Field.Label>
                      <Input
                        type="number"
                        value={settings.booking_buffer_minutes}
                        onChange={(e) =>
                          handleChange('booking_buffer_minutes', parseInt(e.target.value) || 0)
                        }
                        min={0}
                        step={5}
                      />
                      <Field.HelperText>
                        Time between appointments (0-60 min)
                      </Field.HelperText>
                    </Field.Root>

                    <Field.Root>
                      <Field.Label>Max Appointments/Day</Field.Label>
                      <Input
                        type="number"
                        value={settings.max_appointments_per_day}
                        onChange={(e) =>
                          handleChange('max_appointments_per_day', parseInt(e.target.value) || 1)
                        }
                        min={1}
                        max={20}
                      />
                      <Field.HelperText>
                        Maximum per day (1-20)
                      </Field.HelperText>
                    </Field.Root>
                  </Grid>

                  {/* Online Booking Toggle */}
                  <Field.Root>
                    <Switch
                      checked={settings.allow_online_booking}
                      onCheckedChange={(details) =>
                        handleChange('allow_online_booking', details.checked)
                      }
                      colorPalette={settings.allow_online_booking ? 'green' : 'orange'}
                    >
                      <Stack gap="1">
                        <Text fontWeight="medium">Allow Online Booking</Text>
                        <Text fontSize="sm" color="text.muted">
                          Customers can book this professional through the customer portal
                        </Text>
                      </Stack>
                    </Switch>
                  </Field.Root>

                  {/* Professional Info */}
                  <Stack gap="4">
                    <Text fontSize="lg" fontWeight="semibold">
                      Professional Information
                    </Text>

                    <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap="4">
                      <Field.Root>
                        <Field.Label>Years of Experience</Field.Label>
                        <Input
                          type="number"
                          value={settings.years_of_experience || ''}
                          onChange={(e) =>
                            handleChange(
                              'years_of_experience',
                              e.target.value ? parseInt(e.target.value) : undefined
                            )
                          }
                          min={0}
                          placeholder="e.g., 5"
                        />
                        <Field.HelperText>
                          Displayed to customers
                        </Field.HelperText>
                      </Field.Root>

                      <Field.Root>
                        <Field.Label>Avatar URL</Field.Label>
                        <Input
                          type="url"
                          value={settings.avatar_url || ''}
                          onChange={(e) => handleChange('avatar_url', e.target.value)}
                          placeholder="https://example.com/photo.jpg"
                        />
                        <Field.HelperText>
                          Profile picture URL
                        </Field.HelperText>
                      </Field.Root>
                    </Grid>

                    <Field.Root>
                      <Field.Label>Professional Bio</Field.Label>
                      <Textarea
                        value={settings.professional_bio || ''}
                        onChange={(e) => handleChange('professional_bio', e.target.value)}
                        placeholder="Tell customers about your expertise, specialties, and approach..."
                        rows={4}
                      />
                      <Field.HelperText>
                        Public bio displayed to customers when booking (optional)
                      </Field.HelperText>
                    </Field.Root>

                    <Field.Root>
                      <Field.Label>Internal Notes</Field.Label>
                      <Textarea
                        value={settings.appointment_notes || ''}
                        onChange={(e) => handleChange('appointment_notes', e.target.value)}
                        placeholder="Internal scheduling notes, preferences, restrictions..."
                        rows={3}
                      />
                      <Field.HelperText>
                        Private notes for staff only (not visible to customers)
                      </Field.HelperText>
                    </Field.Root>
                  </Stack>
                </>
              )}
            </Stack>
          </Dialog.Body>

          <Dialog.Footer>
            <Stack direction="row" gap="2" justify="flex-end" width="full">
              <Dialog.CloseTrigger asChild>
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              </Dialog.CloseTrigger>
              <Button
                colorPalette="blue"
                onClick={handleSave}
                loading={saving}
                disabled={!hasChanges}
              >
                Save Settings
              </Button>
            </Stack>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
