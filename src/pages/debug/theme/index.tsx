/**
 * Theme Debug Page - Centralizes all theme testing tools
 */

import React, { useState } from 'react';
import { ContentLayout, Section, Tabs, TabsList, TabsTrigger, TabsContent, Stack } from '@/shared/ui';

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
          <TabsList>
            {tabs.map(tab => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                icon={<span>{tab.icon}</span>}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div style={{ marginTop: '20px' }}>
            <TabsContent value="dynamic" padding="md">
              <div>Dynamic theme test</div>
            </TabsContent>

            <TabsContent value="design-system" padding="md">
              <div>Design system demo</div>
            </TabsContent>

            <TabsContent value="tokens" padding="md">
              <Stack spacing="md">
                <div>Token debugger placeholder - TODO: Import TokenTest component</div>
              </Stack>
            </TabsContent>

            <TabsContent value="palette" padding="md">
              <Stack spacing="md">
                <div>Palette tester placeholder - TODO: Import PaletteSystemTest component</div>
              </Stack>
            </TabsContent>
          </div>
        </Tabs>
      </Section>
    </ContentLayout>
  );
}