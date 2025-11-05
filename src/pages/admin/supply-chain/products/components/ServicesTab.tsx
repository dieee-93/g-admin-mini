/**
 * Services Tab Component
 * Based on: IMPLEMENTATION_ROADMAP_DISTRIBUTED_FEATURES.md Week 4
 * Tab for managing appointment services in Products module
 * Following project patterns (NO React Query)
 */

import { useState, useEffect, useCallback } from 'react';
import { Stack, Text, Grid, Table } from '@chakra-ui/react';
import {
  Button,
  CardWrapper,
  Icon,
  Badge,
  Alert,
  Input,
  Field,
} from '@/shared/ui';
import {
  PlusIcon,
  ClockIcon,
  CurrencyDollarIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { ServiceConfigurationManager } from './ServiceConfigurationManager';
import type { ServiceFormData } from './ServiceConfigurationManager';
import { supabase } from '@/lib/supabase/client';
import { notify } from '@/lib/notifications';

interface Service extends ServiceFormData {
  id: string;
  created_at: string;
  updated_at: string;
}

const CANCELLATION_POLICY_LABELS: Record<string, string> = {
  flexible: 'Flexible',
  '24h_notice': '24h Notice',
  '48h_notice': '48h Notice',
  strict: 'Strict',
};

export function ServicesTab() {
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch services
  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('type', 'SERVICE')
        .order('name');

      if (error) throw error;
      setServices((data || []) as Service[]);
    } catch (error) {
      console.error('Error fetching services:', error);
      notify.error({
        title: 'Failed to load services',
        description: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // Create service
  const createService = async (serviceData: ServiceFormData) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([serviceData])
        .select()
        .single();

      if (error) throw error;

      await fetchServices(); // Refresh list
      notify.success({
        title: 'Service created',
        description: 'The service has been created successfully.',
      });
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while creating the service.';
      notify.error({
        title: 'Failed to create service',
        description: errorMessage,
      });
      throw error;
    }
  };

  // Update service
  const updateService = async ({ id, serviceData }: { id: string; serviceData: ServiceFormData }) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(serviceData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchServices(); // Refresh list
      notify.success({
        title: 'Service updated',
        description: 'The service has been updated successfully.',
      });
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while updating the service.';
      notify.error({
        title: 'Failed to update service',
        description: errorMessage,
      });
      throw error;
    }
  };

  // Delete service
  const deleteService = async (id: string) => {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);

      if (error) throw error;

      await fetchServices(); // Refresh list
      notify.success({
        title: 'Service deleted',
        description: 'The service has been deleted successfully.',
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred while deleting the service.';
      notify.error({
        title: 'Failed to delete service',
        description: errorMessage,
      });
      throw error;
    }
  };

  // Handlers
  const handleCreateService = () => {
    setEditingService(undefined);
    setShowServiceModal(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setShowServiceModal(true);
  };

  const handleDeleteService = async (service: Service) => {
    if (window.confirm(`¿Eliminar el servicio "${service.name}"?`)) {
      await deleteService(service.id);
    }
  };

  const handleSaveService = async (serviceData: ServiceFormData) => {
    if (editingService) {
      await updateService({ id: editingService.id, serviceData });
    } else {
      await createService(serviceData);
    }
  };

  // Filter services
  const filteredServices = services.filter((service) =>
    searchTerm
      ? service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category?.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  // Calculate stats
  const activeServices = services.filter((s) => s.is_active).length;
  const onlineBookableServices = services.filter((s) => s.available_for_online_booking).length;
  const averageDuration =
    services.length > 0
      ? Math.round(services.reduce((sum, s) => sum + s.duration_minutes, 0) / services.length)
      : 0;
  // Average price calculation (currently unused - can be displayed in stats section)
  // const averagePrice = services.length > 0
  //   ? (services.reduce((sum, s) => sum + s.price, 0) / services.length).toFixed(2)
  //   : '0.00';

  return (
    <Stack gap="6">
      {/* Header */}
      <Stack direction="row" justify="space-between" align="center">
        <Stack gap="1">
          <Text fontSize="2xl" fontWeight="bold">
            Appointment Services
          </Text>
          <Text color="text.muted">
            Manage services that customers can book for appointments
          </Text>
        </Stack>

        <Button colorPalette="purple" onClick={handleCreateService}>
          <Icon icon={PlusIcon} size="sm" />
          Create Service
        </Button>
      </Stack>

      {/* Stats Cards */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap="4">
        <CardWrapper variant="subtle">
          <CardWrapper.Body>
            <Stack gap="1">
              <Text fontSize="xs" color="text.muted" fontWeight="medium">
                TOTAL SERVICES
              </Text>
              <Text fontSize="2xl" fontWeight="bold">
                {services.length}
              </Text>
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>

        <CardWrapper variant="subtle">
          <CardWrapper.Body>
            <Stack gap="1">
              <Text fontSize="xs" color="text.muted" fontWeight="medium">
                ACTIVE
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="green.600">
                {activeServices}
              </Text>
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>

        <CardWrapper variant="subtle">
          <CardWrapper.Body>
            <Stack gap="1">
              <Text fontSize="xs" color="text.muted" fontWeight="medium">
                ONLINE BOOKABLE
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="blue.600">
                {onlineBookableServices}
              </Text>
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>

        <CardWrapper variant="subtle">
          <CardWrapper.Body>
            <Stack gap="1">
              <Text fontSize="xs" color="text.muted" fontWeight="medium">
                AVG DURATION
              </Text>
              <Text fontSize="2xl" fontWeight="bold" color="purple.600">
                {averageDuration}m
              </Text>
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>
      </Grid>

      {/* Info Alert */}
      <Alert
        variant="subtle"
        title="Services Configuration"
        description="Services are products of type SERVICE. Configure duration, pricing, booking policies, and assign professionals in the Staff module."
      />

      {/* Search */}
      <Field.Root>
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search services by name, description, or category..."
          size="md"
        />
        <Field.HelperText>
          <Icon icon={MagnifyingGlassIcon} size="sm" />
          Filter services
        </Field.HelperText>
      </Field.Root>

      {/* Services Table */}
      <CardWrapper>
        <CardWrapper.Body p="0">
          {isLoading ? (
            <Stack gap="4" align="center" py="12">
              <Text color="text.muted">Loading services...</Text>
            </Stack>
          ) : filteredServices.length === 0 ? (
            <Stack gap="4" align="center" py="12">
              <Icon icon={PlusIcon} size="2xl" color="text.muted" />
              <Stack gap="1" align="center">
                <Text fontWeight="medium" color="text.muted">
                  {searchTerm ? 'No services found' : 'No services created yet'}
                </Text>
                <Text fontSize="sm" color="text.muted">
                  {searchTerm
                    ? 'Try a different search term'
                    : 'Create your first appointment service to get started'}
                </Text>
              </Stack>
              {!searchTerm && (
                <Button colorPalette="purple" onClick={handleCreateService}>
                  <Icon icon={PlusIcon} size="sm" />
                  Create Service
                </Button>
              )}
            </Stack>
          ) : (
            <Table.Root size="sm" variant="line">
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeader>Service</Table.ColumnHeader>
                  <Table.ColumnHeader>Category</Table.ColumnHeader>
                  <Table.ColumnHeader>Duration</Table.ColumnHeader>
                  <Table.ColumnHeader>Price</Table.ColumnHeader>
                  <Table.ColumnHeader>Policy</Table.ColumnHeader>
                  <Table.ColumnHeader>Status</Table.ColumnHeader>
                  <Table.ColumnHeader width="120px">Actions</Table.ColumnHeader>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {filteredServices.map((service) => (
                  <Table.Row key={service.id}>
                    {/* Service Name */}
                    <Table.Cell>
                      <Stack gap="1">
                        <Text fontWeight="medium">{service.name}</Text>
                        {service.description && (
                          <Text fontSize="sm" color="text.muted" noOfLines={1}>
                            {service.description}
                          </Text>
                        )}
                      </Stack>
                    </Table.Cell>

                    {/* Category */}
                    <Table.Cell>
                      <Badge colorPalette="gray" size="sm">
                        {service.category || 'Uncategorized'}
                      </Badge>
                    </Table.Cell>

                    {/* Duration */}
                    <Table.Cell>
                      <Stack direction="row" gap="1" align="center">
                        <Icon icon={ClockIcon} size="sm" color="text.muted" />
                        <Text fontSize="sm">{service.duration_minutes}m</Text>
                      </Stack>
                    </Table.Cell>

                    {/* Price */}
                    <Table.Cell>
                      <Stack direction="row" gap="1" align="center">
                        <Icon icon={CurrencyDollarIcon} size="sm" color="text.muted" />
                        <Text fontSize="sm">${service.price.toFixed(2)}</Text>
                      </Stack>
                    </Table.Cell>

                    {/* Cancellation Policy */}
                    <Table.Cell>
                      <Text fontSize="sm">
                        {CANCELLATION_POLICY_LABELS[service.cancellation_policy]}
                      </Text>
                    </Table.Cell>

                    {/* Status */}
                    <Table.Cell>
                      <Stack gap="1">
                        {service.is_active ? (
                          <Badge colorPalette="green" size="sm">
                            <Icon icon={CheckCircleIcon} size="xs" />
                            Active
                          </Badge>
                        ) : (
                          <Badge colorPalette="gray" size="sm">
                            <Icon icon={XCircleIcon} size="xs" />
                            Inactive
                          </Badge>
                        )}
                        {service.available_for_online_booking && (
                          <Badge colorPalette="blue" size="sm" variant="subtle">
                            Online
                          </Badge>
                        )}
                      </Stack>
                    </Table.Cell>

                    {/* Actions */}
                    <Table.Cell>
                      <Stack direction="row" gap="1">
                        <Button
                          size="xs"
                          variant="ghost"
                          colorPalette="blue"
                          onClick={() => handleEditService(service)}
                        >
                          <Icon icon={PencilIcon} size="sm" />
                        </Button>
                        <Button
                          size="xs"
                          variant="ghost"
                          colorPalette="red"
                          onClick={() => handleDeleteService(service)}
                        >
                          <Icon icon={TrashIcon} size="sm" />
                        </Button>
                      </Stack>
                    </Table.Cell>
                  </Table.Row>
                ))}
              </Table.Body>
            </Table.Root>
          )}
        </CardWrapper.Body>
      </CardWrapper>

      {/* Service Configuration Modal */}
      <ServiceConfigurationManager
        isOpen={showServiceModal}
        onClose={() => {
          setShowServiceModal(false);
          setEditingService(undefined);
        }}
        onSave={handleSaveService}
        service={editingService}
        mode={editingService ? 'edit' : 'create'}
      />
    </Stack>
  );
}
