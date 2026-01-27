/**
 * Dashboard Page - Executive Command Center
 *
 * REFACTORED v6.0 - MAGIC PATTERNS DESIGN:
 * ✅ Clean layout inspired by Magic Patterns design system
 * ✅ Decorative background elements (subtle blobs)
 * ✅ Modern metric cards with gradient accents
 * ✅ Elevated cards with hover effects
 * ✅ Spacing following Magic Patterns tokens (p="6", gap="6")
 * ✅ Mobile-first responsive design
 * ✅ Dynamic Widgets Grid via Hook Registry
 * ✅ WCAG 2.4.1 Level A compliant
 *
 * Design Pattern:
 * - Background: Decorative blurred circles
 * - Header: Icon + Title + Subtitle (clean, no gradients yet)
 * - Metrics Grid: 4 cards with top accent borders
 * - Content Cards: 2-column grid with elevated cards
 * - Stats Banner: Gradient background with centered stats
 * - Dynamic Widgets: Hook-based injection system
 *
 * Based on: 4292c6f5-14a3-4978-b79f-af113030d2f1/src/App.tsx
 */

import React from 'react';
import { Box, Stack, SimpleGrid, Flex, Badge } from '@/shared/ui';
import { HookPoint } from '@/lib/modules';
import { Typography } from '@/shared/ui';
import { Button } from '@/shared/ui';
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  UsersIcon,
  StarIcon,
  SparklesIcon,
  BoltIcon,
  CheckCircleIcon,
  ChartBarIcon,
  DocumentTextIcon,
  BellAlertIcon,
  ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';
import { logger } from '@/lib/logging';
import { OperationalStatusWidget } from './components/OperationalStatusWidget';
import { AlertsAchievementsSection } from './components/AlertsAchievementsSection';

// ===============================
// TYPES
// ===============================

interface MetricCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  gradient: string;
}

interface StatItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}

// ===============================
// HELPER COMPONENTS (Magic Patterns Style)
// ===============================

/**
 * MetricCard - Card with gradient top border and metric data
 * Adapted from Magic Patterns design with Chakra v3 syntax
 */
const MetricCard: React.FC<MetricCardProps> = ({ icon: Icon, label, value, change, changeType, gradient }) => {
  const changeColor = changeType === 'increase' ? 'green.500' : changeType === 'decrease' ? 'red.500' : 'gray.500';
  
  return (
    <Box
      bg="bg.surface"
      p="6"
      borderRadius="2xl"
      shadow="md"
      position="relative"
      overflow="hidden"
      _hover={{ shadow: 'lg', transform: 'translateY(-2px)' }}
      transition="all 0.2s"
    >
      {/* Top gradient border */}
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        h="3px"
        bg={gradient}
      />
      
      <Stack gap={4}>
        <Flex justify="space-between" align="start">
          <Box
            p="3"
            borderRadius="xl"
            bg={`${gradient.split('.')[0]}.100`}
          >
            <Icon style={{ width: '24px', height: '24px', color: `var(--chakra-colors-${gradient.replace('.', '-')})` }} />
          </Box>
          {change && (
            <Badge colorPalette={changeType === 'increase' ? 'green' : 'red'} size="sm">
              {change}
            </Badge>
          )}
        </Flex>
        <Stack gap={1}>
          <Typography variant="body" size="sm" color="text.muted">
            {label}
          </Typography>
          <Typography variant="heading" size="2xl" fontWeight="bold">
            {value}
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

/**
 * StatItem - Centered stat display for banner
 */
const StatItem: React.FC<StatItemProps> = ({ icon: Icon, label, value }) => (
  <Stack gap={2} align="center">
    <Icon style={{ width: '32px', height: '32px', color: 'white' }} />
    <Typography variant="heading" size="3xl" fontWeight="bold" color="white">
      {value}
    </Typography>
    <Typography variant="body" size="sm" color="whiteAlpha.900">
      {label}
    </Typography>
  </Stack>
);

/**
 * FeatureItem - Simple icon + text row
 */
const FeatureItem: React.FC<{ icon: React.ComponentType<{ className?: string }>; text: string }> = ({ icon: Icon, text }) => (
  <Flex align="center" gap={3}>
    <Icon style={{ width: '20px', height: '20px', color: 'var(--chakra-colors-purple-500)' }} />
    <Typography variant="body" size="md">{text}</Typography>
  </Flex>
);

// ===============================
// MAIN COMPONENT
// ===============================

const DashboardPage: React.FC = () => {
  // Mock data (TODO: Connect to real Zustand stores)
  const operationalStatus = {
    isOpen: true,
    currentShift: 'Turno Tarde',
    activeStaff: 6,
    totalStaff: 9,
    openTime: '09:00',
    closeTime: '21:00',
    operatingHours: 4.5,
    alerts: 2,
  };

  return (
    <Box position="relative" minH="100vh" bg="bg.canvas" overflow="hidden">
      {/* ✅ DECORATIVE BACKGROUND BLOBS */}
      <Box
        position="absolute"
        top="-100px"
        left="-100px"
        width="400px"
        height="400px"
        borderRadius="full"
        bg="purple.100"
        filter="blur(80px)"
        opacity={0.6}
        pointerEvents="none"
      />
      <Box
        position="absolute"
        bottom="-150px"
        right="-150px"
        width="500px"
        height="500px"
        borderRadius="full"
        bg="blue.100"
        filter="blur(80px)"
        opacity={0.6}
        pointerEvents="none"
      />

      {/* ✅ MAIN CONTENT - Padding wrapper (Magic Patterns pattern) */}
      <Box position="relative" zIndex={1} p={{ base: "6", md: "8" }}>
        <Stack gap={8} w="100%">
        
        {/* ✅ HEADER SECTION */}
        <Box>
          <Flex align="center" gap={4} mb={2}>
            <Box
              p="4"
              borderRadius="2xl"
              bg="linear-gradient(135deg, var(--chakra-colors-purple-500) 0%, var(--chakra-colors-purple-700) 100%)"
              shadow="lg"
            >
              <SparklesIcon style={{ width: '32px', height: '32px', color: 'white' }} />
            </Box>
            <Stack gap={1}>
              <Typography variant="heading" size="3xl" fontWeight="bold">
                Executive Dashboard
              </Typography>
              <Typography variant="body" size="md" color="text.muted">
                Real-time business intelligence and operational metrics
              </Typography>
            </Stack>
          </Flex>
        </Box>

        {/* ✅ METRICS GRID - 4 columns responsive */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} gap={6}>
          <MetricCard
            icon={CurrencyDollarIcon}
            label="Total Revenue"
            value="$98,550"
            change="+17.0%"
            changeType="increase"
            gradient="purple.500"
          />
          <MetricCard
            icon={ShoppingCartIcon}
            label="Total Orders"
            value="1,234"
            change="+12.5%"
            changeType="increase"
            gradient="blue.500"
          />
          <MetricCard
            icon={UsersIcon}
            label="Active Customers"
            value="854"
            change="+5.2%"
            changeType="increase"
            gradient="green.500"
          />
          <MetricCard
            icon={StarIcon}
            label="Avg Rating"
            value="4.8"
            change="+0.3"
            changeType="increase"
            gradient="yellow.500"
          />
        </SimpleGrid>

        {/* ✅ OPERATIONAL STATUS - Always visible hero widget */}
        <Box>
          <OperationalStatusWidget
            isOpen={operationalStatus.isOpen}
            currentShift={operationalStatus.currentShift}
            activeStaff={operationalStatus.activeStaff}
            totalStaff={operationalStatus.totalStaff}
            openTime={operationalStatus.openTime}
            closeTime={operationalStatus.closeTime}
            operatingHours={operationalStatus.operatingHours}
            alerts={operationalStatus.alerts}
            onToggleStatus={() => logger.info('Dashboard', 'Toggle operational status')}
          />
        </Box>

        {/* ✅ CONTENT CARDS - 2 columns responsive */}
        <SimpleGrid columns={{ base: 1, lg: 2 }} gap={6}>
          {/* Welcome Card */}
          <Box
            bg="bg.surface"
            p="8"
            borderRadius="2xl"
            shadow="xl"
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              h="4px"
              bg="linear-gradient(90deg, var(--chakra-colors-purple-500) 0%, var(--chakra-colors-blue-500) 100%)"
            />
            <Stack gap={4}>
              <Flex align="center" gap={3}>
                <BoltIcon style={{ width: '28px', height: '28px', color: 'var(--chakra-colors-purple-500)' }} />
                <Typography variant="heading" size="xl" fontWeight="bold">
                  Welcome Back!
                </Typography>
              </Flex>
              <Typography variant="body" size="md" color="text.muted">
                Here's what's happening with your business today. All systems operational.
              </Typography>
              <Stack gap={3} mt={2}>
                <FeatureItem icon={CheckCircleIcon} text="All modules active and synchronized" />
                <FeatureItem icon={ChartBarIcon} text="Real-time analytics tracking" />
                <FeatureItem icon={BellAlertIcon} text="2 active alerts require attention" />
              </Stack>
              <Button colorPalette="purple" size="md" mt={4}>
                View Detailed Report
              </Button>
            </Stack>
          </Box>

          {/* Dynamic Widgets Card */}
          <Box
            bg="bg.surface"
            p="8"
            borderRadius="2xl"
            shadow="xl"
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              h="4px"
              bg="linear-gradient(90deg, var(--chakra-colors-blue-500) 0%, var(--chakra-colors-green-500) 100%)"
            />
            <Stack gap={4}>
              <Flex align="center" gap={3}>
                <ClipboardDocumentListIcon style={{ width: '28px', height: '28px', color: 'var(--chakra-colors-blue-500)' }} />
                <Typography variant="heading" size="xl" fontWeight="bold">
                  Dynamic Widgets
                </Typography>
              </Flex>
              <Typography variant="body" size="md" color="text.muted">
                Module-injected widgets appear here dynamically based on active capabilities.
              </Typography>
              
              {/* HookPoint for dynamic widget injection */}
              <Box mt={2}>
                <HookPoint
                  name="dashboard.widgets"
                  data={{}}
                  direction="column"
                  gap="4"
                  debug={false}
                  fallback={
                    <Box p={4} borderWidth="1px" borderRadius="lg" borderColor="border.muted" bg="bg.muted">
                      <Typography variant="body" size="sm" color="text.muted">
                        No widgets registered. Install modules to see dynamic content here.
                      </Typography>
                    </Box>
                  }
                />
              </Box>
            </Stack>
          </Box>
        </SimpleGrid>

        {/* ✅ STATS BANNER - Gradient background with overlay */}
        <Box
          position="relative"
          overflow="hidden"
          borderRadius="2xl"
        >
          {/* Gradient background */}
          <Box
            position="absolute"
            inset={0}
            bg="linear-gradient(135deg, var(--chakra-colors-purple-600) 0%, var(--chakra-colors-blue-600) 100%)"
          />
          
          {/* Blur overlay */}
          <Box
            position="absolute"
            inset={0}
            bg="whiteAlpha.200"
            backdropFilter="blur(8px)"
          />

          {/* Content */}
          <Box position="relative" p="8">
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={8}>
              <StatItem icon={ChartBarIcon} label="Daily Transactions" value="348" />
              <StatItem icon={DocumentTextIcon} label="Pending Tasks" value="12" />
              <StatItem icon={UsersIcon} label="Team Members" value="9" />
            </SimpleGrid>
          </Box>
        </Box>

        {/* ✅ ALERTS & ACHIEVEMENTS SECTION */}
        <Box>
          <AlertsAchievementsSection />
        </Box>

        </Stack>
      </Box>
    </Box>
  );
};

export default DashboardPage;
