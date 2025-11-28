/**
 * CATALOG MANAGEMENT COMPONENT
 * Manages product catalogs for e-commerce
 *
 * FEATURES:
 * - List all catalogs
 * - Create/edit/delete catalogs
 * - View products in each catalog
 * - Manage featured products
 */

import { useState } from 'react';
import {
  Stack,
  Button,
  Badge,
  Alert,
  Icon,
  Text,
  Spinner,
  Table,
  DialogRoot,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogHeader,
  DialogBody,
  DialogFooter,
  DialogTitle,
  DialogCloseTrigger,
  Input,
  Textarea,
  SelectField,
} from '@/shared/ui';
import {
  FolderIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { useCatalogs } from '../hooks';
import { logger } from '@/lib/logging';

export function CatalogManagement() {
  const {
    catalogs,
    loading,
    error,
    createCatalog,
    updateCatalog,
    deleteCatalog,
  } = useCatalogs();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCatalog, setEditingCatalog] = useState<{ id: string; name: string; description?: string; type: string; is_active: boolean } | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'default',
    is_active: true,
  });

  // Handle create catalog
  const handleCreate = async () => {
    try {
      setProcessingId('create');
      await createCatalog(formData);
      setIsCreateModalOpen(false);
      setFormData({ name: '', description: '', type: 'default', is_active: true });
      logger.info('CatalogManagement', '✅ Created catalog');
    } catch (error) {
      logger.error('CatalogManagement', '❌ Error creating catalog:', error);
    } finally {
      setProcessingId(null);
    }
  };

  // Handle update catalog
  const handleUpdate = async () => {
    if (!editingCatalog) return;

    try {
      setProcessingId(editingCatalog.id);
      await updateCatalog(editingCatalog.id, formData);
      setEditingCatalog(null);
      setFormData({ name: '', description: '', type: 'default', is_active: true });
      logger.info('CatalogManagement', '✅ Updated catalog');
    } catch (error) {
      logger.error('CatalogManagement', '❌ Error updating catalog:', error);
    } finally {
      setProcessingId(null);
    }
  };

  // Handle delete catalog
  const handleDelete = async (catalogId: string, isDefault: boolean) => {
    if (isDefault) {
      alert('Cannot delete the default catalog');
      return;
    }

    if (!confirm('Are you sure you want to delete this catalog?')) {
      return;
    }

    try {
      setProcessingId(catalogId);
      await deleteCatalog(catalogId);
      logger.info('CatalogManagement', '✅ Deleted catalog');
    } catch (error) {
      logger.error('CatalogManagement', '❌ Error deleting catalog:', error);
    } finally {
      setProcessingId(null);
    }
  };

  // Open edit modal
  const openEditModal = (catalog: { id: string; name: string; description?: string; type: string; is_active: boolean }) => {
    setEditingCatalog(catalog);
    setFormData({
      name: catalog.name,
      description: catalog.description || '',
      type: catalog.type,
      is_active: catalog.is_active,
    });
  };

  // Get catalog type badge
  const getCatalogTypeBadge = (type: string) => {
    const typeMap: Record<string, { color: string; label: string }> = {
      default: { color: 'blue', label: 'Default' },
      location: { color: 'purple', label: 'Location' },
      tier: { color: 'green', label: 'Customer Tier' },
      season: { color: 'orange', label: 'Seasonal' },
      promotion: { color: 'red', label: 'Promotion' },
    };

    const config = typeMap[type] || typeMap.default;
    return <Badge colorPalette={config.color}>{config.label}</Badge>;
  };

  return (
    <Stack gap="md">
      {/* Header */}
      <Stack direction="row" justify="space-between" align="center">
        <Stack gap="xs">
          <Text fontSize="xl" fontWeight="semibold">
            <Icon as={FolderIcon} mr="2" />
            Catalog Management
          </Text>
          <Text fontSize="sm" color="gray.600">
            Organize products into catalogs for different contexts
          </Text>
        </Stack>
        <Button onClick={() => setIsCreateModalOpen(true)} colorPalette="blue">
          <Icon as={PlusIcon} />
          New Catalog
        </Button>
      </Stack>

      {/* Error Alert */}
      {error && (
        <Alert status="error" title="Error loading catalogs">
          {error.message}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Stack align="center" py="8">
          <Spinner size="lg" />
          <Text>Loading catalogs...</Text>
        </Stack>
      )}

      {/* Catalogs Table */}
      {!loading && catalogs.length > 0 && (
        <Table.Root variant="outline" size="sm">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeader>Catalog Name</Table.ColumnHeader>
              <Table.ColumnHeader>Type</Table.ColumnHeader>
              <Table.ColumnHeader>Status</Table.ColumnHeader>
              <Table.ColumnHeader>Actions</Table.ColumnHeader>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {catalogs.map((catalog) => (
              <Table.Row key={catalog.id}>
                <Table.Cell>
                  <Stack gap="1">
                    <Stack direction="row" align="center" gap="2">
                      <Text fontWeight="medium">{catalog.name}</Text>
                      {catalog.is_default && (
                        <Badge colorPalette="blue" size="sm">
                          <Icon as={CheckCircleIcon} />
                          Default
                        </Badge>
                      )}
                    </Stack>
                    {catalog.description && (
                      <Text fontSize="xs" color="gray.600">
                        {catalog.description}
                      </Text>
                    )}
                  </Stack>
                </Table.Cell>
                <Table.Cell>{getCatalogTypeBadge(catalog.type)}</Table.Cell>
                <Table.Cell>
                  <Badge colorPalette={catalog.is_active ? 'green' : 'gray'}>
                    {catalog.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <Stack direction="row" gap="2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEditModal(catalog)}
                      loading={processingId === catalog.id}
                    >
                      <Icon as={PencilIcon} />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      colorPalette="red"
                      onClick={() => handleDelete(catalog.id, catalog.is_default)}
                      loading={processingId === catalog.id}
                      disabled={catalog.is_default}
                    >
                      <Icon as={TrashIcon} />
                      Delete
                    </Button>
                  </Stack>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      )}

      {/* Empty State */}
      {!loading && catalogs.length === 0 && (
        <Stack align="center" py="8" gap="md">
          <Icon as={FolderIcon} boxSize="12" color="gray.400" />
          <Text fontSize="lg" color="gray.600">
            No catalogs yet
          </Text>
          <Text fontSize="sm" color="gray.500">
            Create your first catalog to organize products
          </Text>
        </Stack>
      )}

      {/* Info Alert */}
      <Alert status="info" title="💡 Catalog Tips">
        <Stack gap="2">
          <Text>• The default catalog is automatically assigned to new online products</Text>
          <Text>• Create location-specific catalogs for multi-location businesses</Text>
          <Text>• Use seasonal catalogs for limited-time offerings</Text>
        </Stack>
      </Alert>

      {/* Create/Edit Dialog */}
      <DialogRoot
        open={isCreateModalOpen || !!editingCatalog}
        onOpenChange={(e) => {
          if (!e.open) {
            setIsCreateModalOpen(false);
            setEditingCatalog(null);
            setFormData({ name: '', description: '', type: 'default', is_active: true });
          }
        }}
      >
        <DialogBackdrop />
        <DialogPositioner>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCatalog ? 'Edit Catalog' : 'Create New Catalog'}
              </DialogTitle>
            </DialogHeader>
            <DialogBody>
              <Stack gap="md">
                <Stack gap="2">
                  <Text fontWeight="medium">Catalog Name</Text>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Summer Collection 2025"
                  />
                </Stack>

                <Stack gap="2">
                  <Text fontWeight="medium">Description</Text>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Optional description"
                    rows={3}
                  />
                </Stack>

                <Stack gap="2">
                  <Text fontWeight="medium">Catalog Type</Text>
                  <SelectField
                    options={[
                      { value: 'default', label: 'Default' },
                      { value: 'location', label: 'Location-Specific' },
                      { value: 'tier', label: 'Customer Tier' },
                      { value: 'season', label: 'Seasonal' },
                      { value: 'promotion', label: 'Promotional' }
                    ]}
                    value={[formData.type]}
                    onValueChange={(details) =>
                      setFormData({ ...formData, type: details.value[0] })
                    }
                    noPortal
                  />
                </Stack>
              </Stack>
            </DialogBody>
            <DialogFooter>
              <DialogCloseTrigger asChild>
                <Button variant="outline">Cancel</Button>
              </DialogCloseTrigger>
              <Button
                colorPalette="blue"
                onClick={editingCatalog ? handleUpdate : handleCreate}
                loading={processingId === 'create' || processingId === editingCatalog?.id}
              >
                {editingCatalog ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </DialogPositioner>
      </DialogRoot>
    </Stack>
  );
}
