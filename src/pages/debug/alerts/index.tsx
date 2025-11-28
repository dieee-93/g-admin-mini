// src/pages/debug/alerts/index.tsx
// 🧪 PÁGINA DE TESTING DE SISTEMA DE ALERTAS
// Testing completo de toast stack + NotificationCenter + badges

import React, { useState } from 'react';
import { 
  VStack, 
  HStack, 
  Button, 
  Input,
  Text,
  Box,
  Separator,
  Badge
} from '@chakra-ui/react';
import { 
  ContentLayout, 
  PageHeader, 
  Section,
  Stack
} from '@/shared/ui';
import { 
  useAlertsActions, 
  useAlertsState,
  NavAlertBadge,
  SidebarAlertBadge,
  StockAlertBadge,
  CriticalAlertBadge
} from '@/shared/alerts';
import type { AlertSeverity } from '@/shared/alerts';

export default function AlertsTestingPage() {
  const actions = useAlertsActions();
  const { alerts, stats, isNotificationCenterOpen } = useAlertsState();
  
  const [customTitle, setCustomTitle] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [customSeverity, setCustomSeverity] = useState<AlertSeverity>('info');
  
  // 🎯 Test: Create alert with different severities
  const createTestAlert = (severity: AlertSeverity) => {
    const alertId = actions.create({
      severity,
      title: `Test ${severity.toUpperCase()} Alert`,
      description: `This is a test ${severity} alert with auto-dismiss`,
      context: 'testing',
      autoExpire: severity === 'critical' ? undefined : 2 // 2 minutes for non-critical
    });
    
    console.log(`Created alert: ${alertId}`);
  };
  
  // 🎯 Test: Create custom alert
  const createCustomAlert = () => {
    if (!customTitle) {
      alert('Please enter a title');
      return;
    }
    
    const alertId = actions.create({
      severity: customSeverity,
      title: customTitle,
      description: customDescription || undefined,
      context: 'custom',
      autoExpire: 5 // 5 minutes
    });
    
    console.log(`Created custom alert: ${alertId}`);
    setCustomTitle('');
    setCustomDescription('');
  };
  
  // 🎯 Test: Create multiple alerts
  const createMultipleAlerts = () => {
    const severities: AlertSeverity[] = ['info', 'success', 'warning', 'error', 'critical'];
    
    severities.forEach((severity, index) => {
      setTimeout(() => {
        actions.create({
          severity,
          title: `Alert ${index + 1} - ${severity.toUpperCase()}`,
          description: `This is alert number ${index + 1}`,
          context: 'bulk-test',
          autoExpire: 3
        });
      }, index * 500); // 500ms delay between each
    });
  };
  
  // 🎯 Test: Bulk create for performance
  const bulkCreateAlerts = () => {
    const alerts = Array.from({ length: 10 }, (_, i) => ({
      severity: (['info', 'warning', 'error'] as AlertSeverity[])[i % 3],
      title: `Bulk Alert ${i + 1}`,
      description: `Bulk creation test - alert ${i + 1}`,
      context: 'bulk-performance',
      autoExpire: 5
    }));
    
    actions.bulkCreate(alerts);
    console.log('Created 10 alerts with bulkCreate');
  };
  
  // 🎯 Test: Mark all as read
  const markAllRead = () => {
    const unreadAlerts = alerts.filter(a => !a.readAt);
    unreadAlerts.forEach(alert => actions.markAsRead(alert.id));
    console.log(`Marked ${unreadAlerts.length} alerts as read`);
  };
  
  // 🎯 Test: Archive all
  const archiveAll = () => {
    alerts.forEach(alert => actions.archive(alert.id));
    console.log(`Archived ${alerts.length} alerts`);
  };
  
  // 🎯 Test: Snooze first alert
  const snoozeFirstAlert = () => {
    if (alerts.length === 0) {
      alert('No alerts to snooze');
      return;
    }
    
    const firstAlert = alerts[0];
    actions.snooze(firstAlert.id, 1); // Snooze for 1 minute
    console.log(`Snoozed alert: ${firstAlert.id} for 1 minute`);
  };
  
  return (
    <ContentLayout spacing="normal">
      <PageHeader 
        title="🧪 Alerts System Testing" 
        description="Complete testing suite for toast stack, NotificationCenter, and badges"
      />
      
      {/* Stats Section */}
      <Section title="📊 System Stats">
        <Box p={4} bg="gray.50" borderRadius="md">
          <HStack gap={4} wrap="wrap">
            <StatBadge label="Total" value={stats.total} color="blue" />
            <StatBadge label="Active" value={stats.active} color="green" />
            <StatBadge label="Unread" value={stats.unread} color="orange" />
            <StatBadge label="Critical" value={stats.bySeverity.critical} color="red" />
            <StatBadge label="Errors" value={stats.bySeverity.error} color="red" />
            <StatBadge label="Warnings" value={stats.bySeverity.warning} color="yellow" />
            <StatBadge label="NC Open" value={isNotificationCenterOpen ? 'Yes' : 'No'} color="purple" />
          </HStack>
        </Box>
      </Section>
      
      {/* Quick Tests */}
      <Section title="⚡ Quick Tests">
        <Stack direction="row" wrap="wrap" gap={2}>
          <Button onClick={() => createTestAlert('info')} colorPalette="blue" size="sm">
            Create INFO
          </Button>
          <Button onClick={() => createTestAlert('success')} colorPalette="green" size="sm">
            Create SUCCESS
          </Button>
          <Button onClick={() => createTestAlert('warning')} colorPalette="yellow" size="sm">
            Create WARNING
          </Button>
          <Button onClick={() => createTestAlert('error')} colorPalette="red" size="sm">
            Create ERROR
          </Button>
          <Button onClick={() => createTestAlert('critical')} colorPalette="red" size="sm">
            Create CRITICAL
          </Button>
        </Stack>
      </Section>
      
      {/* Custom Alert Creator */}
      <Section title="🎨 Custom Alert">
        <VStack align="stretch" gap={3}>
          <Input
            placeholder="Alert title *"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
          />
          <Input
            placeholder="Alert description (optional)"
            value={customDescription}
            onChange={(e) => setCustomDescription(e.target.value)}
          />
          <HStack gap={2}>
            <Text fontSize="sm" fontWeight="medium">Severity:</Text>
            <Button 
              size="xs" 
              variant={customSeverity === 'info' ? 'solid' : 'outline'}
              onClick={() => setCustomSeverity('info')}
            >
              Info
            </Button>
            <Button 
              size="xs" 
              variant={customSeverity === 'success' ? 'solid' : 'outline'}
              onClick={() => setCustomSeverity('success')}
            >
              Success
            </Button>
            <Button 
              size="xs" 
              variant={customSeverity === 'warning' ? 'solid' : 'outline'}
              onClick={() => setCustomSeverity('warning')}
            >
              Warning
            </Button>
            <Button 
              size="xs" 
              variant={customSeverity === 'error' ? 'solid' : 'outline'}
              onClick={() => setCustomSeverity('error')}
            >
              Error
            </Button>
            <Button 
              size="xs" 
              variant={customSeverity === 'critical' ? 'solid' : 'outline'}
              onClick={() => setCustomSeverity('critical')}
            >
              Critical
            </Button>
          </HStack>
          <Button onClick={createCustomAlert} colorPalette="blue">
            Create Custom Alert
          </Button>
        </VStack>
      </Section>
      
      {/* Bulk Operations */}
      <Section title="📦 Bulk Operations">
        <Stack direction="row" wrap="wrap" gap={2}>
          <Button onClick={createMultipleAlerts} colorPalette="purple" size="sm">
            Create 5 Alerts (Sequential)
          </Button>
          <Button onClick={bulkCreateAlerts} colorPalette="purple" size="sm">
            Bulk Create 10 Alerts
          </Button>
          <Button onClick={markAllRead} colorPalette="teal" size="sm">
            Mark All Read
          </Button>
          <Button onClick={archiveAll} colorPalette="gray" size="sm">
            Archive All
          </Button>
          <Button onClick={snoozeFirstAlert} colorPalette="orange" size="sm">
            Snooze First (1 min)
          </Button>
        </Stack>
      </Section>
      
      {/* Badge Testing */}
      <Section title="🏷️ Badge Variants">
        <VStack align="stretch" gap={4}>
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>Nav Badge (opens NotificationCenter):</Text>
            <HStack gap={4}>
              <NavAlertBadge openNotificationCenter={true} />
              <Text fontSize="xs" color="gray.600">Click to open NotificationCenter</Text>
            </HStack>
          </Box>
          
          <Separator />
          
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>Sidebar Badge (opens NotificationCenter):</Text>
            <HStack gap={4}>
              <SidebarAlertBadge openNotificationCenter={true} />
              <Text fontSize="xs" color="gray.600">Click to open NotificationCenter</Text>
            </HStack>
          </Box>
          
          <Separator />
          
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>Stock Alert Badge:</Text>
            <HStack gap={4}>
              <StockAlertBadge />
              <Text fontSize="xs" color="gray.600">Filtered by context: stock</Text>
            </HStack>
          </Box>
          
          <Separator />
          
          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2}>Critical Alert Badge:</Text>
            <HStack gap={4}>
              <CriticalAlertBadge />
              <Text fontSize="xs" color="gray.600">Only critical severity</Text>
            </HStack>
          </Box>
        </VStack>
      </Section>
      
      {/* NotificationCenter Control */}
      <Section title="🔔 NotificationCenter Control">
        <Stack direction="row" gap={2}>
          <Button 
            onClick={actions.openNotificationCenter} 
            colorPalette="blue"
            disabled={isNotificationCenterOpen}
          >
            Open NotificationCenter
          </Button>
          <Button 
            onClick={actions.closeNotificationCenter} 
            colorPalette="gray"
            disabled={!isNotificationCenterOpen}
          >
            Close NotificationCenter
          </Button>
        </Stack>
      </Section>
      
      {/* Testing Checklist */}
      <Section title="✅ Testing Checklist">
        <VStack align="stretch" gap={2} fontSize="sm">
          <ChecklistItem text="Toast stack appears in top-right" />
          <ChecklistItem text="Auto-dismiss works (3s/3s/5s/8s/∞)" />
          <ChecklistItem text="Progress bar visible and animated" />
          <ChecklistItem text="Max 3 toasts visible simultaneously" />
          <ChecklistItem text="Animations smooth (Framer Motion)" />
          <ChecklistItem text="NotificationCenter opens/closes" />
          <ChecklistItem text="Tabs filter correctly (All, Unread, Critical, Acknowledged)" />
          <ChecklistItem text="Search filters results" />
          <ChecklistItem text="Timeline grouping works (Today, Yesterday, etc.)" />
          <ChecklistItem text="Bulk actions work (Mark all read, Clear all)" />
          <ChecklistItem text="Badge click opens NotificationCenter" />
          <ChecklistItem text="Badge count updates in real-time" />
          <ChecklistItem text="Mark as read updates unread count" />
          <ChecklistItem text="Snooze reappears after delay (1 minute)" />
          <ChecklistItem text="Archive removes from active list" />
        </VStack>
      </Section>
      
      {/* Instructions */}
      <Section title="📖 Testing Instructions">
        <Box p={4} bg="blue.50" borderRadius="md">
          <VStack align="stretch" gap={2} fontSize="sm">
            <Text fontWeight="bold">How to test:</Text>
            <Text>1. Click "Create INFO/SUCCESS/WARNING/ERROR/CRITICAL" to test individual severities</Text>
            <Text>2. Watch toast stack appear in top-right corner</Text>
            <Text>3. Observe progress bars and auto-dismiss timing</Text>
            <Text>4. Click badges to open NotificationCenter</Text>
            <Text>5. Test tabs, search, and timeline grouping in NotificationCenter</Text>
            <Text>6. Try bulk operations (Mark all read, Archive all)</Text>
            <Text>7. Test snooze (alert should reappear after 1 minute)</Text>
            <Text>8. Check console.log for debug information</Text>
          </VStack>
        </Box>
      </Section>
    </ContentLayout>
  );
}

// Helper Components
function StatBadge({ label, value, color }: { label: string; value: number | string; color: string }) {
  return (
    <VStack gap={1} align="center">
      <Text fontSize="xs" color="gray.600">{label}</Text>
      <Badge colorPalette={color} size="lg">
        {value}
      </Badge>
    </VStack>
  );
}

function ChecklistItem({ text }: { text: string }) {
  return (
    <HStack gap={2}>
      <Box w={3} h={3} borderRadius="sm" border="2px solid" borderColor="gray.300" />
      <Text>{text}</Text>
    </HStack>
  );
}
