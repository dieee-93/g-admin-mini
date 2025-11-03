/**
 * Service Configuration Manager Component
 * Based on: IMPLEMENTATION_ROADMAP_DISTRIBUTED_FEATURES.md Week 4
 * Modal for creating/editing appointment services
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
  NativeSelect,
  Icon,
} from '@/shared/ui';
import {
  ClockIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { notify } from '@/lib/notifications';
import type { CancellationPolicy } from '@/types/appointment';

interface ServiceConfigurationManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (serviceData: ServiceFormData) => Promise<void>;
  service?: ServiceFormData & { id?: string };
  mode: 'create' | 'edit';
}

export interface ServiceFormData {
  // Basic product fields
  name: string;
  description?: string;
  price: number;
  category?: string;
  image_url?: string;
  type: 'SERVICE';
  is_active: boolean;

  // Service-specific fields
  duration_minutes: number;
  preparation_time?: number;
  requires_specific_professional: boolean;
  cancellation_policy: CancellationPolicy;
  available_for_online_booking: boolean;
}

const CANCELLATION_POLICIES: Array<{ value: CancellationPolicy; label: string; description: string }> = [
  {
    value: 'flexible',
    label: 'Flexible',
    description: 'Customers can cancel anytime without penalty',
  },
  {
    value: '24h_notice',
    label: '24-Hour Notice',
    description: 'Requires 24 hours notice to cancel without penalty',
  },
  {
    value: '48h_notice',
    label: '48-Hour Notice',
    description: 'Requires 48 hours notice to cancel without penalty',
  },
  {
    value: 'strict',
    label: 'Strict',
    description: 'No refunds or rescheduling allowed',
  },
];

const SERVICE_CATEGORIES = [
  'Hair Services',
  'Beauty & Spa',
  'Health & Wellness',
  'Fitness & Training',
  'Consulting',
  'Education',
  'Professional Services',
  'Other',
];

export function ServiceConfigurationManager({
  isOpen,
  onClose,
  onSave,
  service,
  mode,
}: ServiceConfigurationManagerProps) {
  const [formData, setFormData] = useState<ServiceFormData>({
    name: '',
    description: '',
    price: 0,
    category: '',
    image_url: '',
    type: 'SERVICE',
    is_active: true,
    duration_minutes: 60,
    preparation_time: 0,
    requires_specific_professional: false,
    cancellation_policy: 'flexible',
    available_for_online_booking: true,
  });

  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form when service changes
  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        description: service.description || '',
        price: service.price || 0,
        category: service.category || '',
        image_url: service.image_url || '',
        type: 'SERVICE',
        is_active: service.is_active ?? true,
        duration_minutes: service.duration_minutes || 60,
        preparation_time: service.preparation_time || 0,
        requires_specific_professional: service.requires_specific_professional || false,
        cancellation_policy: service.cancellation_policy || 'flexible',
        available_for_online_booking: service.available_for_online_booking ?? true,
      });
    } else {
      // Reset to defaults for create mode
      setFormData({
        name: '',
        description: '',
        price: 0,
        category: '',
        image_url: '',
        type: 'SERVICE',
        is_active: true,
        duration_minutes: 60,
        preparation_time: 0,
        requires_specific_professional: false,
        cancellation_policy: 'flexible',
        available_for_online_booking: true,
      });
    }
    setHasChanges(false);
  }, [service, isOpen]);

  const handleChange = <K extends keyof ServiceFormData>(
    field: K,
    value: ServiceFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    // Validation
    if (!formData.name.trim()) {
      notify.error({
        title: 'Validation Error',
        description: 'Service name is required',
      });
      return;
    }

    if (formData.price < 0) {
      notify.error({
        title: 'Validation Error',
        description: 'Price must be 0 or greater',
      });
      return;
    }

    if (formData.duration_minutes < 15) {
      notify.error({
        title: 'Validation Error',
        description: 'Duration must be at least 15 minutes',
      });
      return;
    }

    try {
      setSaving(true);
      await onSave(formData);
      notify.success({
        title: mode === 'create' ? 'Service created' : 'Service updated',
        description: `${formData.name} has been ${mode === 'create' ? 'created' : 'updated'} successfully.`,
      });
      setHasChanges(false);
      onClose();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while saving the service.';
      notify.error({
        title: `Failed to ${mode} service`,
        description: errorMessage,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={({ open }) => !open && onClose()} size="xl">
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Stack direction="row" gap="3" align="center">
              <Icon icon={CalendarIcon} size="lg" color="purple.600" />
              <Stack gap="1">
                <Dialog.Title>
                  {mode === 'create' ? 'Create New Service' : `Edit Service: ${service?.name}`}
                </Dialog.Title>
                <Text fontSize="sm" color="text.muted">
                  Configure appointment service details and booking settings
                </Text>
              </Stack>
            </Stack>
          </Dialog.Header>

          <Dialog.Body>
            <Stack gap="6">
              {/* Basic Information */}
              <Stack gap="4">
                <Text fontSize="lg" fontWeight="semibold">
                  Basic Information
                </Text>

                <Field.Root required>
                  <Field.Label>Service Name</Field.Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g., Haircut, Massage, Personal Training"
                  />
                  <Field.HelperText>
                    Service name as displayed to customers
                  </Field.HelperText>
                </Field.Root>

                <Field.Root>
                  <Field.Label>Description</Field.Label>
                  <Textarea
                    value={formData.description || ''}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Describe what's included in this service..."
                    rows={3}
                  />
                  <Field.HelperText>
                    Detailed description shown to customers
                  </Field.HelperText>
                </Field.Root>

                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap="4">
                  <Field.Root required>
                    <Field.Label>Category</Field.Label>
                    <NativeSelect.Root
                      value={formData.category || ''}
                      onValueChange={(details) => handleChange('category', details.value)}
                    >
                      <NativeSelect.Field placeholder="Select category">
                        {SERVICE_CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </NativeSelect.Field>
                    </NativeSelect.Root>
                    <Field.HelperText>Service category</Field.HelperText>
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>Image URL</Field.Label>
                    <Input
                      type="url"
                      value={formData.image_url || ''}
                      onChange={(e) => handleChange('image_url', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                    <Field.HelperText>Service image</Field.HelperText>
                  </Field.Root>
                </Grid>
              </Stack>

              {/* Pricing */}
              <Stack gap="4">
                <Text fontSize="lg" fontWeight="semibold">
                  Pricing
                </Text>

                <Field.Root required>
                  <Field.Label>Price</Field.Label>
                  <Stack direction="row" gap="2" align="center">
                    <Icon icon={CurrencyDollarIcon} size="md" color="text.muted" />
                    <Input
                      type="number"
                      value={formData.price}
                      onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                      min={0}
                      step={0.01}
                      placeholder="0.00"
                    />
                  </Stack>
                  <Field.HelperText>
                    Service price (before tax)
                  </Field.HelperText>
                </Field.Root>
              </Stack>

              {/* Service Settings */}
              <Stack gap="4">
                <Text fontSize="lg" fontWeight="semibold">
                  Service Settings
                </Text>

                <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap="4">
                  <Field.Root required>
                    <Field.Label>Duration (minutes)</Field.Label>
                    <Stack direction="row" gap="2" align="center">
                      <Icon icon={ClockIcon} size="md" color="text.muted" />
                      <Input
                        type="number"
                        value={formData.duration_minutes}
                        onChange={(e) =>
                          handleChange('duration_minutes', parseInt(e.target.value) || 15)
                        }
                        min={15}
                        step={15}
                      />
                    </Stack>
                    <Field.HelperText>
                      Service duration (15-360 min)
                    </Field.HelperText>
                  </Field.Root>

                  <Field.Root>
                    <Field.Label>Preparation Time (minutes)</Field.Label>
                    <Input
                      type="number"
                      value={formData.preparation_time || 0}
                      onChange={(e) =>
                        handleChange('preparation_time', parseInt(e.target.value) || 0)
                      }
                      min={0}
                      step={5}
                    />
                    <Field.HelperText>
                      Setup time before service
                    </Field.HelperText>
                  </Field.Root>
                </Grid>

                <Field.Root>
                  <Switch
                    checked={formData.requires_specific_professional}
                    onCheckedChange={(details) =>
                      handleChange('requires_specific_professional', details.checked)
                    }
                    colorPalette={formData.requires_specific_professional ? 'orange' : 'gray'}
                  >
                    <Stack gap="1">
                      <Text fontWeight="medium">Requires Specific Professional</Text>
                      <Text fontSize="sm" color="text.muted">
                        Customers must select a professional when booking (cannot choose "Any Available")
                      </Text>
                    </Stack>
                  </Switch>
                </Field.Root>
              </Stack>

              {/* Booking Policy */}
              <Stack gap="4">
                <Text fontSize="lg" fontWeight="semibold">
                  Booking Policy
                </Text>

                <Field.Root>
                  <Field.Label>Cancellation Policy</Field.Label>
                  <NativeSelect.Root
                    value={formData.cancellation_policy}
                    onValueChange={(details) =>
                      handleChange('cancellation_policy', details.value as CancellationPolicy)
                    }
                  >
                    <NativeSelect.Field>
                      {CANCELLATION_POLICIES.map((policy) => (
                        <option key={policy.value} value={policy.value}>
                          {policy.label}
                        </option>
                      ))}
                    </NativeSelect.Field>
                  </NativeSelect.Root>
                  <Field.HelperText>
                    {CANCELLATION_POLICIES.find((p) => p.value === formData.cancellation_policy)
                      ?.description}
                  </Field.HelperText>
                </Field.Root>

                <Field.Root>
                  <Switch
                    checked={formData.available_for_online_booking}
                    onCheckedChange={(details) =>
                      handleChange('available_for_online_booking', details.checked)
                    }
                    colorPalette={formData.available_for_online_booking ? 'green' : 'orange'}
                  >
                    <Stack gap="1">
                      <Text fontWeight="medium">Available for Online Booking</Text>
                      <Text fontSize="sm" color="text.muted">
                        Customers can book this service through the customer portal
                      </Text>
                    </Stack>
                  </Switch>
                </Field.Root>

                <Field.Root>
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(details) => handleChange('is_active', details.checked)}
                    colorPalette={formData.is_active ? 'green' : 'red'}
                  >
                    <Stack direction="row" gap="2" align="center">
                      <Text fontWeight="medium">
                        {formData.is_active ? 'Active' : 'Inactive'}
                      </Text>
                      {formData.is_active ? (
                        <Icon icon={CheckCircleIcon} size="sm" color="green.600" />
                      ) : (
                        <Icon icon={XCircleIcon} size="sm" color="red.600" />
                      )}
                    </Stack>
                  </Switch>
                </Field.Root>
              </Stack>
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
                colorPalette="purple"
                onClick={handleSave}
                loading={saving}
                disabled={!hasChanges}
              >
                {mode === 'create' ? 'Create Service' : 'Save Changes'}
              </Button>
            </Stack>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
