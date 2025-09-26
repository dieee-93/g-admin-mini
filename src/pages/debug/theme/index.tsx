/**
 * Theme Debug Page - Centralizes all theme testing tools
 */

import React, { useState } from 'react';
import { ContentLayout, Section, Tabs, TabList, Tab, TabPanel, Stack } from '@/shared/ui';
import { DynamicThemeTest } from '@/components/debug/DynamicThemeTest';
import { FullDesignSystemDemo } from '@/components/debug/FullDesignSystemDemo';
// Import other theme components as needed

type ThemeTab = 'dynamic' | 'design-system' | 'tokens' | 'palette';

export default function ThemeDebugPage() {
  const [activeTab, setActiveTab] = useState<ThemeTab>('dynamic');

  const tabs = [
    { id: 'dynamic' as ThemeTab, label: 'Dynamic Themes', icon: '🎨' },
    { id: 'design-system' as ThemeTab, label: 'Design System', icon: '🧩' },
    { id: 'tokens' as ThemeTab, label: 'Tokens', icon: '🎯' },
    { id: 'palette' as ThemeTab, label: 'Palette', icon: '🌈' }
  ];

  return (
    <ContentLayout spacing="normal">
      <Section variant="flat" title="🎨 Theme System Debugger">
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as ThemeTab)}
          variant="line"
          colorPalette="purple"
        >
          <TabList>
            {tabs.map(tab => (
              <Tab
                key={tab.id}
                value={tab.id}
                icon={<span>{tab.icon}</span>}
              >
                {tab.label}
              </Tab>
            ))}
          </TabList>

          <div style={{ marginTop: '20px' }}>
            <TabPanel value="dynamic" padding="md">
              <DynamicThemeTest />
            </TabPanel>

            <TabPanel value="design-system" padding="md">
              <FullDesignSystemDemo />
            </TabPanel>

            <TabPanel value="tokens" padding="md">
              <Stack spacing="md">
                <div>Token debugger placeholder - TODO: Import TokenTest component</div>
              </Stack>
            </TabPanel>

            <TabPanel value="palette" padding="md">
              <Stack spacing="md">
                <div>Palette tester placeholder - TODO: Import PaletteSystemTest component</div>
              </Stack>
            </TabPanel>
          </div>
        </Tabs>
      </Section>
    </ContentLayout>
  );
}