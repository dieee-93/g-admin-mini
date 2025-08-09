// Settings Page - Main hub for Business Profile + Tax Config + Permissions + Integrations
import React, { useState } from 'react';
import {
  Box,
  Card,
  Heading,
  Text,
  HStack,
  Tabs,
} from '@chakra-ui/react';
import { 
  BuildingOfficeIcon, 
  CurrencyDollarIcon, 
  UserGroupIcon,
  CogIcon
} from '@heroicons/react/24/outline';
import { Icon } from '@/shared/ui/Icon';
import { useNavigation } from '@/contexts/NavigationContext';

// Components
import { SettingsHeader } from './components/SettingsHeader';
import { BusinessProfileSection } from './components/sections/BusinessProfileSection';
import { TaxConfigurationSection } from './components/sections/TaxConfigurationSection';
import { UserPermissionsSection } from './components/sections/UserPermissionsSection';
import { IntegrationsSection } from './components/sections/IntegrationsSection';

export function SettingsPage() {
  const { setQuickActions } = useNavigation();
  const [activeTab, setActiveTab] = useState('business');

  const tabs = [
    {
      id: 'business',
      label: 'Perfil Empresarial',
      icon: BuildingOfficeIcon,
      component: <BusinessProfileSection />
    },
    {
      id: 'tax',
      label: 'Configuración Fiscal',
      icon: CurrencyDollarIcon,
      component: <TaxConfigurationSection />
    },
    {
      id: 'permissions',
      label: 'Permisos de Usuario',
      icon: UserGroupIcon,
      component: <UserPermissionsSection />
    },
    {
      id: 'integrations',
      label: 'Integraciones',
      icon: CogIcon,
      component: <IntegrationsSection />
    }
  ];

  return (
    <Box p={{ base: 2, md: 6 }} pb={{ base: '90px', md: 6 }}>
      <SettingsHeader />

      <Card.Root mt={6}>
        <Tabs.Root value={activeTab} onValueChange={(details) => setActiveTab(details.value)}>
          <Tabs.List>
            {tabs.map((tab) => (
              <Tabs.Trigger key={tab.id} value={tab.id}>
                <HStack gap={2}>
                  <Icon icon={tab.icon} size="sm" />
                  <Text>{tab.label}</Text>
                </HStack>
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          {tabs.map((tab) => (
            <Tabs.Content key={tab.id} value={tab.id}>
              <Box p={4}>
                {tab.component}
              </Box>
            </Tabs.Content>
          ))}
        </Tabs.Root>
      </Card.Root>
    </Box>
  );
}
