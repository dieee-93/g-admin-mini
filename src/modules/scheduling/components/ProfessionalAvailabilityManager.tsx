/**
 * Professional Availability Manager Component
 * Based on: IMPLEMENTATION_ROADMAP_DISTRIBUTED_FEATURES.md Week 3
 * Allows configuration of professional-specific availability schedules
 */

import { useState, useEffect } from 'react';
import {
  Stack,
  Text,
  Table,
  Button,
  CardWrapper,
  Switch,
  Field,
  Input,
  Alert,
  Icon,
  NativeSelect,
  Badge
} from '@/shared/ui';
import {
  UserCircleIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import {
  useProfessionalAvailability,
  useBulkUpdateProfessionalAvailability
} from '../hooks/useAvailability';
import { useTeamWithLoader } from '@/modules/team/hooks';
import type {
  DayOfWeek,
  ProfessionalScheduleDay
} from '@/types/appointment';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

interface ProfessionalAvailabilityManagerProps {
  location_id?: string;
}

export function ProfessionalAvailabilityManager({
  location_id }: ProfessionalAvailabilityManagerProps) {
  const { staff, loading: isLoadingStaff } = useTeamWithLoader();
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [schedule, setSchedule] = useState<ProfessionalScheduleDay[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: professionalSchedules, isLoading: isLoadingSchedules } = useProfessionalAvailability({
    staff_id: selectedStaffId || undefined,
    location_id
  });

  const bulkUpdate = useBulkUpdateProfessionalAvailability();

  // Initialize schedule when professional is selected
  useEffect(() => {
    if (selectedStaffId && professionalSchedules) {
      const weekSchedule: ProfessionalScheduleDay[] = DAY_NAMES.map((_, day) => {
        const existing = professionalSchedules.find((s) => s.day_of_week === day);

        if (existing) {
          return {
            day_of_week: day as DayOfWeek,
            enabled: existing.is_active,
            start_time: existing.start_time.substring(0, 5),
            end_time: existing.end_time.substring(0, 5),
            has_break: !!(existing.break_start_time && existing.break_end_time),
            break_start_time: existing.break_start_time?.substring(0, 5),
            break_end_time: existing.break_end_time?.substring(0, 5),
            override_buffer: existing.override_buffer_minutes ?? undefined,
            override_slot_duration: existing.override_slot_duration ?? undefined
          };
        }

        // Default empty schedule
        return {
          day_of_week: day as DayOfWeek,
          enabled: false,
          start_time: '09:00',
          end_time: '18:00',
          has_break: false
        };
      });

      setSchedule(weekSchedule);
      setHasChanges(false);
    }
  }, [selectedStaffId, professionalSchedules]);

  const handleStaffChange = (staff_id: string) => {
    if (hasChanges) {
      const confirm = window.confirm(
        'You have unsaved changes. Are you sure you want to switch professionals?'
      );
      if (!confirm) return;
    }

    setSelectedStaffId(staff_id);
    setHasChanges(false);
  };

  const handleDayToggle = (day: DayOfWeek) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.day_of_week === day ? { ...item, enabled: !item.enabled } : item
      )
    );
    setHasChanges(true);
  };

  const handleTimeChange = (
    day: DayOfWeek,
    field: 'start_time' | 'end_time' | 'break_start_time' | 'break_end_time',
    value: string
  ) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.day_of_week === day ? { ...item, [field]: value } : item
      )
    );
    setHasChanges(true);
  };

  const handleBreakToggle = (day: DayOfWeek) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.day_of_week === day
          ? {
            ...item,
            has_break: !item.has_break,
            break_start_time: !item.has_break ? '12:00' : undefined,
            break_end_time: !item.has_break ? '13:00' : undefined
          }
          : item
      )
    );
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!selectedStaffId) return;

    const updates = schedule
      .filter((item) => item.enabled) // Only save enabled days
      .map((item) => {
        const existing = professionalSchedules?.find((s) => s.day_of_week === item.day_of_week);

        return {
          id: existing?.id,
          staff_id: selectedStaffId,
          location_id,
          day_of_week: item.day_of_week,
          start_time: `${item.start_time}:00`,
          end_time: `${item.end_time}:00`,
          is_active: item.enabled,
          break_start_time: item.has_break && item.break_start_time ? `${item.break_start_time}:00` : undefined,
          break_end_time: item.has_break && item.break_end_time ? `${item.break_end_time}:00` : undefined,
          override_buffer_minutes: item.override_buffer,
          override_slot_duration: item.override_slot_duration
        };
      });

    await bulkUpdate.mutateAsync({ staff_id: selectedStaffId, schedules: updates });
    setHasChanges(false);
  };

  const handleReset = () => {
    if (selectedStaffId && professionalSchedules) {
      const weekSchedule: ProfessionalScheduleDay[] = DAY_NAMES.map((_, day) => {
        const existing = professionalSchedules.find((s) => s.day_of_week === day);

        if (existing) {
          return {
            day_of_week: day as DayOfWeek,
            enabled: existing.is_active,
            start_time: existing.start_time.substring(0, 5),
            end_time: existing.end_time.substring(0, 5),
            has_break: !!(existing.break_start_time && existing.break_end_time),
            break_start_time: existing.break_start_time?.substring(0, 5),
            break_end_time: existing.break_end_time?.substring(0, 5),
            override_buffer: existing.override_buffer_minutes ?? undefined,
            override_slot_duration: existing.override_slot_duration ?? undefined
          };
        }

        return {
          day_of_week: day as DayOfWeek,
          enabled: false,
          start_time: '09:00',
          end_time: '18:00',
          has_break: false
        };
      });

      setSchedule(weekSchedule);
      setHasChanges(false);
    }
  };

  const selectedTeamMember = staff?.find((s) => s.id === selectedStaffId);

  if (isLoadingStaff) {
    return (
      <CardWrapper>
        <CardWrapper.Body>
          <Stack gap="4" align="center" py="8">
            <Text color="text.muted">Loading staff...</Text>
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
            <Icon icon={UserCircleIcon} size="lg" color="teal.600" />
            <Text fontSize="xl" fontWeight="bold">
              Professional Availability
            </Text>
          </Stack>
          <Text fontSize="sm" color="text.muted">
            Configure individual schedules for each professional
          </Text>
        </Stack>

        {hasChanges && selectedStaffId && (
          <Stack direction="row" gap="2" display={{ base: 'none', md: 'flex' }}>
            <Button size="sm" variant="ghost" onClick={handleReset}>
              Reset
            </Button>
            <Button
              size="sm"
              colorPalette="teal"
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
        title="Professional Schedules"
        description="Set specific availability for each team member. Individual schedules override business hours."
      />

      {/* Professional Selector */}
      <CardWrapper>
        <CardWrapper.Body>
          <Field.Root>
            <Field.Label>Select Professional</Field.Label>
            <NativeSelect.Root
              value={selectedStaffId}
              onValueChange={(details) => handleStaffChange(details.value)}
            >
              <NativeSelect.Field placeholder="Choose a professional...">
                <option value="">-- Select Professional --</option>
                {staff?.map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.first_name} {member.last_name} - {member.position}
                  </option>
                ))}
              </NativeSelect.Field>
            </NativeSelect.Root>
            <Field.HelperText>
              Configure weekly schedule and break times for this professional
            </Field.HelperText>
          </Field.Root>
        </CardWrapper.Body>
      </CardWrapper>

      {/* Schedule Table (only show if professional selected) */}
      {selectedStaffId && (
        <>
          {selectedTeamMember && (
            <CardWrapper variant="subtle" borderLeft="4px solid" borderColor="teal.500">
              <CardWrapper.Body>
                <Stack direction="row" gap="3" align="center">
                  <Icon icon={UserCircleIcon} size="lg" color="teal.600" />
                  <Stack gap="1">
                    <Text fontWeight="semibold">
                      {selectedTeamMember.first_name} {selectedTeamMember.last_name}
                    </Text>
                    <Stack direction="row" gap="2">
                      <Badge colorPalette="teal" size="sm">
                        {selectedTeamMember.position}
                      </Badge>
                      <Text fontSize="sm" color="text.muted">
                        {selectedTeamMember.email}
                      </Text>
                    </Stack>
                  </Stack>
                </Stack>
              </CardWrapper.Body>
            </CardWrapper>
          )}

          {isLoadingSchedules ? (
            <CardWrapper>
              <CardWrapper.Body>
                <Stack gap="4" align="center" py="8">
                  <Text color="text.muted">Loading schedule...</Text>
                </Stack>
              </CardWrapper.Body>
            </CardWrapper>
          ) : (
            <CardWrapper>
              <CardWrapper.Body p="0">
                <Table.Root size="sm" variant="line">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeader width="120px">Day</Table.ColumnHeader>
                      <Table.ColumnHeader width="100px">Active</Table.ColumnHeader>
                      <Table.ColumnHeader>Work Hours</Table.ColumnHeader>
                      <Table.ColumnHeader>Break Time</Table.ColumnHeader>
                      <Table.ColumnHeader>Total Hours</Table.ColumnHeader>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {schedule.map((item) => {
                      const [startHour, startMin] = item.start_time.split(':').map(Number);
                      const [endHour, endMin] = item.end_time.split(':').map(Number);
                      let totalMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);

                      // Subtract break time if exists
                      if (item.has_break && item.break_start_time && item.break_end_time) {
                        const [breakStartHour, breakStartMin] = item.break_start_time.split(':').map(Number);
                        const [breakEndHour, breakEndMin] = item.break_end_time.split(':').map(Number);
                        const breakMinutes = (breakEndHour * 60 + breakEndMin) - (breakStartHour * 60 + breakStartMin);
                        totalMinutes -= breakMinutes;
                      }

                      const hours = Math.floor(totalMinutes / 60);
                      const minutes = totalMinutes % 60;

                      return (
                        <Table.Row key={item.day_of_week} opacity={item.enabled ? 1 : 0.5}>
                          {/* Day Name */}
                          <Table.Cell>
                            <Text fontWeight="medium">{DAY_NAMES[item.day_of_week]}</Text>
                          </Table.Cell>

                          {/* Active Toggle */}
                          <Table.Cell>
                            <Stack direction="row" gap="2" align="center">
                              <Switch
                                checked={item.enabled}
                                onCheckedChange={() => handleDayToggle(item.day_of_week)}
                                colorPalette={item.enabled ? 'green' : 'gray'}
                              />
                              {item.enabled ? (
                                <Icon icon={CheckCircleIcon} size="sm" color="green.600" />
                              ) : (
                                <Icon icon={XCircleIcon} size="sm" color="gray.400" />
                              )}
                            </Stack>
                          </Table.Cell>

                          {/* Work Hours */}
                          <Table.Cell>
                            <Stack direction="row" gap="2" align="center">
                              <Input
                                type="time"
                                value={item.start_time}
                                onChange={(e) =>
                                  handleTimeChange(item.day_of_week, 'start_time', e.target.value)
                                }
                                size="sm"
                                disabled={!item.enabled}
                                width="110px"
                              />
                              <Text fontSize="sm">to</Text>
                              <Input
                                type="time"
                                value={item.end_time}
                                onChange={(e) =>
                                  handleTimeChange(item.day_of_week, 'end_time', e.target.value)
                                }
                                size="sm"
                                disabled={!item.enabled}
                                width="110px"
                              />
                            </Stack>
                          </Table.Cell>

                          {/* Break Time */}
                          <Table.Cell>
                            <Stack gap="2">
                              <Switch
                                checked={item.has_break}
                                onCheckedChange={() => handleBreakToggle(item.day_of_week)}
                                disabled={!item.enabled}
                                size="sm"
                              >
                                <Text fontSize="xs">Has break</Text>
                              </Switch>

                              {item.has_break && item.enabled && (
                                <Stack direction="row" gap="1" align="center">
                                  <Input
                                    type="time"
                                    value={item.break_start_time || '12:00'}
                                    onChange={(e) =>
                                      handleTimeChange(
                                        item.day_of_week,
                                        'break_start_time',
                                        e.target.value
                                      )
                                    }
                                    size="sm"
                                    width="90px"
                                  />
                                  <Text fontSize="xs">-</Text>
                                  <Input
                                    type="time"
                                    value={item.break_end_time || '13:00'}
                                    onChange={(e) =>
                                      handleTimeChange(
                                        item.day_of_week,
                                        'break_end_time',
                                        e.target.value
                                      )
                                    }
                                    size="sm"
                                    width="90px"
                                  />
                                </Stack>
                              )}
                            </Stack>
                          </Table.Cell>

                          {/* Total Hours */}
                          <Table.Cell>
                            {item.enabled ? (
                              <Text fontSize="sm" fontWeight="medium" color="teal.600">
                                {hours}h {minutes > 0 ? `${minutes}m` : ''}
                              </Text>
                            ) : (
                              <Text fontSize="sm" color="text.muted">
                                Off
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
          )}

          {/* Save Button (mobile) */}
          {hasChanges && (
            <Stack direction="row" gap="2" display={{ base: 'flex', md: 'none' }}>
              <Button flex="1" variant="outline" onClick={handleReset}>
                Reset
              </Button>
              <Button
                flex="1"
                colorPalette="teal"
                onClick={handleSave}
                loading={bulkUpdate.isPending}
              >
                Save Changes
              </Button>
            </Stack>
          )}
        </>
      )}

      {!selectedStaffId && (
        <CardWrapper>
          <CardWrapper.Body>
            <Stack gap="3" align="center" py="12">
              <Icon icon={UserCircleIcon} size="2xl" color="text.muted" />
              <Stack gap="1" align="center">
                <Text fontWeight="medium" color="text.muted">
                  No Professional Selected
                </Text>
                <Text fontSize="sm" color="text.muted" textAlign="center">
                  Select a professional from the dropdown to configure their weekly availability
                </Text>
              </Stack>
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>
      )}
    </Stack>
  );
}
