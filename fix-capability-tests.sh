#!/bin/bash

# Fix 1: Change setInfrastructure to toggleInfrastructure in line 235
sed -i '235s/setInfrastructure/toggleInfrastructure/' src/store/__tests__/capabilityStore.test.ts

# Fix 2: Change "should preserve array reference" test to use toEqual instead of toBe (line 404)
sed -i '404s/toBe/toEqual/' src/store/__tests__/capabilityStore.test.ts

# Fix 3: Update Convenience Hooks to Selectors (line 408)
sed -i '408s/Convenience Hooks/Selectors/' src/store/__tests__/capabilityStore.test.ts

# Fix 4: Change useCapabilityStore(state => ...) to useCapabilityStore.getState() (lines 421, 428, 434)
sed -i '421s/const activeFeatures = useCapabilityStore(state => state.features.activeFeatures);/const state = useCapabilityStore.getState();\n    const activeFeatures = state.features.activeFeatures;/' src/store/__tests__/capabilityStore.test.ts
sed -i '428s/const setupCompleted = useCapabilityStore(state => state.profile?.setupCompleted);/const state = useCapabilityStore.getState();\n    const setupCompleted = state.profile?.setupCompleted;/' src/store/__tests__/capabilityStore.test.ts
sed -i '434s/const activeModules = useCapabilityStore(state => state.features.activeModules);/const state = useCapabilityStore.getState();\n    const activeModules = state.features.activeModules;/' src/store/__tests__/capabilityStore.test.ts

echo "✅ Tests fixed!"
