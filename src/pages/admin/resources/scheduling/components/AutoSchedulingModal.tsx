/**
 * Auto-Scheduling Modal Component
 * Interface for configuring and executing intelligent auto-scheduling
 */

import { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Switch,
  Progress,
  Alert,
  Separator,
  Badge,
  SimpleGrid,
  Dialog,
  Fieldset,
  Slider,
  Icon,
  InputField,
  CardWrapper
} from '@/shared/ui';
import { SelectField } from '@/shared/ui';
import {
  Cog6ToothIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UsersIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  LightBulbIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

import { autoSchedulingEngine, type SchedulingConstraints, type SchedulingSolution } from '../../../../../services/scheduling/autoSchedulingEngine';
import { notify } from '@/lib/notifications';

import { logger } from '@/lib/logging';
interface AutoSchedulingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduleGenerated: (solution: SchedulingSolution) => void;
  currentWeek: string;
}

interface SchedulingSettings {
  startDate: string;
  endDate: string;
  maxHoursPerEmployee: number;
  maxWeeklyBudget: number;
  overtimeThreshold: number;
  balanceWorkload: boolean;
  minimizeCost: boolean;
  preferExperienced: boolean;
  autoApprove: boolean;
}

export function AutoSchedulingModal({
  isOpen,
  onClose,
  onScheduleGenerated,
  currentWeek
}: AutoSchedulingModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentStep, setCurrentStep] = useState<'settings' | 'preview' | 'complete'>('settings');
  const [progress, setProgress] = useState(0);
  const [solution, setSolution] = useState<SchedulingSolution | null>(null);
  
  const [settings, setSettings] = useState<SchedulingSettings>({
    startDate: currentWeek,
    endDate: getEndOfWeek(currentWeek),
    maxHoursPerEmployee: 40,
    maxWeeklyBudget: 15000,
    overtimeThreshold: 8,
    balanceWorkload: true,
    minimizeCost: false,
    preferExperienced: true,
    autoApprove: false
  });

  function getEndOfWeek(startDate: string): string {
    const date = new Date(startDate);
    date.setDate(date.getDate() + 6);
    return date.toISOString().split('T')[0];
  }

  const handleGenerateSchedule = async () => {
    try {
      setIsGenerating(true);
      setProgress(10);
      
      // Prepare constraints
      const constraints: SchedulingConstraints = {
        employee_availability: [], // Will be fetched by the engine
        min_staff_per_position: {
          'Server': 2,
          'Cook': 2,
          'Bartender': 1,
          'Host': 1
        },
        max_hours_per_employee: settings.maxHoursPerEmployee,
        min_hours_between_shifts: 8,
        max_consecutive_days: 6,
        max_weekly_labor_budget: settings.maxWeeklyBudget,
        overtime_threshold: settings.overtimeThreshold,
        prefer_experienced_staff: settings.preferExperienced,
        balance_workload: settings.balanceWorkload,
        minimize_labor_cost: settings.minimizeCost
      };

      setProgress(30);
      logger.info('API', '🤖 Starting auto-scheduling with constraints:', constraints);

      // Generate schedule
      const generatedSolution = await autoSchedulingEngine.generateOptimalSchedule(
        settings.startDate,
        settings.endDate,
        constraints
      );

      setProgress(80);
      setSolution(generatedSolution);
      setProgress(100);
      
      if (generatedSolution.success) {
        notify.success({
          title: 'Schedule Generated Successfully',
          description: `Created ${generatedSolution.schedule.length} shifts with ${generatedSolution.metrics.coverage_rate.toFixed(1)}% coverage`
        });
        setCurrentStep('preview');
      } else {
        notify.warning({
          title: 'Schedule Generated with Issues',
          description: `${generatedSolution.conflicts.length} conflicts detected. Review before applying.`
        });
        setCurrentStep('preview');
      }

    } catch (error) {
      logger.error('API', 'Auto-scheduling error:', error);
      notify.error({
        title: 'Scheduling Failed',
        description: 'Unable to generate schedule. Please try again or adjust constraints.'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApplySchedule = () => {
    if (!solution) return;
    
    onScheduleGenerated(solution);
    setCurrentStep('complete');
    
    notify.success({
      title: 'Schedule Applied',
      description: 'The generated schedule has been applied successfully!'
    });
  };

  const renderSettingsStep = () => (
    <VStack align="stretch" gap={6}>
      <Text fontSize="lg" fontWeight="semibold">Configure Auto-Scheduling</Text>
      
      {/* Date Range */}
      <CardWrapper>
        <CardWrapper.Header>
          <HStack>
            <Icon icon={CalendarIcon} size="md" />
            <Text fontWeight="medium">Date Range</Text>
          </HStack>
        </CardWrapper.Header>
        <CardWrapper.Body>
          <HStack gap={4}>
            <Box flex={1}>
              <Text fontSize="sm" mb={1}>Start Date</Text>
              <InputField
                type="date"
                value={settings.startDate}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  startDate: e.target.value,
                  endDate: getEndOfWeek(e.target.value)
                }))}
              />
            </Box>
            <Box flex={1}>
              <Text fontSize="sm" mb={1}>End Date</Text>
              <InputField
                type="date"
                value={settings.endDate}
                onChange={(e) => setSettings(prev => ({ ...prev, endDate: e.target.value }))}
              />
            </Box>
          </HStack>
        </CardWrapper.Body>
      </CardWrapper>

      {/* Labor Constraints */}
      <CardWrapper>
        <CardWrapper.Header>
          <HStack>
            <Icon icon={UsersIcon} size="md" />
            <Text fontWeight="medium">Labor Constraints</Text>
          </HStack>
        </CardWrapper.Header>
        <CardWrapper.Body>
          <VStack align="stretch" spacing={4}>
            <Box>
              <HStack justify="space-between" mb={2}>
                <Text fontSize="sm">Max Hours per Employee</Text>
                <Text fontSize="sm" color="blue.500" fontWeight="medium">
                  {settings.maxHoursPerEmployee}h
                </Text>
              </HStack>
              <Slider.Root
                value={[settings.maxHoursPerEmployee]}
                onValueChange={(e) => setSettings(prev => ({ ...prev, maxHoursPerEmployee: e.value[0] }))}
                min={20}
                max={60}
                step={5}
              >
                <Slider.Control>
                  <Slider.Track>
                    <Slider.Range />
                  </Slider.Track>
                  <Slider.Thumb index={0}>
                    <Slider.HiddenInput />
                  </Slider.Thumb>
                </Slider.Control>
              </Slider.Root>
            </Box>
            
            <Box>
              <HStack justify="space-between" mb={2}>
                <Text fontSize="sm">Overtime Threshold</Text>
                <Text fontSize="sm" color="orange.500" fontWeight="medium">
                  {settings.overtimeThreshold}h
                </Text>
              </HStack>
              <Slider.Root
                value={[settings.overtimeThreshold]}
                onValueChange={(e) => setSettings(prev => ({ ...prev, overtimeThreshold: e.value[0] }))}
                min={6}
                max={12}
                step={0.5}
              >
                <Slider.Control>
                  <Slider.Track>
                    <Slider.Range />
                  </Slider.Track>
                  <Slider.Thumb index={0}>
                    <Slider.HiddenInput />
                  </Slider.Thumb>
                </Slider.Control>
              </Slider.Root>
            </Box>
          </VStack>
        </CardWrapper.Body>
      </CardWrapper>

      {/* Budget Constraints */}
      <CardWrapper>
        <CardWrapper.Header>
          <HStack>
            <Icon icon={CurrencyDollarIcon} size="md" />
            <Text fontWeight="medium">Budget Constraints</Text>
          </HStack>
        </CardWrapper.Header>
        <CardWrapper.Body>
          <Box>
            <Text fontSize="sm" mb={2}>Maximum Weekly Labor Budget</Text>
            <InputField
              type="number"
              value={settings.maxWeeklyBudget}
              onChange={(e) => setSettings(prev => ({ ...prev, maxWeeklyBudget: Number(e.target.value) }))}
              placeholder="15000"
            />
          </Box>
        </CardWrapper.Body>
      </CardWrapper>

      {/* Optimization Preferences */}
      <CardWrapper>
        <CardWrapper.Header>
          <HStack>
            <Icon icon={ChartBarIcon} size="md" />
            <Text fontWeight="medium">Optimization Preferences</Text>
          </HStack>
        </CardWrapper.Header>
        <CardWrapper.Body>
          <VStack align="stretch" spacing={3}>
            <HStack justify="space-between">
              <VStack align="start" gap={0}>
                <Text fontSize="sm">Balance Workload</Text>
                <Text fontSize="xs" color="gray.600">Distribute hours evenly among employees</Text>
              </VStack>
              <Switch.Root
                checked={settings.balanceWorkload}
                onCheckedChange={(e) => setSettings(prev => ({ ...prev, balanceWorkload: e.checked }))}
              >
                <Switch.HiddenInput />
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch.Root>
            </HStack>

            <HStack justify="space-between">
              <VStack align="start" gap={0}>
                <Text fontSize="sm">Minimize Cost</Text>
                <Text fontSize="xs" color="gray.600">Prioritize lower-cost employees</Text>
              </VStack>
              <Switch.Root
                checked={settings.minimizeCost}
                onCheckedChange={(e) => setSettings(prev => ({ ...prev, minimizeCost: e.checked }))}
              >
                <Switch.HiddenInput />
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch.Root>
            </HStack>

            <HStack justify="space-between">
              <VStack align="start" gap={0}>
                <Text fontSize="sm">Prefer Experienced Staff</Text>
                <Text fontSize="xs" color="gray.600">Prioritize senior employees for busy shifts</Text>
              </VStack>
              <Switch.Root
                checked={settings.preferExperienced}
                onCheckedChange={(e) => setSettings(prev => ({ ...prev, preferExperienced: e.checked }))}
              >
                <Switch.HiddenInput />
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch.Root>
            </HStack>

            <Separator />
            
            <HStack justify="space-between">
              <VStack align="start" gap={0}>
                <Text fontSize="sm">Auto-Apply Schedule</Text>
                <Text fontSize="xs" color="gray.600">Apply schedule without preview</Text>
              </VStack>
              <Switch.Root
                checked={settings.autoApprove}
                onCheckedChange={(e) => setSettings(prev => ({ ...prev, autoApprove: e.checked }))}
              >
                <Switch.HiddenInput />
                <Switch.Control>
                  <Switch.Thumb />
                </Switch.Control>
              </Switch.Root>
            </HStack>
          </VStack>
        </CardWrapper.Body>
      </CardWrapper>
    </VStack>
  );

  const renderPreviewStep = () => {
    if (!solution) return null;

    return (
      <VStack align="stretch" spacing={6}>
        <HStack justify="space-between">
          <Text fontSize="lg" fontWeight="semibold">Generated Schedule Preview</Text>
          <Badge 
            colorScheme={solution.success ? 'green' : 'orange'}
            fontSize="sm"
          >
            {solution.success ? 'Optimized' : 'Needs Review'}
          </Badge>
        </HStack>

        {/* Metrics Overview */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <CardWrapper size="sm">
            <CardWrapper.Body textAlign="center" py={3}>
              <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                {solution.metrics.total_shifts}
              </Text>
              <Text fontSize="xs" color="gray.600">Total Shifts</Text>
            </CardWrapper.Body>
          </CardWrapper>
          
          <CardWrapper size="sm">
            <CardWrapper.Body textAlign="center" py={3}>
              <Text fontSize="2xl" fontWeight="bold" color="green.500">
                {solution.metrics.coverage_rate.toFixed(1)}%
              </Text>
              <Text fontSize="xs" color="gray.600">Coverage Rate</Text>
            </CardWrapper.Body>
          </CardWrapper>
          
          <CardWrapper size="sm">
            <CardWrapper.Body textAlign="center" py={3}>
              <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                ${solution.metrics.total_cost.toLocaleString()}
              </Text>
              <Text fontSize="xs" color="gray.600">Total Cost</Text>
            </CardWrapper.Body>
          </CardWrapper>
          
          <CardWrapper size="sm">
            <CardWrapper.Body textAlign="center" py={3}>
              <Text fontSize="2xl" fontWeight="bold" color={solution.metrics.overtime_hours > 0 ? 'orange.500' : 'green.500'}>
                {solution.metrics.overtime_hours}h
              </Text>
              <Text fontSize="xs" color="gray.600">Overtime</Text>
            </CardWrapper.Body>
          </CardWrapper>
        </SimpleGrid>

        {/* Conflicts */}
        {solution.conflicts.length > 0 && (
          <CardWrapper>
            <CardWrapper.Header>
              <HStack>
                <Icon icon={ExclamationTriangleIcon} size="md" />
                <Text fontWeight="medium">Conflicts & Issues</Text>
                <Badge colorScheme="orange">{solution.conflicts.length}</Badge>
              </HStack>
            </CardWrapper.Header>
            <CardWrapper.Body>
              <VStack align="stretch" gap={2}>
                {solution.conflicts.slice(0, 5).map((conflict, index) => (
                  <Alert.Root key={index} status={conflict.severity === 'critical' ? 'error' : 'warning'}>
                    <Alert.Indicator />
                    <Alert.Content>
                      <Alert.Title>{conflict.message}</Alert.Title>
                      <Alert.Description>{conflict.suggested_resolution}</Alert.Description>
                    </Alert.Content>
                  </Alert.Root>
                ))}
                {solution.conflicts.length > 5 && (
                  <Text fontSize="sm" color="gray.600">
                    ... and {solution.conflicts.length - 5} more conflicts
                  </Text>
                )}
              </VStack>
            </CardWrapper.Body>
          </CardWrapper>
        )}

        {/* Recommendations */}
        {solution.recommendations.length > 0 && (
          <CardWrapper>
            <CardWrapper.Header>
              <HStack>
                <Icon icon={LightBulbIcon} size="md" />
                <Text fontWeight="medium">Recommendations</Text>
              </HStack>
            </CardWrapper.Header>
            <CardWrapper.Body>
              <VStack align="stretch" gap={2}>
                {solution.recommendations.map((rec, index) => (
                  <HStack key={index}>
                    <Box w={2} h={2} bg="blue.400" borderRadius="full" mt={2} />
                    <Text fontSize="sm">{rec}</Text>
                  </HStack>
                ))}
              </VStack>
            </CardWrapper.Body>
          </CardWrapper>
        )}
      </VStack>
    );
  };

  const renderCompleteStep = () => (
    <VStack align="stretch" gap={6} textAlign="center">
      <Icon icon={CheckCircleIcon} size="3xl" color="var(--chakra-colors-green-500)" style={{marginLeft: 'auto', marginRight: 'auto'}} />
      <Text fontSize="xl" fontWeight="semibold">Schedule Applied Successfully!</Text>
      <Text color="gray.600">
        Your optimized schedule has been generated and applied. 
        You can view and manage it in the Weekly Schedule view.
      </Text>
      
      {solution && (
        <SimpleGrid columns={2} spacing={4} mt={4}>
          <Box textAlign="center">
            <Text fontSize="2xl" fontWeight="bold" color="green.500">
              {solution.metrics.total_shifts}
            </Text>
            <Text fontSize="sm" color="gray.600">Shifts Created</Text>
          </Box>
          <Box textAlign="center">
            <Text fontSize="2xl" fontWeight="bold" color="blue.500">
              {solution.metrics.coverage_rate.toFixed(1)}%
            </Text>
            <Text fontSize="sm" color="gray.600">Coverage Achieved</Text>
          </Box>
        </SimpleGrid>
      )}
    </VStack>
  );

  return (
    <Dialog.Root
      open={isOpen}
      onOpenChange={(details) => !details.open && onClose()}
      size={{ base: "full", md: "xl" }}
    >
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content
          maxW={{ base: "100%", md: "900px" }}
          maxH={{ base: "100vh", md: "90vh" }}
          w="full"
          overflowY="auto"
        >
          <Dialog.CloseTrigger />
          <Dialog.Header>
            <HStack>
              <Icon icon={Cog6ToothIcon} size="lg" />
              <Text>Auto-Schedule Generator</Text>
            </HStack>
          </Dialog.Header>

          <Dialog.Body>
            {/* Progress Bar */}
            {isGenerating && (
              <Box mb={6}>
                <Progress.Root value={progress} colorPalette="blue">
                  <Progress.Track>
                    <Progress.Range />
                  </Progress.Track>
                </Progress.Root>
                <Text fontSize="sm" color="gray.600" mt={1}>
                  {progress < 30 ? 'Analyzing constraints...' :
                   progress < 80 ? 'Generating optimal schedule...' :
                   'Finalizing schedule...'}
                </Text>
              </Box>
            )}

            {/* Step Content */}
            {currentStep === 'settings' && renderSettingsStep()}
            {currentStep === 'preview' && renderPreviewStep()}
            {currentStep === 'complete' && renderCompleteStep()}
          </Dialog.Body>

          <Dialog.Footer>
            <HStack justify="space-between" w="full">
              <Button variant="outline" onClick={onClose}>
                {currentStep === 'complete' ? 'Close' : 'Cancel'}
              </Button>

              <HStack>
                {currentStep === 'preview' && (
                  <Button
                    variant="outline"
                    onClick={() => setCurrentStep('settings')}
                  >
                    Back to Settings
                  </Button>
                )}

                {currentStep === 'settings' && (
                  <Button
                    colorScheme="blue"
                    onClick={handleGenerateSchedule}
                    loading={isGenerating}
                  >
                    {isGenerating ? 'Generating...' : 'Generate Schedule'}
                  </Button>
                )}

                {currentStep === 'preview' && solution && (
                  <Button
                    colorScheme="green"
                    onClick={handleApplySchedule}
                    disabled={!solution.success && solution.conflicts.filter(c => c.severity === 'critical').length > 0}
                  >
                    Apply Schedule
                  </Button>
                )}
              </HStack>
            </HStack>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}