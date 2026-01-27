/**
 * Customer Address Manager
 * Componente principal para gestionar las direcciones de un cliente
 */

import { useState, useEffect } from 'react';
import {
  Stack,
  Button,
  Card,
  Text,
  Badge,
  IconButton,
  Alert,
  EmptyState
} from '@/shared/ui';
import {
  PlusIcon,
  MapPinIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { supabase } from '@/lib/supabase/client';
import { notify } from '@/lib/notifications';
import { AddressFormModal } from './AddressFormModal';
import { AddressMapPreview } from './AddressMapPreview';
import type { CustomerAddress } from '../../types/customer';
import { getAddressDisplay, getSortedAddresses } from '../../utils/addressHelpers';

interface CustomerAddressManagerProps {
  customerId: string;
  readOnly?: boolean;
}

export function CustomerAddressManager({ customerId, readOnly = false }: CustomerAddressManagerProps) {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<CustomerAddress | null>(null);

  // Load addresses
  useEffect(() => {
    loadAddresses();
  }, [customerId]);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customer_addresses')
        .select('*')
        .eq('customer_id', customerId)
        .order('is_default', { ascending: false })
        .order('usage_count', { ascending: false });

      if (error) throw error;

      setAddresses(data || []);

      // Auto-select default or first address for map
      const defaultAddr = data?.find(a => a.is_default) || data?.[0];
      if (defaultAddr) {
        setSelectedAddress(defaultAddr);
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
      notify.error({
        title: 'Error al cargar direcciones',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setIsModalOpen(true);
  };

  const handleEdit = (address: CustomerAddress) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  const handleDelete = async (addressId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta dirección?')) return;

    try {
      const { error } = await supabase
        .from('customer_addresses')
        .delete()
        .eq('id', addressId);

      if (error) throw error;

      notify.success({
        title: 'Dirección eliminada',
        description: 'La dirección fue eliminada correctamente'
      });

      loadAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      notify.error({
        title: 'Error al eliminar',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  const handleSetDefault = async (addressId: string) => {
    try {
      // Remove default from all addresses
      await supabase
        .from('customer_addresses')
        .update({ is_default: false })
        .eq('customer_id', customerId);

      // Set new default
      const { error } = await supabase
        .from('customer_addresses')
        .update({ is_default: true })
        .eq('id', addressId);

      if (error) throw error;

      notify.success({
        title: 'Dirección por defecto actualizada'
      });

      loadAddresses();
    } catch (error) {
      console.error('Error setting default:', error);
      notify.error({
        title: 'Error al actualizar',
        description: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  };

  if (loading) {
    return (
      <Stack p="md">
        <Text>Cargando direcciones...</Text>
      </Stack>
    );
  }

  const geocodedAddresses = addresses.filter(a => a.latitude && a.longitude);

  return (
    <Stack gap="md">
      {/* Header */}
      <Stack direction="row" justify="space-between" align="center">
        <Stack direction="row" align="center" gap="sm">
          <MapPinIcon style={{ width: '20px', height: '20px' }} />
          <Text fontWeight="semibold">Direcciones</Text>
          {addresses.length > 0 && (
            <Badge colorPalette="gray" variant="subtle">
              {addresses.length}
            </Badge>
          )}
        </Stack>

        {!readOnly && (
          <Button
            size="sm"
            colorPalette="blue"
            onClick={handleAddNew}
          >
            <PlusIcon style={{ width: '16px', height: '16px' }} />
            Agregar
          </Button>
        )}
      </Stack>

      {/* Address List */}
      {addresses.length === 0 ? (
        <EmptyState
          icon={<MapPinIcon style={{ width: '48px', height: '48px' }} />}
          title="Sin direcciones"
          description={readOnly ? "Este cliente no tiene direcciones registradas" : "Agrega la primera dirección del cliente"}
        >
          {!readOnly && (
            <Button colorPalette="blue" onClick={handleAddNew}>
              <PlusIcon style={{ width: '16px', height: '16px' }} />
              Agregar Dirección
            </Button>
          )}
        </EmptyState>
      ) : (
        <Stack gap="sm">
          {getSortedAddresses({ customer_addresses: addresses } as any).map((address) => (
            <Card.Root
              key={address.id}
              variant={selectedAddress?.id === address.id ? 'elevated' : 'outline'}
              onClick={() => setSelectedAddress(address)}
              style={{ cursor: 'pointer' }}
            >
              <Card.Body>
                <Stack gap="sm">
                  {/* Header: Label + Badges */}
                  <Stack direction="row" justify="space-between" align="center">
                    <Stack direction="row" align="center" gap="sm">
                      <Text fontWeight="semibold">{address.label}</Text>
                      {address.is_default && (
                        <Badge colorPalette="green" variant="subtle" size="sm">
                          Por defecto
                        </Badge>
                      )}
                      {address.is_verified && (
                        <Badge colorPalette="blue" variant="subtle" size="sm">
                          <CheckCircleIcon style={{ width: '12px', height: '12px' }} />
                          Verificada
                        </Badge>
                      )}
                    </Stack>

                    {!readOnly && (
                      <Stack direction="row" gap="xs">
                        {!address.is_default && (
                          <IconButton
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSetDefault(address.id);
                            }}
                            aria-label="Marcar como predeterminada"
                          >
                            <CheckCircleIcon style={{ width: '16px', height: '16px' }} />
                          </IconButton>
                        )}
                        <IconButton
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(address);
                          }}
                          aria-label="Editar"
                        >
                          <PencilIcon style={{ width: '16px', height: '16px' }} />
                        </IconButton>
                        <IconButton
                          size="sm"
                          variant="ghost"
                          colorPalette="red"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(address.id);
                          }}
                          aria-label="Eliminar"
                        >
                          <TrashIcon style={{ width: '16px', height: '16px' }} />
                        </IconButton>
                      </Stack>
                    )}
                  </Stack>

                  {/* Address Display */}
                  <Text fontSize="sm" color="gray.600">
                    {getAddressDisplay(address)}
                  </Text>

                  {/* Delivery Instructions */}
                  {address.delivery_instructions && (
                    <Text fontSize="sm" color="gray.500" fontStyle="italic">
                      📋 {address.delivery_instructions}
                    </Text>
                  )}

                  {/* Coordinates Info */}
                  {address.latitude && address.longitude && (
                    <Text fontSize="xs" color="gray.400">
                      📍 {address.latitude.toFixed(6)}, {address.longitude.toFixed(6)}
                    </Text>
                  )}

                  {/* Usage Stats */}
                  {address.usage_count > 0 && (
                    <Text fontSize="xs" color="gray.400">
                      Usada {address.usage_count} {address.usage_count === 1 ? 'vez' : 'veces'}
                    </Text>
                  )}
                </Stack>
              </Card.Body>
            </Card.Root>
          ))}
        </Stack>
      )}

      {/* Map Preview */}
      {geocodedAddresses.length > 0 && selectedAddress && (
        <Stack gap="sm">
          <Text fontSize="sm" fontWeight="semibold" color="gray.700">
            Vista de Mapa
          </Text>
          <AddressMapPreview addresses={geocodedAddresses} selectedAddress={selectedAddress} />
        </Stack>
      )}

      {/* Warning if no geocoded addresses */}
      {addresses.length > 0 && geocodedAddresses.length === 0 && (
        <Alert status="warning" title="Sin coordenadas">
          Ninguna dirección ha sido geocodificada. Edita las direcciones para obtener coordenadas automáticamente.
        </Alert>
      )}

      {/* Address Form Modal */}
      <AddressFormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingAddress(null);
        }}
        customerId={customerId}
        address={editingAddress}
        onSuccess={() => {
          loadAddresses();
        }}
      />
    </Stack>
  );
}
