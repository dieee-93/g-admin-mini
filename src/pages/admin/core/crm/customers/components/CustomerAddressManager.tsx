import { useState, useEffect } from 'react';
import {
  Stack,
  Button,
  Text,
  Badge,
  CardWrapper,
  IconButton,
} from '@/shared/ui';
import {
  PlusIcon,
  MapPinIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { notify } from '@/lib/notifications';
import { logger } from '@/lib/logging';
import {
  getCustomerAddresses,
  deleteCustomerAddress,
} from '../services/customerAddressesApi';
import type { CustomerAddress } from '../types/customerAddress';
import { formatAddressDisplay, hasCoordinates } from '../types/customerAddress';
import { CustomerAddressFormModal } from './CustomerAddressFormModal';

interface CustomerAddressManagerProps {
  customerId: string;
}

export function CustomerAddressManager({ customerId }: CustomerAddressManagerProps) {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | undefined>();

  // Load addresses
  useEffect(() => {
    loadAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerId]);

  const loadAddresses = async () => {
    try {
      setIsLoading(true);
      const data = await getCustomerAddresses(customerId);
      setAddresses(data);
    } catch (error) {
      logger.error('CustomerAddressManager', 'Error loading addresses', error);
      notify.error({
        title: 'Error al cargar direcciones',
        description: 'No se pudieron cargar las direcciones del cliente',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNew = () => {
    setEditingAddress(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (address: CustomerAddress) => {
    setEditingAddress(address);
    setIsModalOpen(true);
  };

  const handleDelete = async (address: CustomerAddress) => {
    if (!confirm(`¿Eliminar la dirección "${address.label}"?`)) {
      return;
    }

    try {
      await deleteCustomerAddress(address.id);
      notify.success({
        title: 'Dirección eliminada',
        description: `${address.label} fue eliminada correctamente`,
      });
      await loadAddresses();
    } catch (error) {
      logger.error('CustomerAddressManager', 'Error deleting address', error);
      notify.error({
        title: 'Error al eliminar',
        description: 'No se pudo eliminar la dirección',
      });
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingAddress(undefined);
  };

  const handleSaved = async () => {
    await loadAddresses();
  };

  if (isLoading) {
    return (
      <CardWrapper p="6">
        <Stack align="center" py="8">
          <Text color="gray.500">Cargando direcciones...</Text>
        </Stack>
      </CardWrapper>
    );
  }

  return (
    <>
      <CardWrapper p="6">
        <Stack gap="4">
          {/* Header */}
          <Stack direction="row" justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="semibold">
              Direcciones de Entrega
            </Text>
            <Button
              size="sm"
              colorPalette="blue"
              onClick={handleAddNew}
            >
              <PlusIcon className="w-4 h-4" />
              Agregar Dirección
            </Button>
          </Stack>

          {/* Address List */}
          {addresses.length === 0 ? (
            <Stack align="center" py="8" gap="2">
              <MapPinIcon className="w-12 h-12 text-gray-400" />
              <Text color="gray.500" textAlign="center">
                No hay direcciones registradas
              </Text>
              <Text fontSize="sm" color="gray.400" textAlign="center">
                Agrega una dirección para habilitar entregas a domicilio
              </Text>
            </Stack>
          ) : (
            <Stack gap="3">
              {addresses.map((address) => (
                <CardWrapper
                  key={address.id}
                  p="4"
                  borderWidth="1px"
                  borderColor="gray.200"
                  _hover={{ borderColor: 'gray.300', shadow: 'sm' }}
                  transition="all 0.2s"
                >
                  <Stack gap="2">
                    {/* Label with Default Badge */}
                    <Stack direction="row" justify="space-between" align="center">
                      <Stack direction="row" align="center" gap="2">
                        <MapPinIcon className="w-5 h-5 text-gray-500" />
                        <Text fontWeight="semibold">{address.label}</Text>
                        {address.is_default && (
                          <Badge colorPalette="blue" size="sm">
                            Predeterminada
                          </Badge>
                        )}
                      </Stack>

                      {/* Action Buttons */}
                      <Stack direction="row" gap="1">
                        <IconButton
                          aria-label="Editar dirección"
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(address)}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </IconButton>
                        <IconButton
                          aria-label="Eliminar dirección"
                          size="sm"
                          variant="ghost"
                          colorPalette="red"
                          onClick={() => handleDelete(address)}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </IconButton>
                      </Stack>
                    </Stack>

                    {/* Address */}
                    <Text fontSize="sm" color="gray.700">
                      {formatAddressDisplay(address)}
                    </Text>

                    {/* Delivery Instructions */}
                    {address.delivery_instructions && (
                      <Text fontSize="sm" color="gray.600" fontStyle="italic">
                        "{address.delivery_instructions}"
                      </Text>
                    )}

                    {/* Coordinates (if geocoded) */}
                    {hasCoordinates(address) && (
                      <Text fontSize="xs" color="gray.500">
                        📍 Coordenadas: {address.latitude?.toFixed(6)}, {address.longitude?.toFixed(6)}
                      </Text>
                    )}

                    {/* Usage Stats */}
                    {address.usage_count > 0 && (
                      <Text fontSize="xs" color="gray.500">
                        Usada {address.usage_count} {address.usage_count === 1 ? 'vez' : 'veces'}
                        {address.last_used_at && ` • Última: ${new Date(address.last_used_at).toLocaleDateString()}`}
                      </Text>
                    )}
                  </Stack>
                </CardWrapper>
              ))}
            </Stack>
          )}
        </Stack>
      </CardWrapper>

      {/* Form Modal */}
      <CustomerAddressFormModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        customerId={customerId}
        address={editingAddress}
        onSaved={handleSaved}
      />
    </>
  );
}
