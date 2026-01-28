# 🍞 Toast Quick Reference

**System:** Chakra UI v3 Toast Notifications  
**Last Updated:** January 27, 2026  
**Type:** Simple Alerts (Layer 1) - User Feedback

---

## 🎯 What Are Toasts?

**Toasts** are temporary, non-blocking notifications that appear briefly to provide feedback on user actions.

### Toast vs Alert vs Smart Alert

| Feature | Toast (Layer 1) | Alert (Layer 2) | Smart Alert (Layer 2) |
|---------|----------------|-----------------|----------------------|
| **Duration** | 3-15 seconds | Until dismissed | Until resolved |
| **Persistence** | Not saved | Saved to DB | Saved to DB |
| **Purpose** | User feedback | Important notices | Business intelligence |
| **Trigger** | User action | System event | Data condition |
| **Examples** | "Item saved", "Error occurred" | "New order received" | "5 items low stock" |

---

## 📦 Import

```typescript
import { toaster } from '@/shared/ui';
```

**⚠️ CRITICAL:** Never import from `@chakra-ui/react` directly!

```typescript
// ❌ WRONG
import { createToaster } from '@chakra-ui/react';

// ✅ CORRECT
import { toaster } from '@/shared/ui';
```

---

## 🚀 Basic Usage

### Success Toast
```typescript
toaster.create({
  title: "Item Created",
  description: "Material added successfully",
  type: "success",
  duration: 3000
});
```

### Error Toast
```typescript
toaster.create({
  title: "Error",
  description: "Failed to save item. Please try again.",
  type: "error",
  duration: 5000
});
```

### Warning Toast
```typescript
toaster.create({
  title: "Warning",
  description: "Stock level is low",
  type: "warning",
  duration: 4000
});
```

### Info Toast
```typescript
toaster.create({
  title: "Info",
  description: "Processing your request...",
  type: "info",
  duration: 3000
});
```

### Loading Toast
```typescript
const toastId = toaster.create({
  title: "Processing...",
  description: "Please wait while we process your request",
  type: "loading",
  duration: null, // Don't auto-dismiss
});

// Later, update the toast
toaster.update(toastId, {
  title: "Success!",
  description: "Request processed successfully",
  type: "success",
  duration: 3000
});
```

---

## 🎨 Toast Types

### Available Types
- `success` - ✅ Green checkmark
- `error` - ❌ Red X
- `warning` - ⚠️ Yellow triangle
- `info` - ℹ️ Blue info icon
- `loading` - ⏳ Spinner animation

---

## ⚙️ Configuration Options

```typescript
toaster.create({
  // Required
  title: string,              // Main message
  
  // Optional
  description?: string,       // Additional details
  type?: 'success' | 'error' | 'warning' | 'info' | 'loading',
  duration?: number | null,   // Duration in ms (null = no auto-dismiss)
  closable?: boolean,         // Show close button (default: true)
  
  // Advanced
  action?: {
    label: string,
    onClick: () => void
  },
  
  // Positioning (use default from toaster config)
  placement?: 'top' | 'bottom' | 'top-start' | 'top-end' | 'bottom-start' | 'bottom-end'
});
```

---

## 📍 Placement

Default configuration in `src/shared/ui/toaster.tsx`:
```typescript
export const toaster = createToaster({
  placement: "bottom-end",      // Bottom right corner
  pauseOnPageIdle: true,        // Pause duration when user is idle
});
```

Available placements:
- `top`
- `top-start` (top-left)
- `top-end` (top-right)
- `bottom`
- `bottom-start` (bottom-left)
- `bottom-end` (bottom-right) ✅ Default

---

## 💡 Common Patterns

### Pattern 1: Form Success
```typescript
const handleSubmit = async (data: FormData) => {
  try {
    await saveItem(data);
    
    toaster.create({
      title: "Item Saved",
      description: `${data.name} has been added successfully`,
      type: "success",
      duration: 3000
    });
    
    onClose(); // Close modal
  } catch (error) {
    toaster.create({
      title: "Error",
      description: "Failed to save item",
      type: "error",
      duration: 5000
    });
  }
};
```

### Pattern 2: Async Operation with Loading State
```typescript
const handleProcess = async () => {
  const toastId = toaster.create({
    title: "Processing...",
    description: "This may take a few seconds",
    type: "loading",
    duration: null
  });

  try {
    const result = await processData();
    
    toaster.update(toastId, {
      title: "Complete!",
      description: `Processed ${result.count} items`,
      type: "success",
      duration: 3000
    });
  } catch (error) {
    toaster.update(toastId, {
      title: "Failed",
      description: error.message,
      type: "error",
      duration: 5000
    });
  }
};
```

### Pattern 3: Action Button
```typescript
const handleDelete = async (itemId: string) => {
  toaster.create({
    title: "Item Deleted",
    description: "Item has been removed",
    type: "info",
    duration: 5000,
    action: {
      label: "Undo",
      onClick: () => restoreItem(itemId)
    }
  });
};
```

### Pattern 4: Batch Operations
```typescript
const processBatch = async (items: Item[]) => {
  const toastId = toaster.create({
    title: "Processing batch...",
    description: `0 of ${items.length} processed`,
    type: "loading",
    duration: null
  });

  for (let i = 0; i < items.length; i++) {
    await processItem(items[i]);
    
    toaster.update(toastId, {
      description: `${i + 1} of ${items.length} processed`,
      type: "loading"
    });
  }

  toaster.update(toastId, {
    title: "Batch Complete!",
    description: `All ${items.length} items processed`,
    type: "success",
    duration: 3000
  });
};
```

---

## 🎯 Best Practices

### ✅ DO
- Use toasts for immediate user feedback
- Keep titles short and actionable
- Use appropriate types (success, error, warning, info)
- Set reasonable durations (3-5 seconds)
- Use loading state for async operations
- Update loading toasts to success/error

### ❌ DON'T
- Use toasts for critical errors (use Alert dialog)
- Stack too many toasts at once (max 3)
- Use very long durations (> 10 seconds)
- Use toasts for persistent information (use Smart Alerts)
- Import from `@chakra-ui/react` directly
- Forget to update loading toasts

---

## 🧪 Testing Toasts

### Manual Test Checklist
- [ ] Toast appears in correct position
- [ ] Correct type icon/spinner displays
- [ ] Title and description render correctly
- [ ] Toast auto-dismisses after duration
- [ ] Close button works
- [ ] Action button works (if applicable)
- [ ] Multiple toasts stack correctly
- [ ] Loading toast updates correctly
- [ ] Theme colors apply correctly

### Test Component
```tsx
// Test in any page/component
import { Button, Stack } from '@/shared/ui';
import { toaster } from '@/shared/ui';

function ToastTest() {
  return (
    <Stack gap={2}>
      <Button onClick={() => toaster.create({
        title: "Success",
        description: "Operation completed",
        type: "success"
      })}>
        Test Success
      </Button>
      
      <Button onClick={() => toaster.create({
        title: "Error",
        description: "Something went wrong",
        type: "error"
      })}>
        Test Error
      </Button>
      
      <Button onClick={() => toaster.create({
        title: "Warning",
        description: "Please review this",
        type: "warning"
      })}>
        Test Warning
      </Button>
      
      <Button onClick={() => toaster.create({
        title: "Loading",
        type: "loading",
        duration: null
      })}>
        Test Loading
      </Button>
    </Stack>
  );
}
```

---

## 🔧 Troubleshooting

### Toast Doesn't Appear
✅ Check `<Toaster />` is inside `<Provider>` in App.tsx  
✅ Verify import from `@/shared/ui`  
✅ Check browser console for errors

### Context Error
```
ContextError: useContext returned `undefined`
```
✅ See [TOASTER_ARCHITECTURE_AUDIT.md](./TOASTER_ARCHITECTURE_AUDIT.md) - Fix is to move `<Toaster />` inside `<Provider>`

### Toast Position Wrong
✅ Check `placement` config in `toaster.tsx`  
✅ Verify z-index isn't blocked by other elements

### Toast Theme Wrong
✅ Verify theme system is loaded  
✅ Check Provider is wrapping Toaster

---

## 📚 References

- **Architecture:** [TOASTER_ARCHITECTURE_AUDIT.md](./TOASTER_ARCHITECTURE_AUDIT.md)
- **Smart Alerts:** [SMART_ALERTS_GUIDE.md](./SMART_ALERTS_GUIDE.md)
- **Project Standards:** [AGENTS.md](../../AGENTS.md)
- **Chakra UI Docs:** https://chakra-ui.com/docs/components/toast

---

## 🎓 When to Use What

### Use Toast When:
✅ Confirming a user action completed  
✅ Showing transient status updates  
✅ Displaying non-critical errors  
✅ Providing quick feedback (< 15 seconds)

### Use Alert Dialog When:
✅ Requiring user decision (confirm/cancel)  
✅ Critical errors that block workflow  
✅ Important warnings needing acknowledgment

### Use Smart Alert When:
✅ Business condition detected (low stock)  
✅ Persistent notifications needed  
✅ Tracking/analytics required  
✅ Multi-user/global notifications

---

**Last Updated:** January 27, 2026  
**Maintained By:** Development Team  
**Questions?** See [SMART_ALERTS_GUIDE.md](./SMART_ALERTS_GUIDE.md)
