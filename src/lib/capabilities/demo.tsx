/**
 * Demo component for CapabilityGate System
 * Shows how to use the capability system in practice
 */

import React from 'react';
import { CapabilityGate, CapabilityProvider, useCapabilities } from './index';

// Mock some demo components
const SalesModule = () => <div>🛍️ Sales POS System</div>;
const AppointmentsModule = () => <div>📅 Appointment Booking</div>;
const OnlineStoreModule = () => <div>🛒 Online Store</div>;
const RestaurantModule = () => <div>🍽️ Restaurant Operations</div>;

// Demo of capability usage in a component
const DynamicDashboard = () => {
  const { activeCapabilities, businessModel } = useCapabilities();

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h2>🎛️ G-Admin Dashboard (Dynamic)</h2>

      <div style={{ marginBottom: '20px' }}>
        <strong>Business Model:</strong> {businessModel || 'Not configured'}
        <br />
        <strong>Active Capabilities:</strong> {activeCapabilities.length}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>

        {/* Sales Module - Shows if sells any products */}
        <CapabilityGate capabilities="sells_products">
          <div style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px' }}>
            <SalesModule />
            <p>Available because: sells_products capability is active</p>
          </div>
        </CapabilityGate>

        {/* Appointments Module - Shows if manages appointments */}
        <CapabilityGate
          capabilities="appointment_booking"
          fallback={
            <div style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px', opacity: 0.5 }}>
              <div>📅 Appointment Booking (Disabled)</div>
              <p>Enable appointment capabilities to unlock</p>
            </div>
          }
        >
          <div style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px' }}>
            <AppointmentsModule />
            <p>Available because: appointment_booking capability is active</p>
          </div>
        </CapabilityGate>

        {/* Online Store - Requires multiple capabilities with AND logic */}
        <CapabilityGate
          capabilities={["has_online_store", "payment_gateway"]}
          mode="all"
          fallback={
            <div style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px', opacity: 0.5 }}>
              <div>🛒 Online Store (Disabled)</div>
              <p>Requires: has_online_store AND payment_gateway</p>
            </div>
          }
        >
          <div style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px' }}>
            <OnlineStoreModule />
            <p>Available because: has_online_store AND payment_gateway are active</p>
          </div>
        </CapabilityGate>

        {/* Restaurant Operations - Multiple capabilities with OR logic */}
        <CapabilityGate
          capabilities={["table_management", "pos_system"]}
          mode="any"
          fallback={
            <div style={{ border: '1px solid #ccc', padding: '16px', borderRadius: '8px', opacity: 0.5 }}>
              <div>🍽️ Restaurant Operations (Disabled)</div>
              <p>Requires: table_management OR pos_system</p>
            </div>
          }
        >
          <div style={{ border: '1px solid #ddd', padding: '16px', borderRadius: '8px' }}>
            <RestaurantModule />
            <p>Available because: table_management OR pos_system is active</p>
          </div>
        </CapabilityGate>

      </div>

      {/* Debug info */}
      <div style={{ marginTop: '30px', padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
        <h3>🔧 Debug Information</h3>
        <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
          <div><strong>Active Capabilities:</strong></div>
          {activeCapabilities.map(cap => (
            <div key={cap} style={{ marginLeft: '16px', color: '#059669' }}>
              ✅ {cap}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main demo component
export const CapabilitySystemDemo = () => {
  return (
    <CapabilityProvider debugMode={true}>
      <DynamicDashboard />
    </CapabilityProvider>
  );
};

// Usage example for documentation
export const UsageExample = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>📖 Usage Examples</h2>

      <h3>1. Basic Usage</h3>
      <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
{`// Wrap your app with CapabilityProvider
<CapabilityProvider>
  <App />
</CapabilityProvider>

// Use CapabilityGate for conditional rendering
<CapabilityGate capabilities="sells_products">
  <SalesModule />
</CapabilityGate>`}
      </pre>

      <h3>2. Multiple Capabilities</h3>
      <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
{`// OR logic (default) - any of the capabilities
<CapabilityGate capabilities={["pos_system", "online_store"]}>
  <PaymentModule />
</CapabilityGate>

// AND logic - all capabilities required
<CapabilityGate
  capabilities={["has_online_store", "payment_gateway"]}
  mode="all"
>
  <EcommerceModule />
</CapabilityGate>`}
      </pre>

      <h3>3. With Fallback</h3>
      <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
{`<CapabilityGate
  capabilities="appointment_booking"
  fallback={<div>Enable appointments to unlock this feature</div>}
>
  <AppointmentModule />
</CapabilityGate>`}
      </pre>

      <h3>4. Using Hooks</h3>
      <pre style={{ background: '#f5f5f5', padding: '12px', borderRadius: '4px' }}>
{`const MyComponent = () => {
  const { hasCapability, businessModel } = useCapabilities();
  const hasOnlineStore = hasCapability('has_online_store');

  return (
    <div>
      <h1>Welcome to {businessModel} Dashboard</h1>
      {hasOnlineStore && <OnlineStoreWidget />}
    </div>
  );
};`}
      </pre>
    </div>
  );
};