// SchedulingPage.tsx - Pure Orchestrator Pattern
// Following G-Admin Mini architecture standards

import React from 'react';

// Design System Components
import {
  // Layout & Structure
  Stack,
  VStack,
  HStack,

  // Typography
  Typography,

  // Components
  CardWrapper,
  Badge,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  SimpleGrid
} from '@/shared/ui';

import { Icon } from '@/shared/ui';
import {
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  CurrencyDollarIcon,
  UserMinusIcon
} from '@heroicons/react/24/outline';

// Hooks
import { useSchedulingPage } from './hooks';

// Components
import {
  WeeklyScheduleView,
  TimeOffManager,
  CoveragePlanner,
  LaborCostTracker,
  RealTimeLaborTracker,
  AutoSchedulingModal
} from './components';

export default function SchedulingPage() {
  // All logic delegated to the orchestrator hook
  const {
    viewState,
    schedulingStats,
    isAutoSchedulingOpen,
    handleTabChange,
    setViewState,
    setIsAutoSchedulingOpen,
    handleScheduleGenerated
  } = useSchedulingPage();

  return (
    <Stack gap="lg" align="stretch">
      {/* Header with KPIs - Using hook data */}
      <CardWrapper variant="elevated" padding="md">
        <CardWrapper.Body>
          <VStack gap="md" align="start">
            <HStack gap="sm">
              <Icon icon={CalendarIcon} size="lg" color="blue.600" />
              <VStack align="start" gap="xs">
                <HStack gap="sm">
                  <Typography variant="title">Staff Scheduling</Typography>
                  <Badge colorPalette="blue">Week View</Badge>
                  {schedulingStats.understaffed_shifts > 0 && (
                    <Badge colorPalette="error">
                      {schedulingStats.understaffed_shifts} Understaffed
                    </Badge>
                  )}
                </HStack>
                <Typography variant="body" color="text.muted">
                  Manage employee schedules, time-off requests, and labor costs
                </Typography>
              </VStack>
            </HStack>

            {/* KPI Row */}
            <SimpleGrid columns={{ base: 2, md: 4 }} gap="md" width="full">
              <CardWrapper variant="outline" padding="sm">
                <CardWrapper.Body textAlign="center">
                  <Typography variant="display" color="blue.500">
                    {schedulingStats.total_shifts_this_week}
                  </Typography>
                  <Typography variant="caption" color="text.muted">Shifts This Week</Typography>
                </CardWrapper.Body>
              </CardWrapper>

              <CardWrapper variant="outline" padding="sm">
                <CardWrapper.Body textAlign="center">
                  <Typography variant="display" color="green.500">
                    {schedulingStats.coverage_percentage}%
                  </Typography>
                  <Typography variant="caption" color="text.muted">Coverage Rate</Typography>
                </CardWrapper.Body>
              </CardWrapper>

              <CardWrapper variant="outline" padding="sm">
                <CardWrapper.Body textAlign="center">
                  <Typography variant="display" color="orange.500">
                    {schedulingStats.pending_time_off}
                  </Typography>
                  <Typography variant="caption" color="text.muted">Pending Requests</Typography>
                </CardWrapper.Body>
              </CardWrapper>

              <CardWrapper variant="outline" padding="sm">
                <CardWrapper.Body textAlign="center">
                  <Typography variant="display" color="purple.500">
                    ${schedulingStats.labor_cost_this_week.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.muted">Labor Cost</Typography>
                </CardWrapper.Body>
              </CardWrapper>
            </SimpleGrid>
          </VStack>
        </CardWrapper.Body>
      </CardWrapper>

      {/* Tabbed Layout for Sections */}
      <Tabs>
        <TabList>
          <Tab onClick={() => handleTabChange('schedule')}>
            <HStack gap="sm">
              <Icon icon={CalendarIcon} size="sm" />
              <Typography>Weekly Schedule</Typography>
              <Badge size="sm" colorPalette="blue">
                {schedulingStats.employees_scheduled}
              </Badge>
            </HStack>
          </Tab>

          <Tab onClick={() => handleTabChange('timeoff')}>
            <HStack gap="sm">
              <Icon icon={UserMinusIcon} size="sm" />
              <Typography>Time Off</Typography>
              {schedulingStats.pending_time_off > 0 && (
                <Badge size="sm" colorPalette="orange">
                  {schedulingStats.pending_time_off}
                </Badge>
              )}
            </HStack>
          </Tab>

          <Tab onClick={() => handleTabChange('coverage')}>
            <HStack gap="sm">
              <Icon icon={UsersIcon} size="sm" />
              <Typography>Coverage Planning</Typography>
              {schedulingStats.understaffed_shifts > 0 && (
                <Badge size="sm" colorPalette="error">
                  {schedulingStats.understaffed_shifts}
                </Badge>
              )}
            </HStack>
          </Tab>

          <Tab onClick={() => handleTabChange('costs')}>
            <HStack gap="sm">
              <Icon icon={CurrencyDollarIcon} size="sm" />
              <Typography>Labor Costs</Typography>
              {schedulingStats.overtime_hours > 0 && (
                <Badge size="sm" colorPalette="warning">
                  {schedulingStats.overtime_hours}h OT
                </Badge>
              )}
            </HStack>
          </Tab>

          <Tab onClick={() => handleTabChange('realtime')}>
            <HStack gap="sm">
              <Icon icon={ClockIcon} size="sm" />
              <Typography>Real-Time</Typography>
              <Badge size="sm" colorPalette="success" variant="subtle">
                LIVE
              </Badge>
            </HStack>
          </Tab>
        </TabList>

        <TabPanels>
          <TabPanel>
            <WeeklyScheduleView
              viewState={viewState}
              onViewStateChange={setViewState}
            />
          </TabPanel>

          <TabPanel>
            <TimeOffManager
              pendingCount={schedulingStats.pending_time_off}
              approvedCount={schedulingStats.approved_requests}
            />
          </TabPanel>

          <TabPanel>
            <CoveragePlanner
              understaffedShifts={schedulingStats.understaffed_shifts}
              coveragePercentage={schedulingStats.coverage_percentage}
            />
          </TabPanel>

          <TabPanel>
            <LaborCostTracker
              weeklyTotal={schedulingStats.labor_cost_this_week}
              overtimeHours={schedulingStats.overtime_hours}
            />
          </TabPanel>

          <TabPanel>
            <RealTimeLaborTracker
              selectedDate={new Date().toISOString().split('T')[0]}
              showAlerts={true}
              compactMode={false}
            />
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Auto-Scheduling Modal */}
      <AutoSchedulingModal
        isOpen={isAutoSchedulingOpen}
        onClose={() => setIsAutoSchedulingOpen(false)}
        onScheduleGenerated={handleScheduleGenerated}
        currentWeek={viewState.selectedWeek}
      />
    </Stack>
  );
}