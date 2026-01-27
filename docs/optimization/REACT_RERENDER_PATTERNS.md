# React Component Re-render Optimization Patterns

**Date**: 2025-11-29  
**Context**: Suppliers Management page performance optimization  
**Issue**: 335 component re-renders causing frame drops and lag

---

## Problem Synopsis

The Suppliers page experienced severe performance degradation with 335+ components re-rendering on every interaction, causing FPS drops from 60 to ~30.

**Symptoms**:
- Page lag when switching tabs
- Console DevTools exacerbating the problem
- React Scan showing massive `TabsContext` changes (335x)

**Root Causes Identified**:
1. ❌ Chakra UI Tabs rendering ALL panel content simultaneously
2. ❌ Invalid HTML nesting (`<div>` inside `<p>`) causing hydration errors
3. ⚠️ Parent component re-rendering due to `useOfflineStatus` interval (acceptable if children optimized)

---

## Pattern 1: Chakra UI Tabs Lazy Loading

### The Problem

**Default Behavior**: Chakra UI `<Tabs>` renders ALL tab panel content to the DOM immediately, even for inactive tabs. Content is hidden via CSS (`display: none`), but React components mount and execute.

**Impact**:
```typescript
// With 3 tabs, ALL of these mount simultaneously:
<Tabs.Content value="list">
  <SuppliersTable />  // ← Mounts, fetches data
</Tabs.Content>

<Tabs.Content value="analytics">
  <AnalyticsTab />    // ← Also mounts, fetches data! 
</Tabs.Content>

<Tabs.Content value="performance">
  <PerformanceTab />  // ← Also mounts, fetches data!
</Tabs.Content>

// Result: 6x useSuppliers() calls, 6x data fetches, 6x renders
```

### The Solution

Use `lazyMount` and `unmountOnExit` props:

```typescript
<Tabs.Root
  value={activeTab}
  onValueChange={(e) => setActiveTab(e.value)}
  lazyMount              // ✅ Defer rendering until tab selected
  unmountOnExit={false}  // ✅ Keep mounted after first render (preserves state)
>
  <Tabs.ContentGroup>
    <Tabs.Content value="list">
      {/* Only renders when activeTab === "list" */}
    </Tabs.Content>
    
    <Tabs.Content value="analytics">
      {/* Only renders when first selected */}
    </Tabs.Content>
  </Tabs.ContentGroup>
</Tabs.Root>
```

**When to use**:
- ✅ Tabs with heavy components (data fetching, charts, large lists)
- ✅ Multiple tabs that won't all be used in a session

**References**:
- Chakra UI Docs: https://chakra-ui.com/docs/components/tabs

---

## Pattern 2: React.memo for Component Isolation

### The Solution

Wrap child components in `React.memo`:

```typescript
// ⚡ PERFORMANCE: Prevent re-renders when parent re-renders
export const HeavyChildComponent = React.memo(function HeavyChildComponent({ data }) {
  // Only re-renders if `data` prop changes
  return <ComplexUI data={data} />;
});
```

---

## Pattern 3: useMemo at Consumption Point

### The Solution

Memoize the returned object at the **consumption point**:

```typescript
function MyPage() {
  const rawResult = useSomeData();
  
  // ⚡ Memoize to stabilize object reference
  const result = useMemo(() => rawResult, [
    rawResult.data,
    rawResult.loading,
    rawResult.error
  ]);
  
  return <Child data={result} />;
}
```

---

## Pattern 4: HTML Nesting Validation

**Common Invalid Nesting**:
- `<p>` cannot contain: `<div>`, `<h1-h6>`, `<p>`, `<ul>`, `<table>`

```typescript
// ❌ INVALID
<Text>  {/* <p> */}
  <Badge>Alto</Badge>  {/* <div> → INVALID! */}
</Text>

// ✅ VALID
<HStack>
  <Text>Riesgo:</Text>
  <Badge>Alto</Badge>
</HStack>
```

---

## Related Documentation

- [MODAL_STATE_BEST_PRACTICES.md](./MODAL_STATE_BEST_PRACTICES.md)
- [ARCHITECTURE_PERFORMANCE_AUDIT.md](./ARCHITECTURE_PERFORMANCE_AUDIT.md)
