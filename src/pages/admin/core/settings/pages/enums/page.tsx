/**
 * SYSTEM ENUMS SETTINGS PAGE
 * 
 * Manage configurable system enums:
 * - Staff Departments
 * - Product Types
 * - Asset Categories
 * - Material Categories
 * - Loyalty Tiers
 * 
 * @version 1.0.0
 */

import { useState } from 'react';
import {
  ContentLayout,
  Section,
  Stack,
  Tabs,
  Alert,
  Button,
  Icon,
  HStack,
  Badge,
  Spinner,
} from '@/shared/ui';
import {
  Cog6ToothIcon,
  PlusIcon,
  UserGroupIcon,
  CubeIcon,
  WrenchIcon,
  ArchiveBoxIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import type { EnumType } from '@/pages/admin/core/settings/services/systemEnumsApi';
import { useSystemEnums } from '@/hooks';
import { SystemEnumsList } from './components/SystemEnumsList';
import { SystemEnumFormModal } from './components/SystemEnumFormModal';

const ENUM_TABS = [
  {
    type: 'staff_department' as EnumType,
    label: 'Departamentos',
    icon: UserGroupIcon,
    description: 'Departamentos de personal (Cocina, Servicio, etc.)',
  },
  {
    type: 'product_type' as EnumType,
    label: 'Tipos de Producto',
    icon: CubeIcon,
    description: 'Tipos de productos (Físico, Servicio, Digital, etc.)',
  },
  {
    type: 'asset_category' as EnumType,
    label: 'Categorías de Assets',
    icon: WrenchIcon,
    description: 'Categorías de assets (Equipamiento, Vehículos, etc.)',
  },
  {
    type: 'material_category' as EnumType,
    label: 'Categorías de Materiales',
    icon: ArchiveBoxIcon,
    description: 'Categorías de materiales (Alimentos, Bebidas, etc.)',
  },
  {
    type: 'loyalty_tier' as EnumType,
    label: 'Niveles de Lealtad',
    icon: StarIcon,
    description: 'Niveles de programa de lealtad (Bronce, Plata, Oro, etc.)',
  },
];

export default function SystemEnumsPage() {
  const [selectedType, setSelectedType] = useState<EnumType>('staff_department');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [selectedEnumId, setSelectedEnumId] = useState<string | null>(null);

  const { data: allEnums, isLoading, error } = useSystemEnums();

  // Stats by type
  const stats = allEnums?.reduce(
    (acc, enumItem) => {
      acc[enumItem.enum_type] = (acc[enumItem.enum_type] || 0) + 1;
      if (enumItem.is_active) {
        acc[`${enumItem.enum_type}_active`] = (acc[`${enumItem.enum_type}_active`] || 0) + 1;
      }
      return acc;
    },
    {} as Record<string, number>
  );

  const handleCreateEnum = () => {
    setSelectedEnumId(null);
    setIsFormModalOpen(true);
  };

  const handleEditEnum = (enumId: string) => {
    setSelectedEnumId(enumId);
    setIsFormModalOpen(true);
  };

  if (isLoading) {
    return (
      <ContentLayout>
        <Section variant="flat">
          <Stack align="center" justify="center" minH="400px">
            <Spinner size="lg" />
          </Stack>
        </Section>
      </ContentLayout>
    );
  }

  if (error) {
    return (
      <ContentLayout>
        <Section variant="flat">
          <Alert status="error" title="Error al cargar enums">
            No se pudieron cargar los valores configurables. Intenta recargar la página.
          </Alert>
        </Section>
      </ContentLayout>
    );
  }

  const typeEnums = allEnums?.filter(e => e.enum_type === selectedType) || [];
  const activeCount = stats?.[`${selectedType}_active`] || 0;
  const totalCount = stats?.[selectedType] || 0;

  const currentTab = ENUM_TABS.find(t => t.type === selectedType);

  return (
    <ContentLayout spacing="normal">
      <Section
        variant="flat"
        title="Gestión de Valores Configurables"
        actions={
          <Button colorPalette="purple" onClick={handleCreateEnum}>
            <Icon icon={PlusIcon} />
            Nuevo Valor
          </Button>
        }
      >
        <Stack gap="6">
          {/* Info Alert */}
          <Alert status="info" title="Enums Configurables">
            Gestiona los valores de las listas desplegables del sistema. Los valores marcados como 
            "Sistema" no pueden ser eliminados, solo desactivados.
          </Alert>

          {/* Type Tabs */}
          <Tabs.Root value={selectedType} onValueChange={(e) => setSelectedType(e.value as EnumType)}>
            <Tabs.List>
              {ENUM_TABS.map((tab) => (
                <Tabs.Trigger key={tab.type} value={tab.type}>
                  <HStack gap="2">
                    <Icon icon={tab.icon} size="sm" />
                    {tab.label}
                    <Badge size="sm" colorPalette="purple">
                      {stats?.[`${tab.type}_active`] || 0}/{stats?.[tab.type] || 0}
                    </Badge>
                  </HStack>
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            {/* Description & Stats */}
            <Stack gap="4" py="4">
              <Alert status="info" title={currentTab?.label}>
                {currentTab?.description}
              </Alert>

              <HStack justify="space-between">
                <Badge size="lg" colorPalette={activeCount === totalCount ? 'green' : 'gray'}>
                  {activeCount} de {totalCount} valores activos
                </Badge>
              </HStack>
            </Stack>

            {/* Content for each type */}
            {ENUM_TABS.map((tab) => (
              <Tabs.Content key={tab.type} value={tab.type}>
                <SystemEnumsList
                  enums={typeEnums}
                  onEditEnum={handleEditEnum}
                />
              </Tabs.Content>
            ))}
          </Tabs.Root>
        </Stack>
      </Section>

      {/* Form Modal */}
      <SystemEnumFormModal
        isOpen={isFormModalOpen}
        onClose={() => {
          setIsFormModalOpen(false);
          setSelectedEnumId(null);
        }}
        enumId={selectedEnumId}
        defaultType={selectedType}
      />
    </ContentLayout>
  );
}
