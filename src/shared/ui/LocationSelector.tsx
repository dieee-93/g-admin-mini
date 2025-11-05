// ================================================================
// LOCATION SELECTOR COMPONENT
// ================================================================
// Purpose: Global location selector for multi-location mode
// Usage: Place in Navbar for app-wide location selection
// ================================================================

import { Stack, Text, Badge, Box, NativeSelect } from '@/shared/ui';
import { useLocation } from '@/contexts/LocationContext';
import { BuildingOffice2Icon } from '@heroicons/react/24/outline';

export function LocationSelector() {
  const {
    locations,
    selectedLocation,
    selectLocation,
    selectAllLocations,
    isLoading
  } = useLocation();

  if (isLoading) {
    return (
      <Stack direction="row" align="center" gap="2">
        <BuildingOffice2Icon className="w-4 h-4 text-gray-500" />
        <Text size="sm" color="gray.subtle">Loading locations...</Text>
      </Stack>
    );
  }

  if (locations.length === 0) {
    return null;
  }

  // Don't show selector if only one location (always selected)
  if (locations.length === 1) {
    return (
      <Stack direction="row" align="center" gap="2" px="3" py="2">
        <BuildingOffice2Icon className="w-4 h-4 text-gray-500" />
        <Text size="sm" fontWeight="medium">
          {locations[0].name}
        </Text>
        {locations[0].punto_venta_afip && (
          <Badge variant="subtle" colorPalette="blue" size="sm">
            PDV {locations[0].punto_venta_afip}
          </Badge>
        )}
      </Stack>
    );
  }

  return (
    <Stack direction="row" align="center" gap="2" px="3" py="2">
      <BuildingOffice2Icon className="w-4 h-4 text-gray-500" />

      <NativeSelect.Root size="sm" width="200px">
        <NativeSelect.Field
          value={selectedLocation?.id || 'all'}
          onChange={(e) => {
            if (e.target.value === 'all') {
              selectAllLocations();
            } else {
              selectLocation(e.target.value);
            }
          }}
        >
          <option value="all">📊 All Locations</option>
          {locations.map(location => (
            <option key={location.id} value={location.id}>
              {location.code} - {location.name}
            </option>
          ))}
        </NativeSelect.Field>
        <NativeSelect.Indicator />
      </NativeSelect.Root>

      {selectedLocation?.punto_venta_afip && (
        <Badge variant="subtle" colorPalette="blue" size="sm">
          PDV {selectedLocation.punto_venta_afip}
        </Badge>
      )}
    </Stack>
  );
}

/**
 * Compact version for toolbar/header use
 */
export function LocationSelectorCompact() {
  const {
    locations,
    selectedLocation,
    selectLocation,
    selectAllLocations,
    isLoading
  } = useLocation();

  if (isLoading || locations.length <= 1) {
    return null;
  }

  return (
    <NativeSelect.Root size="sm" width="180px">
      <NativeSelect.Field
        value={selectedLocation?.id || 'all'}
        onChange={(e) => {
          if (e.target.value === 'all') {
            selectAllLocations();
          } else {
            selectLocation(e.target.value);
          }
        }}
      >
        <option value="all">All Locations</option>
        {locations.map(location => (
          <option key={location.id} value={location.id}>
            {location.code}
          </option>
        ))}
      </NativeSelect.Field>
      <NativeSelect.Indicator />
    </NativeSelect.Root>
  );
}

/**
 * Badge showing currently selected location
 */
export function LocationBadge() {
  const { selectedLocation, isMultiLocationMode } = useLocation();

  if (!isMultiLocationMode) {
    return null;
  }

  return (
    <Stack direction="row" gap="2" align="center">
      {selectedLocation ? (
        <>
          <Badge variant="solid" colorPalette="blue" size="sm">
            {selectedLocation.name}
          </Badge>
          {selectedLocation.punto_venta_afip && (
            <Badge variant="outline" colorPalette="purple" size="sm">
              PDV {selectedLocation.punto_venta_afip}
            </Badge>
          )}
        </>
      ) : (
        <Badge variant="outline" colorPalette="gray" size="sm">
          All Locations
        </Badge>
      )}
    </Stack>
  );
}