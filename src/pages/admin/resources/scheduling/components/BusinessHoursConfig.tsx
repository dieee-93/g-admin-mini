/**
 * Business Hours Configuration Component
 * Based on: IMPLEMENTATION_ROADMAP_DISTRIBUTED_FEATURES.md Week 3
 * Allows configuration of business operating hours per day of week
 */

import { useState, useEffect } from 'react';
import { Stack, Text, Table } from '@chakra-ui/react';
import { Button, CardWrapper, Switch, Field, Input, Alert, Icon } from '@/shared/ui';
import { ClockIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import {
  useAvailabilityRules,
  useBulkUpdateAvailabilityRules,
} from '../hooks/useAvailability';
import type { DayOfWeek, WeekdaySchedule } from '@/types/appointment';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface BusinessHoursConfigProps {
  location_id?: string;
}

export function BusinessHoursConfig({ location_id }: BusinessHoursConfigProps) {
  const { data: rules, isLoading } = useAvailabilityRules({ location_id, is_active: true });
  const bulkUpdate = useBulkUpdateAvailabilityRules();

  const [schedule, setSchedule] = useState<WeekdaySchedule[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize schedule from database rules
  useEffect(() => {
    if (rules) {
      const weekSchedule: WeekdaySchedule[] = DAY_NAMES.map((day_name, day) => {
        const rule = rules.find((r) => r.day_of_week === day);

        if (rule) {
          return {
            day: day as DayOfWeek,
            day_name,
            enabled: rule.is_active,
            start_time: rule.start_time.substring(0, 5), // HH:MM format
            end_time: rule.end_time.substring(0, 5),
          };
        }

        // Default schedule if no rule exists
        return {
          day: day as DayOfWeek,
          day_name,
          enabled: false,
          start_time: '09:00',
          end_time: '18:00',
        };
      });

      setSchedule(weekSchedule);
    }
  }, [rules]);

  const handleDayToggle = (day: DayOfWeek) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.day === day ? { ...item, enabled: !item.enabled } : item
      )
    );
    setHasChanges(true);
  };

  const handleTimeChange = (
    day: DayOfWeek,
    field: 'start_time' | 'end_time',
    value: string
  ) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.day === day ? { ...item, [field]: value } : item
      )
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!rules) return;

    const updates = schedule.map((item) => {
      const existingRule = rules.find((r) => r.day_of_week === item.day);

      return {
        id: existingRule?.id,
        day_of_week: item.day,
        start_time: `${item.start_time}:00`,
        end_time: `${item.end_time}:00`,
        is_active: item.enabled,
        location_id,
        // Preserve existing settings
        min_advance_hours: existingRule?.min_advance_hours ?? 2,
        max_advance_days: existingRule?.max_advance_days ?? 30,
        buffer_minutes: existingRule?.buffer_minutes ?? 0,
        slot_duration_minutes: existingRule?.slot_duration_minutes ?? 15,
        cancellation_policy: existingRule?.cancellation_policy ?? 'flexible',
        cancellation_fee_percentage: existingRule?.cancellation_fee_percentage ?? 0,
      };
    });

    await bulkUpdate.mutateAsync(updates);
    setHasChanges(false);
  };

  const handleReset = () => {
    if (rules) {
      const weekSchedule: WeekdaySchedule[] = DAY_NAMES.map((day_name, day) => {
        const rule = rules.find((r) => r.day_of_week === day);

        return {
          day: day as DayOfWeek,
          day_name,
          enabled: rule?.is_active ?? false,
          start_time: rule ? rule.start_time.substring(0, 5) : '09:00',
          end_time: rule ? rule.end_time.substring(0, 5) : '18:00',
        };
      });

      setSchedule(weekSchedule);
      setHasChanges(false);
    }
  };

  if (isLoading) {
    return (
      <CardWrapper>
        <CardWrapper.Body>
          <Stack gap="4" align="center" py="8">
            <Text color="text.muted">Loading business hours...</Text>
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
            <Icon icon={ClockIcon} size="lg" color="blue.600" />
            <Text fontSize="xl" fontWeight="bold">
              Business Hours
            </Text>
          </Stack>
          <Text fontSize="sm" color="text.muted">
            Configure your operating hours for each day of the week
          </Text>
        </Stack>

        {hasChanges && (
          <Stack direction="row" gap="2">
            <Button size="sm" variant="ghost" onClick={handleReset}>
              Reset
            </Button>
            <Button
              size="sm"
              colorPalette="blue"
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
        title="Business Hours"
        description="Set your regular business hours. You can configure specific professional availability and exceptions separately."
      />

      {/* Business Hours Table */}
      <CardWrapper>
        <CardWrapper.Body p="0">
          <Table.Root size="sm" variant="line">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeader width="120px">Day</Table.ColumnHeader>
                <Table.ColumnHeader width="100px">Status</Table.ColumnHeader>
                <Table.ColumnHeader>Opening Time</Table.ColumnHeader>
                <Table.ColumnHeader>Closing Time</Table.ColumnHeader>
                <Table.ColumnHeader>Hours</Table.ColumnHeader>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {schedule.map((item) => {
                const [startHour, startMin] = item.start_time.split(':').map(Number);
                const [endHour, endMin] = item.end_time.split(':').map(Number);
                const totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
                const hours = Math.floor(totalMinutes / 60);
                const minutes = totalMinutes % 60;

                return (
                  <Table.Row key={item.day} opacity={item.enabled ? 1 : 0.5}>
                    {/* Day Name */}
                    <Table.Cell>
                      <Text fontWeight="medium">{item.day_name}</Text>
                    </Table.Cell>

                    {/* Status Toggle */}
                    <Table.Cell>
                      <Stack direction="row" gap="2" align="center">
                        <Switch
                          checked={item.enabled}
                          onCheckedChange={() => handleDayToggle(item.day)}
                          colorPalette={item.enabled ? 'green' : 'gray'}
                        />
                        {item.enabled ? (
                          <Icon icon={CheckCircleIcon} size="sm" color="green.600" />
                        ) : (
                          <Icon icon={XCircleIcon} size="sm" color="gray.400" />
                        )}
                      </Stack>
                    </Table.Cell>

                    {/* Opening Time */}
                    <Table.Cell>
                      <Field.Root disabled={!item.enabled}>
                        <Input
                          type="time"
                          value={item.start_time}
                          onChange={(e) =>
                            handleTimeChange(item.day, 'start_time', e.target.value)
                          }
                          size="sm"
                          disabled={!item.enabled}
                        />
                      </Field.Root>
                    </Table.Cell>

                    {/* Closing Time */}
                    <Table.Cell>
                      <Field.Root disabled={!item.enabled}>
                        <Input
                          type="time"
                          value={item.end_time}
                          onChange={(e) =>
                            handleTimeChange(item.day, 'end_time', e.target.value)
                          }
                          size="sm"
                          disabled={!item.enabled}
                        />
                      </Field.Root>
                    </Table.Cell>

                    {/* Total Hours */}
                    <Table.Cell>
                      {item.enabled ? (
                        <Text fontSize="sm" fontWeight="medium" color="green.600">
                          {hours}h {minutes > 0 ? `${minutes}m` : ''}
                        </Text>
                      ) : (
                        <Text fontSize="sm" color="text.muted">
                          Closed
                        </Text>
                      )}
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table.Root>
        </CardWrapper.Body>
      </CardWrapper>

      {/* Summary */}
      <CardWrapper variant="subtle">
        <CardWrapper.Body>
          <Stack direction="row" justify="space-between" align="center">
            <Stack gap="1">
              <Text fontSize="sm" fontWeight="medium">
                Total Operating Days
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                {schedule.filter((s) => s.enabled).length} / 7
              </Text>
            </Stack>

            <Stack gap="1" align="flex-end">
              <Text fontSize="sm" fontWeight="medium">
                Average Hours per Day
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="green.600">
                {(() => {
                  const totalMinutes = schedule
                    .filter((s) => s.enabled)
                    .reduce((sum, item) => {
                      const [startHour, startMin] = item.start_time.split(':').map(Number);
                      const [endHour, endMin] = item.end_time.split(':').map(Number);
                      return sum + ((endHour * 60 + endMin) - (startHour * 60 + startMin));
                    }, 0);
                  const enabledDays = schedule.filter((s) => s.enabled).length;
                  const avgHours = enabledDays > 0 ? totalMinutes / enabledDays / 60 : 0;
                  return avgHours.toFixed(1);
                })()}
                h
              </Text>
            </Stack>
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
            colorPalette="blue"
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
