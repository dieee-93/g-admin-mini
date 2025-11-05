/**
 * Availability Configuration Tab
 * Based on: IMPLEMENTATION_ROADMAP_DISTRIBUTED_FEATURES.md Week 3
 * Main tab component integrating all availability configuration features
 */

import { useState } from 'react';
import { Stack, Text, Grid } from '@chakra-ui/react';
import { Tabs, CardWrapper, Icon, Badge } from '@/shared/ui';
import {
  ClockIcon,
  Cog6ToothIcon,
  UserGroupIcon} from '@heroicons/react/24/outline';
import { BusinessHoursConfig } from './BusinessHoursConfig';
import { BookingRulesConfig } from './BookingRulesConfig';
import { ProfessionalAvailabilityManager } from './ProfessionalAvailabilityManager';
import { useAvailabilityConfigSummary } from '../hooks/useAvailability';

interface AvailabilityTabProps {
  location_id?: string;
}

export function AvailabilityTab({ location_id }: AvailabilityTabProps) {
  const [activeSubTab, setActiveSubTab] = useState('business-hours');
  const { data: summary } = useAvailabilityConfigSummary(location_id);

  return (
    <Stack gap="6">
      {/* Header */}
      <Stack gap="3">
        <Stack direction="row" justify="space-between" align="center">
          <Stack gap="1">
            <Text fontSize="2xl" fontWeight="bold">
              Appointment Availability
            </Text>
            <Text color="text.muted">
              Configure business hours, booking rules, and professional schedules for appointments
            </Text>
          </Stack>
        </Stack>

        {/* Summary Cards */}
        {summary && (
          <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap="4">
            <CardWrapper variant="subtle">
              <CardWrapper.Body>
                <Stack gap="1">
                  <Text fontSize="xs" color="text.muted" fontWeight="medium">
                    BUSINESS DAYS
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {summary.total_business_days}
                  </Text>
                </Stack>
              </CardWrapper.Body>
            </CardWrapper>

            <CardWrapper variant="subtle">
              <CardWrapper.Body>
                <Stack gap="1">
                  <Text fontSize="xs" color="text.muted" fontWeight="medium">
                    PROFESSIONALS
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="teal.600">
                    {summary.total_professionals}
                  </Text>
                </Stack>
              </CardWrapper.Body>
            </CardWrapper>

            <CardWrapper variant="subtle">
              <CardWrapper.Body>
                <Stack gap="1">
                  <Text fontSize="xs" color="text.muted" fontWeight="medium">
                    AVG HOURS/DAY
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                    {summary.average_hours_per_day}h
                  </Text>
                </Stack>
              </CardWrapper.Body>
            </CardWrapper>

            <CardWrapper variant="subtle">
              <CardWrapper.Body>
                <Stack gap="1">
                  <Text fontSize="xs" color="text.muted" fontWeight="medium">
                    MOST AVAILABLE
                  </Text>
                  <Text fontSize="lg" fontWeight="bold" color="green.600">
                    {summary.most_available_day}
                  </Text>
                </Stack>
              </CardWrapper.Body>
            </CardWrapper>
          </Grid>
        )}
      </Stack>

      {/* Configuration Tabs */}
      <Tabs.Root value={activeSubTab} onValueChange={(details) => setActiveSubTab(details.value)}>
        <Tabs.List>
          <Tabs.Trigger value="business-hours">
            <Icon icon={ClockIcon} size="sm" />
            Business Hours
          </Tabs.Trigger>
          <Tabs.Trigger value="booking-rules">
            <Icon icon={Cog6ToothIcon} size="sm" />
            Booking Rules
          </Tabs.Trigger>
          <Tabs.Trigger value="professionals">
            <Icon icon={UserGroupIcon} size="sm" />
            Professionals
            {summary && summary.total_professionals > 0 && (
              <Badge colorPalette="teal" size="sm" ml="2">
                {summary.total_professionals}
              </Badge>
            )}
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="business-hours">
          <BusinessHoursConfig location_id={location_id} />
        </Tabs.Content>

        <Tabs.Content value="booking-rules">
          <BookingRulesConfig location_id={location_id} />
        </Tabs.Content>

        <Tabs.Content value="professionals">
          <ProfessionalAvailabilityManager location_id={location_id} />
        </Tabs.Content>
      </Tabs.Root>
    </Stack>
  );
}
