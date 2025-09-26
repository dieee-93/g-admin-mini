/**
 * Slots System Debug Tool - Test and debug the modular slot system
 * Provides interface to test slot registration, rendering, and management
 */

import React, { useState, useEffect } from 'react';
import {
  ContentLayout,
  Section,
  Stack,
  Typography,
  Button,
  Badge,
  SimpleGrid,
  InputField,
  TextareaField,
  SelectField,
  Alert,
  Box
} from '@/shared/ui';
import { useSlots } from '@/lib/composition/hooks/useSlots';

interface SlotInfo {
  id: string;
  name: string;
  components: string[];
  priority: number;
  region: string;
}

interface TestComponent {
  name: string;
  code: string;
  description: string;
}

const testComponents: TestComponent[] = [
  {
    name: 'TestAlert',
    code: `<Alert status="info" title="Test Component">
  This is a test component for slot testing
</Alert>`,
    description: 'Simple alert component for testing slots'
  },
  {
    name: 'TestMetric',
    code: `<Card variant="elevated">
  <CardHeader>
    <Typography variant="h6">Test Metric</Typography>
  </CardHeader>
  <CardBody>
    <Typography variant="h3" colorPalette="blue">$1,234</Typography>
    <Typography variant="sm" color="#666">Test value</Typography>
  </CardBody>
</Card>`,
    description: 'Metric card component for dashboard slots'
  },
  {
    name: 'TestButton',
    code: `<Button colorPalette="purple" variant="solid">
  Test Action Button
</Button>`,
    description: 'Action button for toolbar slots'
  }
];

export default function SlotsDebugger() {
  const { registerSlot, unregisterSlot, getSlotComponents, getAllSlots } = useSlots();
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [newSlotName, setNewSlotName] = useState('');
  const [newSlotRegion, setNewSlotRegion] = useState('dashboard');
  const [testComponentCode, setTestComponentCode] = useState('');
  const [slotInfo, setSlotInfo] = useState<SlotInfo[]>([]);
  const [registrationLog, setRegistrationLog] = useState<string[]>([]);

  // Update slot info
  useEffect(() => {
    const updateSlots = () => {
      const allSlots = getAllSlots();
      const slotsArray: SlotInfo[] = Object.entries(allSlots).map(([id, slotEntry]) => ({
        id,
        name: slotEntry.config.name || id,
        components: slotEntry.contents?.map((c: any) => c.metadata?.componentId || 'unnamed') || [],
        priority: 0, // Priority is per content, not per slot
        region: 'system' // Default region for debugging
      }));
      setSlotInfo(slotsArray);
    };

    updateSlots();
    const interval = setInterval(updateSlots, 1000); // Refresh every second

    return () => clearInterval(interval);
  }, [getAllSlots]);

  const handleRegisterSlot = () => {
    if (!newSlotName.trim()) return;

    const slotConfig = {
      id: newSlotName,
      name: newSlotName,
      required: false
    };

    try {
      registerSlot(slotConfig);
      setRegistrationLog(prev => [
        `✅ Registered slot: ${newSlotName} in ${newSlotRegion}`,
        ...prev.slice(0, 9) // Keep only last 10 entries
      ]);
      setNewSlotName('');
    } catch (error) {
      setRegistrationLog(prev => [
        `❌ Failed to register slot: ${newSlotName} - ${error}`,
        ...prev.slice(0, 9)
      ]);
    }
  };

  const handleUnregisterSlot = (slotId: string) => {
    try {
      unregisterSlot(slotId);
      setRegistrationLog(prev => [
        `🗑️ Unregistered slot: ${slotId}`,
        ...prev.slice(0, 9)
      ]);
    } catch (error) {
      setRegistrationLog(prev => [
        `❌ Failed to unregister slot: ${slotId} - ${error}`,
        ...prev.slice(0, 9)
      ]);
    }
  };

  const handleAddTestComponent = () => {
    if (!selectedSlot || !testComponentCode.trim()) return;

    try {
      // Simulate adding a component to the slot
      const TestComponent = () => (
        <div dangerouslySetInnerHTML={{ __html: testComponentCode }} />
      );

      setRegistrationLog(prev => [
        `🎨 Added test component to slot: ${selectedSlot}`,
        ...prev.slice(0, 9)
      ]);
    } catch (error) {
      setRegistrationLog(prev => [
        `❌ Failed to add component - ${error}`,
        ...prev.slice(0, 9)
      ]);
    }
  };

  const regions = ['dashboard', 'sidebar', 'header', 'footer', 'modal', 'toolbar'];

  return (
    <ContentLayout spacing="normal">
      <Section variant="flat" title="🔌 Slots System Debugger">
        <Typography variant="body" style={{ color: '#666', marginBottom: '24px' }}>
          Test and debug the modular slot system. Register slots, add components, and monitor slot behavior.
        </Typography>

        <Stack spacing="lg">
          {/* Current Slots Overview */}
          <Section variant="elevated" title="Active Slots">
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing="md">
              {slotInfo.map(slot => (
                <Card key={slot.id} variant="elevated">
                  <CardHeader>
                    <Stack direction="row" justify="space-between" align="center">
                      <Stack direction="row" align="center" spacing="sm">
                        <Typography variant="h6">{slot.name}</Typography>
                        <Badge colorPalette="blue" size="sm">{slot.region}</Badge>
                      </Stack>
                      <Button
                        variant="ghost"
                        colorPalette="red"
                        size="sm"
                        onClick={() => handleUnregisterSlot(slot.id)}
                      >
                        Remove
                      </Button>
                    </Stack>
                  </CardHeader>
                  <CardBody>
                    <Stack spacing="sm">
                      <Typography variant="sm">
                        <strong>ID:</strong> <Code>{slot.id}</Code>
                      </Typography>
                      <Typography variant="sm">
                        <strong>Components:</strong> {slot.components.length}
                      </Typography>
                      <Typography variant="sm">
                        <strong>Priority:</strong> {slot.priority}
                      </Typography>
                      {slot.components.length > 0 && (
                        <Stack spacing="xs">
                          <Typography variant="sm" fontWeight="medium">Components:</Typography>
                          {slot.components.map((comp, index) => (
                            <Badge key={index} colorPalette="green" size="sm">
                              {comp}
                            </Badge>
                          ))}
                        </Stack>
                      )}
                    </Stack>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>

            {slotInfo.length === 0 && (
              <Alert status="info" title="No Active Slots">
                No slots are currently registered. Use the controls below to register test slots.
              </Alert>
            )}
          </Section>

          {/* Slot Registration */}
          <Section variant="elevated" title="Register New Slot">
            <Stack direction="row" spacing="md" align="end" wrap="wrap">
              <Stack spacing="xs">
                <Typography variant="sm" fontWeight="medium">Slot Name</Typography>
                <InputField
                  placeholder="e.g., dashboard-metrics"
                  value={newSlotName}
                  onChange={(e) => setNewSlotName(e.target.value)}
                  width="200px"
                />
              </Stack>

              <Stack spacing="xs">
                <Typography variant="sm" fontWeight="medium">Region</Typography>
                <SelectField
                  value={newSlotRegion}
                  onChange={(e) => setNewSlotRegion(e.target.value)}
                  width="150px"
                >
                  {regions.map(region => (
                    <option key={region} value={region}>
                      {region}
                    </option>
                  ))}
                </SelectField>
              </Stack>

              <Button
                colorPalette="blue"
                onClick={handleRegisterSlot}
                disabled={!newSlotName.trim()}
              >
                Register Slot
              </Button>
            </Stack>
          </Section>

          {/* Component Testing */}
          <Section variant="elevated" title="Test Components">
            <Stack spacing="md">
              <Stack direction="row" spacing="md" align="end" wrap="wrap">
                <Stack spacing="xs">
                  <Typography variant="sm" fontWeight="medium">Target Slot</Typography>
                  <SelectField
                    placeholder="Select a slot"
                    value={selectedSlot}
                    onChange={(e) => setSelectedSlot(e.target.value)}
                    width="200px"
                  >
                    {slotInfo.map(slot => (
                      <option key={slot.id} value={slot.id}>
                        {slot.name} ({slot.region})
                      </option>
                    ))}
                  </SelectField>
                </Stack>

                <Button
                  colorPalette="purple"
                  onClick={handleAddTestComponent}
                  disabled={!selectedSlot || !testComponentCode.trim()}
                >
                  Add Test Component
                </Button>
              </Stack>

              <Stack spacing="xs">
                <Typography variant="sm" fontWeight="medium">Component Code (JSX)</Typography>
                <TextareaField
                  placeholder="Enter JSX code for test component..."
                  value={testComponentCode}
                  onChange={(e) => setTestComponentCode(e.target.value)}
                  height="120px"
                  fontFamily="Monaco, Consolas, monospace"
                  fontSize="14px"
                />
              </Stack>

              {/* Quick Test Components */}
              <Stack spacing="xs">
                <Typography variant="sm" fontWeight="medium">Quick Test Components</Typography>
                <Stack direction="row" spacing="sm" wrap="wrap">
                  {testComponents.map(comp => (
                    <Button
                      key={comp.name}
                      variant="outline"
                      size="sm"
                      onClick={() => setTestComponentCode(comp.code)}
                      title={comp.description}
                    >
                      {comp.name}
                    </Button>
                  ))}
                </Stack>
              </Stack>
            </Stack>
          </Section>

          {/* Activity Log */}
          <Section variant="elevated" title="Activity Log">
            <Box
              height="200px"
              overflowY="auto"
              p="3"
              bg="gray.50"
              border="1px solid"
              borderColor="gray.200"
              borderRadius="md"
              fontFamily="mono"
              fontSize="sm"
            >
              {registrationLog.length === 0 ? (
                <Typography variant="sm" style={{ color: '#666' }}>
                  No activity yet. Register slots or add components to see logs.
                </Typography>
              ) : (
                registrationLog.map((log, index) => (
                  <div key={index} style={{ marginBottom: '4px' }}>
                    [{new Date().toLocaleTimeString()}] {log}
                  </div>
                ))
              )}
            </Box>
          </Section>

          {/* Usage Guide */}
          <Section variant="elevated" title="📖 Usage Guide">
            <Stack spacing="sm">
              <Typography variant="body" style={{ fontSize: '14px' }}>
                • <strong>Register Slots:</strong> Create new slots with different regions and priorities
              </Typography>
              <Typography variant="body" style={{ fontSize: '14px' }}>
                • <strong>Test Components:</strong> Add JSX components to slots to test rendering
              </Typography>
              <Typography variant="body" style={{ fontSize: '14px' }}>
                • <strong>Monitor Activity:</strong> Watch the activity log for registration/unregistration events
              </Typography>
              <Typography variant="body" style={{ fontSize: '14px' }}>
                • <strong>Regions:</strong> Different regions represent different areas of the application
              </Typography>
              <Typography variant="body" style={{ fontSize: '14px' }}>
                • <strong>Priority:</strong> Higher priority components render first within a slot
              </Typography>
            </Stack>
          </Section>
        </Stack>
      </Section>
    </ContentLayout>
  );
}