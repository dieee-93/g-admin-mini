/**
 * Booking Rules Configuration Component
 * Based on: IMPLEMENTATION_ROADMAP_DISTRIBUTED_FEATURES.md Week 3
 * Allows configuration of global booking rules and policies
 */

import { useState, useEffect } from 'react';
import { Stack, Text, Grid } from '@chakra-ui/react';
import { Button, CardWrapper, Field, Input, Alert, Icon, NativeSelect } from '@/shared/ui';
import {
  Cog6ToothIcon,
  ClockIcon,
  CalendarDaysIcon,
  CurrencyDollarIcon,
  XCircleIcon} from '@heroicons/react/24/outline';
import {
  useAvailabilityRules,
  useBulkUpdateAvailabilityRules} from '../hooks/useAvailability';
import type { BookingRulesConfig as BookingRulesType, CancellationPolicy } from '@/types/appointment';

const CANCELLATION_POLICIES: { value: CancellationPolicy; label: string; description: string }[] = [
  {
    value: 'flexible',
    label: 'Flexible',
    description: 'Customers can cancel anytime without penalty'},
  {
    value: '24h_notice',
    label: '24-Hour Notice',
    description: 'Requires 24 hours notice to cancel without penalty'},
  {
    value: '48h_notice',
    label: '48-Hour Notice',
    description: 'Requires 48 hours notice to cancel without penalty'},
  {
    value: 'strict',
    label: 'Strict',
    description: 'No refunds or rescheduling allowed'},
];

interface BookingRulesConfigProps {
  location_id?: string;
}

export function BookingRulesConfig({ location_id }: BookingRulesConfigProps) {
  const { data: rules, isLoading } = useAvailabilityRules({ location_id, is_active: true });
  const bulkUpdate = useBulkUpdateAvailabilityRules();

  const [config, setConfig] = useState<BookingRulesType>({
    min_advance_hours: 2,
    max_advance_days: 30,
    buffer_minutes: 0,
    slot_duration_minutes: 15,
    cancellation_policy: 'flexible',
    cancellation_fee_percentage: 0});

  const [hasChanges, setHasChanges] = useState(false);

  // Initialize config from first rule (all rules share same booking config)
  useEffect(() => {
    if (rules && rules.length > 0) {
      const firstRule = rules[0];
      setConfig({
        min_advance_hours: firstRule.min_advance_hours,
        max_advance_days: firstRule.max_advance_days,
        buffer_minutes: firstRule.buffer_minutes,
        slot_duration_minutes: firstRule.slot_duration_minutes,
        cancellation_policy: firstRule.cancellation_policy,
        cancellation_fee_percentage: firstRule.cancellation_fee_percentage});
    }
  }, [rules]);

  const handleChange = (field: keyof BookingRulesType, value: unknown) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!rules) return;

    // Apply config to all existing rules
    const updates = rules.map((rule) => ({
      id: rule.id,
      day_of_week: rule.day_of_week,
      start_time: rule.start_time,
      end_time: rule.end_time,
      is_active: rule.is_active,
      location_id: rule.location_id,
      ...config}));

    await bulkUpdate.mutateAsync(updates);
    setHasChanges(false);
  };

  const handleReset = () => {
    if (rules && rules.length > 0) {
      const firstRule = rules[0];
      setConfig({
        min_advance_hours: firstRule.min_advance_hours,
        max_advance_days: firstRule.max_advance_days,
        buffer_minutes: firstRule.buffer_minutes,
        slot_duration_minutes: firstRule.slot_duration_minutes,
        cancellation_policy: firstRule.cancellation_policy,
        cancellation_fee_percentage: firstRule.cancellation_fee_percentage});
      setHasChanges(false);
    }
  };

  if (isLoading) {
    return (
      <CardWrapper>
        <CardWrapper.Body>
          <Stack gap="4" align="center" py="8">
            <Text color="text.muted">Loading booking rules...</Text>
          </Stack>
        </CardWrapper.Body>
      </CardWrapper>
    );
  }

  return (
    <Stack gap="4">
      {/* Header */}
      <Stack direction="row" justify="space-between" align="center">
        <Stack gap="1">
          <Stack direction="row" gap="2" align="center">
            <Icon icon={Cog6ToothIcon} size="lg" color="purple.600" />
            <Text fontSize="xl" fontWeight="bold">
              Booking Rules & Policies
            </Text>
          </Stack>
          <Text fontSize="sm" color="text.muted">
            Configure global booking rules, slot duration, and cancellation policies
          </Text>
        </Stack>

        {hasChanges && (
          <Stack direction="row" gap="2" display={{ base: 'none', md: 'flex' }}>
            <Button size="sm" variant="ghost" onClick={handleReset}>
              Reset
            </Button>
            <Button
              size="sm"
              colorPalette="purple"
              onClick={handleSave}
              loading={bulkUpdate.isPending}
            >
              Save Changes
            </Button>
          </Stack>
        )}
      </Stack>

      {/* Info Alert */}
      <Alert
        variant="subtle"
        title="Global Booking Rules"
        description="These rules apply to all services by default. You can override them per professional or service."
      />

      {/* Configuration Sections */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)' }} gap="4">
        {/* Advance Booking Rules */}
        <CardWrapper>
          <CardWrapper.Header>
            <Stack direction="row" gap="2" align="center">
              <Icon icon={CalendarDaysIcon} size="md" color="blue.600" />
              <Text fontWeight="semibold">Advance Booking</Text>
            </Stack>
          </CardWrapper.Header>
          <CardWrapper.Body>
            <Stack gap="4">
              <Field.Root>
                <Field.Label>Minimum Advance Time (hours)</Field.Label>
                <Input
                  type="number"
                  value={config.min_advance_hours}
                  onChange={(e) => handleChange('min_advance_hours', parseInt(e.target.value))}
                  min={0}
                  step={1}
                />
                <Field.HelperText>
                  Customers must book at least this many hours in advance
                </Field.HelperText>
              </Field.Root>

              <Field.Root>
                <Field.Label>Maximum Advance Time (days)</Field.Label>
                <Input
                  type="number"
                  value={config.max_advance_days}
                  onChange={(e) => handleChange('max_advance_days', parseInt(e.target.value))}
                  min={1}
                  step={1}
                />
                <Field.HelperText>
                  Customers can book up to this many days in advance
                </Field.HelperText>
              </Field.Root>
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>

        {/* Slot & Buffer Configuration */}
        <CardWrapper>
          <CardWrapper.Header>
            <Stack direction="row" gap="2" align="center">
              <Icon icon={ClockIcon} size="md" color="green.600" />
              <Text fontWeight="semibold">Slots & Buffer</Text>
            </Stack>
          </CardWrapper.Header>
          <CardWrapper.Body>
            <Stack gap="4">
              <Field.Root>
                <Field.Label>Slot Duration (minutes)</Field.Label>
                <NativeSelect.Root
                  value={config.slot_duration_minutes.toString()}
                  onValueChange={(details) =>
                    handleChange('slot_duration_minutes', parseInt(details.value))
                  }
                >
                  <NativeSelect.Field>
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                  </NativeSelect.Field>
                </NativeSelect.Root>
                <Field.HelperText>
                  Default time slot interval for bookings
                </Field.HelperText>
              </Field.Root>

              <Field.Root>
                <Field.Label>Buffer Time (minutes)</Field.Label>
                <Input
                  type="number"
                  value={config.buffer_minutes}
                  onChange={(e) => handleChange('buffer_minutes', parseInt(e.target.value))}
                  min={0}
                  step={5}
                />
                <Field.HelperText>
                  Break time between consecutive appointments
                </Field.HelperText>
              </Field.Root>
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>
      </Grid>

      {/* Cancellation Policy */}
      <CardWrapper>
        <CardWrapper.Header>
          <Stack direction="row" gap="2" align="center">
            <Icon icon={XCircleIcon} size="md" color="orange.600" />
            <Text fontWeight="semibold">Cancellation Policy</Text>
          </Stack>
        </CardWrapper.Header>
        <CardWrapper.Body>
          <Grid templateColumns={{ base: '1fr', md: '2fr 1fr' }} gap="4">
            <Field.Root>
              <Field.Label>Cancellation Policy</Field.Label>
              <NativeSelect.Root
                value={config.cancellation_policy || 'flexible'}
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
                {CANCELLATION_POLICIES.find((p) => p.value === config.cancellation_policy)
                  ?.description}
              </Field.HelperText>
            </Field.Root>

            <Field.Root>
              <Field.Label>Cancellation Fee (%)</Field.Label>
              <Stack direction="row" gap="2" align="center">
                <Input
                  type="number"
                  value={config.cancellation_fee_percentage}
                  onChange={(e) =>
                    handleChange('cancellation_fee_percentage', parseFloat(e.target.value))
                  }
                  min={0}
                  max={100}
                  step={5}
                />
                <Icon icon={CurrencyDollarIcon} size="md" color="text.muted" />
              </Stack>
              <Field.HelperText>
                Percentage of booking value charged for late cancellations
              </Field.HelperText>
            </Field.Root>
          </Grid>
        </CardWrapper.Body>
      </CardWrapper>

      {/* Summary Card */}
      <CardWrapper variant="subtle" borderLeft="4px solid" borderColor="purple.500">
        <CardWrapper.Body>
          <Stack gap="3">
            <Text fontSize="sm" fontWeight="semibold" color="purple.700">
              Current Configuration Summary
            </Text>

            <Grid templateColumns="repeat(2, 1fr)" gap="3">
              <Stack gap="1">
                <Text fontSize="xs" color="text.muted">
                  Min Advance Booking
                </Text>
                <Text fontSize="sm" fontWeight="medium">
                  {config.min_advance_hours} hours
                </Text>
              </Stack>

              <Stack gap="1">
                <Text fontSize="xs" color="text.muted">
                  Max Advance Booking
                </Text>
                <Text fontSize="sm" fontWeight="medium">
                  {config.max_advance_days} days
                </Text>
              </Stack>

              <Stack gap="1">
                <Text fontSize="xs" color="text.muted">
                  Slot Duration
                </Text>
                <Text fontSize="sm" fontWeight="medium">
                  {config.slot_duration_minutes} minutes
                </Text>
              </Stack>

              <Stack gap="1">
                <Text fontSize="xs" color="text.muted">
                  Buffer Time
                </Text>
                <Text fontSize="sm" fontWeight="medium">
                  {config.buffer_minutes} minutes
                </Text>
              </Stack>

              <Stack gap="1">
                <Text fontSize="xs" color="text.muted">
                  Cancellation Policy
                </Text>
                <Text fontSize="sm" fontWeight="medium">
                  {CANCELLATION_POLICIES.find((p) => p.value === config.cancellation_policy)?.label}
                </Text>
              </Stack>

              <Stack gap="1">
                <Text fontSize="xs" color="text.muted">
                  Cancellation Fee
                </Text>
                <Text fontSize="sm" fontWeight="medium">
                  {config.cancellation_fee_percentage}%
                </Text>
              </Stack>
            </Grid>
          </Stack>
        </CardWrapper.Body>
      </CardWrapper>

      {/* Save Button (mobile) */}
      {hasChanges && (
        <Stack direction="row" gap="2" display={{ base: 'flex', md: 'none' }}>
          <Button flex="1" variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button
            flex="1"
            colorPalette="purple"
            onClick={handleSave}
            loading={bulkUpdate.isPending}
          >
            Save Changes
          </Button>
        </Stack>
      )}
    </Stack>
  );
}
