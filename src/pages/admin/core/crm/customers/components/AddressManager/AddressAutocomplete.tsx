/**
 * AddressAutocomplete Component
 *
 * Componente de autocompletado de direcciones usando la API de Georef AR
 * Muestra sugerencias mientras el usuario escribe y preview en mapa
 *
 * Features:
 * - ✅ Autocomplete con API Georef AR (gratis, oficial gobierno argentino)
 * - ✅ Debounce de 500ms
 * - ✅ Dropdown con sugerencias estructuradas
 * - ✅ Mini mapa preview con Leaflet
 * - ✅ Auto-población de todos los campos
 * - ✅ Desambiguación (ej: múltiples "Calle Perón")
 */

import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Box,
  Stack,
  Input,
  Text,
  Spinner,
  Badge
} from '@/shared/ui';
import { GeocodingService, type AddressSuggestion } from '@/lib/geocoding';

// Fix Leaflet default icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface AddressAutocompleteProps {
  onSelect: (address: AddressSuggestion) => void;
  placeholder?: string;
  provincia?: string;
  defaultValue?: string;
  showMap?: boolean;
}

// Map controller para centrar en nueva posición
function MapController({ position }: { position: [number, number] }) {
  const map = useMap();

  useEffect(() => {
    map.setView(position, 15, { animate: true });
  }, [map, position]);

  return null;
}

export function AddressAutocomplete({
  onSelect,
  placeholder = 'Ej: Alfredo Palacios 2817',
  provincia,
  defaultValue = '',
  showMap = true
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [hoveredSuggestion, setHoveredSuggestion] = useState<AddressSuggestion | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-34.6037, -58.3816]); // Buenos Aires default

  // Ubicación del usuario para ordenar por proximidad
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<'pending' | 'granted' | 'denied'>('pending');

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Obtener geolocalización del usuario al montar
  useEffect(() => {
    // Intentar obtener ubicación guardada en localStorage primero
    const savedLocation = localStorage.getItem('g-admin-user-location');
    if (savedLocation) {
      try {
        const location = JSON.parse(savedLocation);
        setUserLocation(location);
        setLocationPermission('granted');
        console.log('📍 [Geolocation] Loaded from localStorage:', location);
      } catch (error) {
        console.error('Error parsing saved location:', error);
      }
    }

    // Intentar obtener ubicación del navegador
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
          setLocationPermission('granted');

          // Guardar en localStorage para próximas veces
          localStorage.setItem('g-admin-user-location', JSON.stringify(location));

          console.log('📍 [Geolocation] Location obtained:', location);
        },
        (error) => {
          setLocationPermission('denied');
          console.warn('⚠️ [Geolocation] Permission denied or error:', error.message);

          // Fallback: usar Buenos Aires como centro
          setUserLocation({ lat: -34.6037, lng: -58.3816 });
        },
        {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 300000 // 5 minutos de caché
        }
      );
    } else {
      console.warn('⚠️ [Geolocation] Not supported in this browser');
      setUserLocation({ lat: -34.6037, lng: -58.3816 });
    }
  }, []);

  // Click outside para cerrar dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Buscar direcciones con debounce
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (query.length < 3) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);

    debounceTimer.current = setTimeout(async () => {
      try {
        const results = await GeocodingService.searchAddresses(query, provincia, 10);

        // Si tenemos ubicación del usuario, ordenar por proximidad
        let sortedResults = results;
        if (userLocation) {
          sortedResults = GeocodingService.sortByProximity(
            results,
            userLocation.lat,
            userLocation.lng
          );
          console.log('📊 [Sort] Sorted by proximity:', sortedResults.slice(0, 3).map(r => ({
            name: r.nomenclatura,
            distance: r.distance ? `${GeocodingService.formatDistance(r.distance)}` : 'N/A'
          })));
        }

        setSuggestions(sortedResults);
        setIsOpen(sortedResults.length > 0);

        // Si hay resultados, centrar mapa en el primero
        if (sortedResults.length > 0 && showMap) {
          setMapCenter([sortedResults[0].latitude, sortedResults[0].longitude]);
          setHoveredSuggestion(sortedResults[0]);
        }
      } catch (error) {
        console.error('Error searching addresses:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 500);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, provincia, showMap]);

  // Seleccionar sugerencia
  const handleSelect = (suggestion: AddressSuggestion) => {
    setQuery(suggestion.nomenclatura);
    setIsOpen(false);
    setSuggestions([]);
    onSelect(suggestion);
    inputRef.current?.blur();
  };

  // Navegación con teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  // Actualizar mapa cuando se hoverea una sugerencia
  const handleMouseEnter = (suggestion: AddressSuggestion) => {
    if (showMap) {
      setHoveredSuggestion(suggestion);
      setMapCenter([suggestion.latitude, suggestion.longitude]);
    }
  };

  return (
    <Box ref={wrapperRef} position="relative" width="100%">
      <Stack gap="sm">
        {/* Input field */}
        <Box position="relative">
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) {
                setIsOpen(true);
              }
            }}
            placeholder={placeholder}
            style={{ paddingRight: isLoading ? '40px' : '12px' }}
          />

          {/* Loading spinner */}
          {isLoading && (
            <Box
              position="absolute"
              right="10px"
              top="50%"
              transform="translateY(-50%)"
              pointerEvents="none"
            >
              <Spinner size="sm" />
            </Box>
          )}
        </Box>

        {/* Dropdown suggestions */}
        {isOpen && suggestions.length > 0 && (
          <Box
            position="absolute"
            top="100%"
            left="0"
            right="0"
            zIndex="dropdown"
            mt="2"
            bg="bg"
            border="1px solid"
            borderColor="border"
            borderRadius="lg"
            boxShadow="0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
            maxHeight="320px"
            overflowY="auto"
          >
            {suggestions.map((suggestion, index) => (
              <Box
                key={suggestion.id}
                px="4"
                py="3"
                cursor="pointer"
                bg={
                  index === selectedIndex
                    ? 'colorPalette.muted'
                    : hoveredSuggestion?.id === suggestion.id
                    ? 'colorPalette.muted'
                    : 'bg'
                }
                borderBottom={index < suggestions.length - 1 ? '1px solid' : 'none'}
                borderColor="border.subtle"
                transition="all 0.15s ease"
                _hover={{ 
                  bg: 'colorPalette.muted',
                  borderLeftWidth: '3px',
                  borderLeftColor: 'colorPalette.solid',
                  pl: '3.5'
                }}
                onClick={() => handleSelect(suggestion)}
                onMouseEnter={() => handleMouseEnter(suggestion)}
                colorPalette="blue"
              >
                <Stack gap="1.5">
                  {/* Dirección principal */}
                  <Text fontSize="sm" fontWeight="600" color="fg" lineHeight="1.4">
                    {suggestion.calle} {suggestion.altura || 's/n'}
                  </Text>
                  
                  {/* Ubicación secundaria */}
                  <Stack direction="row" gap="2" align="center" wrap="wrap">
                    <Text fontSize="xs" color="fg.muted" lineHeight="1.3">
                      {suggestion.ciudad}, {suggestion.provincia}
                    </Text>

                    {/* Badge de distancia (si está disponible) */}
                    {suggestion.distance !== undefined && (
                      <>
                        <Text fontSize="xs" color="fg.subtle">•</Text>
                        <Badge
                          colorPalette={suggestion.distance < 5 ? 'green' : suggestion.distance < 20 ? 'blue' : 'gray'}
                          variant="subtle"
                          size="sm"
                          px="2"
                          py="0.5"
                          fontSize="xs"
                        >
                          📍 {GeocodingService.formatDistance(suggestion.distance)}
                        </Badge>
                      </>
                    )}

                    {suggestion.departamento && (
                      <>
                        <Text fontSize="xs" color="fg.subtle">•</Text>
                        <Badge
                          colorPalette="blue"
                          variant="subtle"
                          size="sm"
                          px="2"
                          py="0.5"
                          fontSize="xs"
                        >
                          {suggestion.departamento}
                        </Badge>
                      </>
                    )}
                  </Stack>
                  
                  {/* Coordenadas */}
                  <Text fontSize="xs" color="fg.subtle" fontFamily="mono" lineHeight="1.2">
                    📍 {suggestion.latitude.toFixed(6)}, {suggestion.longitude.toFixed(6)}
                  </Text>
                </Stack>
              </Box>
            ))}
          </Box>
        )}

        {/* Mini map preview */}
        {showMap && hoveredSuggestion && (
          <Box
            height="200px"
            borderRadius="md"
            overflow="hidden"
            border="1px solid"
            borderColor="gray.200"
          >
            <MapContainer
              center={mapCenter}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
              scrollWheelZoom={false}
              dragging={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <MapController position={mapCenter} />
              <Marker position={mapCenter} />
            </MapContainer>
          </Box>
        )}

        {/* Helper text */}
        {!isLoading && query.length > 0 && query.length < 3 && (
          <Text fontSize="xs" color="gray.500">
            Escribe al menos 3 caracteres para buscar
          </Text>
        )}

        {!isLoading && query.length >= 3 && suggestions.length === 0 && !isOpen && (
          <Text fontSize="xs" color="orange.600">
            ⚠️ No se encontraron direcciones. Intenta con otra búsqueda.
          </Text>
        )}

        {/* Geolocation status */}
        {locationPermission === 'granted' && userLocation && (
          <Text fontSize="xs" color="green.600">
            ✅ Resultados ordenados por proximidad
          </Text>
        )}
        {locationPermission === 'denied' && (
          <Text fontSize="xs" color="gray.500">
            💡 Activa la ubicación para ver resultados cercanos primero
          </Text>
        )}
      </Stack>
    </Box>
  );
}
