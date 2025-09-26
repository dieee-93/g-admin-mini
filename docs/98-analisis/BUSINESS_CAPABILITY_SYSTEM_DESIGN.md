# Business Capability System Design
**G-Admin Mini v2.1 - Consolidation Strategy**

## 🎯 **Business Capability System Design**

### **From Original System** (BusinessCapabilities.ts)
✅ **Keep:**
- Complete capability definitions with descriptions
- Business model templates (restaurant, ecommerce, services, etc.)
- Module dependency logic (`requires`, `provides`, `enhances`)
- Comprehensive capability lists per business model

✅ **Concepts to Integrate:**
- `requires`: Base capabilities needed for module activation
- `provides`: Features/capabilities this module enables
- `enhances`: Capabilities this module improves/extends

### **From My System** (moduleCapabilityMapping.ts)
✅ **Keep:**
- Flexible OR logic for shared dependencies
- Universal vs specific feature categorization
- Permissive approach (most modules available with different features)
- Feature-level activation within modules

✅ **Concepts to Preserve:**
- `base`: When to show module (OR logic)
- `features`: Granular feature activation
- `auto`: Universal shared dependencies
- Flexible triggers for same feature

## 🏗️ **Business Capability Architecture**

### **New Structure:**
```typescript
interface ModuleConfiguration {
  // FROM ORIGINAL: Dependency logic
  requires: BusinessCapability[];      // Must have ALL to show module
  provides: BusinessCapability[];      // Capabilities this module enables
  enhances?: BusinessCapability[];     // Capabilities this module improves

  // FROM MY SYSTEM: Flexible feature activation
  features: Record<string, {
    triggers: BusinessCapability[] | 'auto' | 'always';
    required?: boolean;  // NEW: true = always on if module visible, false = optional
    level?: 'basic' | 'advanced' | 'premium';  // NEW: feature sophistication
  }>;

  // FROM MY SYSTEM: Description and metadata
  description: string;
  category: 'core' | 'business' | 'operational' | 'advanced';
}
```

### **Business Capability Logic:**
1. **Module Visibility**: Use original `requires` logic (ALL conditions must be met)
2. **Feature Activation**: Use my flexible triggers with optional/required flags
3. **Shared Dependencies**: Maintain my AUTO resolution system
4. **Business Models**: Use original comprehensive templates as starting points

## 📋 **Implementation Plan**

### **Step 1: Create Enhanced System**
- Combine both approaches into new `business capabilityCapabilityMapping.ts`
- Migrate data from both systems
- Add new optional/required feature flags
- Preserve all existing functionality

### **Step 2: Update Integration Points**
- Update `useCapabilities` hook to use business capability system
- Update `NavigationContext` to use new logic
- Update `capabilityUtils` to work with business capability structure

### **Step 3: Clean Up Legacy Code**
- Remove original `moduleCapabilities` from BusinessCapabilities.ts
- Remove my old `MODULE_CAPABILITY_REQUIREMENTS`
- Clean up duplicate functions and unused code
- Update all imports and references

## 🎯 **Benefits of Business Capability**

### **Enhanced Capabilities:**
- **Better Business Models**: Use proven templates from original system
- **More Flexibility**: Keep my permissive feature activation
- **Optional Features**: New flag system for required vs optional features
- **Sophistication Levels**: Basic/advanced/premium feature tiers

### **Solved Problems:**
- **Restaurant without online menu**: `digital_catalog` becomes optional, not required
- **Universal features**: `payment_gateway`, `customer_management` remain auto
- **Business model accuracy**: Use original comprehensive definitions
- **Feature granularity**: Maintain my flexible trigger system

---

**Status**: Design Phase Complete
**Next**: Implementation of business capability system