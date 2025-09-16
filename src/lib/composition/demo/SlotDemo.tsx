/**
 * Slot System Demo for G-Admin v3.0
 * Demonstrates compound components pattern and slot composition
 */

import React, { useEffect } from 'react';
import {
  SlotProvider,
  Dashboard,
  Card,
  Module,
  useSlotContent,
  useCapabilitySlotContent,
  usePluggableComponents
} from '../index';

/**
 * Demo widget components
 */
const WelcomeWidget: React.FC = () => (
  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
    <h3 className="text-lg font-semibold text-blue-800">Welcome!</h3>
    <p className="text-blue-600">This is a demo widget in the dashboard header.</p>
  </div>
);

const QuickStatsWidget: React.FC = () => (
  <div className="p-4 bg-green-50 rounded-lg border border-green-200">
    <h3 className="text-lg font-semibold text-green-800">Quick Stats</h3>
    <div className="grid grid-cols-2 gap-2 mt-2">
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">42</div>
        <div className="text-sm text-green-500">Active Users</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold text-green-600">$12.5K</div>
        <div className="text-sm text-green-500">Revenue</div>
      </div>
    </div>
  </div>
);

const NotificationsWidget: React.FC = () => (
  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
    <h3 className="text-lg font-semibold text-yellow-800">Notifications</h3>
    <ul className="mt-2 space-y-1">
      <li className="text-sm text-yellow-600">• New order received</li>
      <li className="text-sm text-yellow-600">• Inventory low alert</li>
      <li className="text-sm text-yellow-600">• Payment processed</li>
    </ul>
  </div>
);

/**
 * Component that injects content into dashboard slots
 */
const DashboardEnhancer: React.FC = () => {
  const { addContent: addHeaderContent } = useSlotContent('dashboard-header');
  const { addContent: addSidebarContent } = useCapabilitySlotContent(
    'dashboard-sidebar',
    ['dashboard_analytics'], // Requires analytics capability
    'any'
  );

  useEffect(() => {
    // Add welcome widget to header
    addHeaderContent({
      content: <WelcomeWidget />,
      priority: 10
    });

    // Add stats widget to sidebar (capability-gated)
    addSidebarContent({
      content: <QuickStatsWidget />,
      priority: 20
    });
  }, [addHeaderContent, addSidebarContent]);

  return null;
};

/**
 * Pluggable component demo
 */
const PluggableComponentDemo: React.FC = () => {
  const { registerComponent } = usePluggableComponents(['dashboard-sidebar']);

  useEffect(() => {
    // Register notifications widget as pluggable component
    registerComponent({
      id: 'notifications-widget',
      name: 'Notifications Widget',
      component: NotificationsWidget,
      targetSlots: ['dashboard-sidebar'],
      priority: 15,
      category: 'widgets'
    });
  }, [registerComponent]);

  return null;
};

/**
 * Card compound component demo
 */
const CardDemo: React.FC = () => (
  <div className="space-y-4">
    <h2 className="text-xl font-bold">Card Compound Component Demo</h2>

    <Card className="max-w-md">
      <Card.Header className="p-4 border-b">
        <h3 className="text-lg font-semibold">Product Information</h3>
      </Card.Header>

      <Card.Body className="p-4">
        <p className="text-gray-600">
          This is the main content area of the card. It can contain any React elements.
        </p>
        <div className="mt-4 space-y-2">
          <div className="flex justify-between">
            <span>Price:</span>
            <span className="font-semibold">$29.99</span>
          </div>
          <div className="flex justify-between">
            <span>Stock:</span>
            <span className="text-green-600">In Stock</span>
          </div>
        </div>
      </Card.Body>

      <Card.Footer className="p-4 border-t bg-gray-50">
        <div className="flex space-x-2">
          <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Add to Cart
          </button>
          <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
            Wishlist
          </button>
        </div>
      </Card.Footer>
    </Card>
  </div>
);

/**
 * Module compound component demo
 */
const ModuleDemo: React.FC = () => (
  <div className="h-96 border rounded-lg">
    <Module className="h-full">
      <Module.Header className="p-4 border-b bg-gray-50">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Sales Module</h2>
          <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded">
            New Sale
          </button>
        </div>
      </Module.Header>

      <Module.Toolbar className="p-2 border-b bg-gray-25">
        <div className="flex space-x-2">
          <button className="px-3 py-1 text-sm border rounded">Filter</button>
          <button className="px-3 py-1 text-sm border rounded">Sort</button>
          <button className="px-3 py-1 text-sm border rounded">Export</button>
        </div>
      </Module.Toolbar>

      <div className="flex flex-1">
        <Module.Content className="flex-1 p-4">
          <div className="text-center text-gray-500">
            Main module content goes here...
            <br />
            Sales tables, charts, forms, etc.
          </div>
        </Module.Content>

        <Module.Sidebar className="w-64 p-4 border-l bg-gray-50">
          <h3 className="font-semibold mb-2">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full p-2 text-left text-sm border rounded hover:bg-gray-100">
              Recent Sales
            </button>
            <button className="w-full p-2 text-left text-sm border rounded hover:bg-gray-100">
              Top Products
            </button>
            <button className="w-full p-2 text-left text-sm border rounded hover:bg-gray-100">
              Analytics
            </button>
          </div>
        </Module.Sidebar>
      </div>

      <Module.Footer className="p-3 border-t bg-gray-50 text-sm text-gray-600">
        Total Sales: $15,420.50 | Last Updated: 2 minutes ago
      </Module.Footer>
    </Module>
  </div>
);

/**
 * Main demo component
 */
export const SlotDemo: React.FC = () => {
  return (
    <SlotProvider debug={process.env.NODE_ENV === 'development'}>
      <div className="min-h-screen bg-gray-100">
        {/* Enhancement components (inject content into slots) */}
        <DashboardEnhancer />
        <PluggableComponentDemo />

        <Dashboard className="min-h-screen">
          <Dashboard.Header className="bg-white shadow-sm border-b p-4">
            {/* Content will be injected here by DashboardEnhancer */}
          </Dashboard.Header>

          <div className="flex flex-1">
            <Dashboard.Content className="flex-1 p-6">
              <div className="space-y-8">
                <CardDemo />
                <ModuleDemo />
              </div>
            </Dashboard.Content>

            <div className="w-80 bg-white border-l">
              <div className="p-4">
                <h2 className="text-lg font-semibold mb-4">Dashboard Sidebar</h2>
                {/* Slot content will be injected here */}
              </div>
            </div>
          </div>

          <Dashboard.Footer className="bg-white border-t p-4 text-center text-sm text-gray-600">
            G-Admin v3.0 - Slot System Demo
          </Dashboard.Footer>
        </Dashboard>
      </div>
    </SlotProvider>
  );
};

/**
 * Usage examples for documentation
 */
export const SlotUsageExamples = {
  // Basic compound component usage
  basicCard: `
<Card>
  <Card.Header>Title</Card.Header>
  <Card.Body>Content</Card.Body>
  <Card.Footer>Actions</Card.Footer>
</Card>
`,

  // Slot content injection
  contentInjection: `
const MyComponent = () => {
  const { addContent } = useSlotContent('dashboard-sidebar');

  useEffect(() => {
    addContent({
      content: <MyWidget />,
      priority: 10
    });
  }, []);

  return <div>My Component</div>;
};
`,

  // Capability-aware slots
  capabilitySlots: `
const { addContent } = useCapabilitySlotContent(
  'admin-panel',
  ['admin_access', 'user_management'],
  'all'
);
`,

  // Pluggable components
  pluggableComponents: `
const { registerComponent } = usePluggableComponents();

registerComponent({
  id: 'my-widget',
  name: 'My Widget',
  component: MyWidget,
  targetSlots: ['sidebar', 'footer'],
  requiredCapabilities: ['analytics'],
  priority: 5
});
`
};