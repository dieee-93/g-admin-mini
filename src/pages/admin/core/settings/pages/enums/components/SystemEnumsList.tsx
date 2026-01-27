/**
 * SYSTEM ENUMS LIST COMPONENT
 * 
 * Displays system enums with toggle switches and actions
 * 
 * @version 1.0.0
 */

import {
  Stack,
  CardWrapper,
  HStack,
  Icon,
  Typography,
  Badge,
  Switch,
  Button,
} from '@/shared/ui';
import {
  PencilIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import type { SystemEnum } from '@/pages/admin/core/settings/services/systemEnumsApi';
import {
  useToggleSystemEnum,
  useDeleteSystemEnum,
} from '@/hooks';

interface SystemEnumsListProps {
  enums: SystemEnum[];
  onEditEnum: (enumId: string) => void;
}

export function SystemEnumsList({ enums, onEditEnum }: SystemEnumsListProps) {
  const toggleEnum = useToggleSystemEnum();
  const deleteEnum = useDeleteSystemEnum();

  const handleDelete = (enumItem: SystemEnum) => {
    if (enumItem.is_system) {
      alert('Los valores de sistema no pueden ser eliminados. Desactívalos en su lugar.');
      return;
    }

    if (confirm(`¿Eliminar "${enumItem.label}"?`)) {
      deleteEnum.mutate(enumItem.id);
    }
  };

  if (enums.length === 0) {
    return (
      <Stack align="center" justify="center" minH="200px" gap="2">
        <Icon icon={ShieldCheckIcon} size="2xl" color="gray.400" />
        <Typography variant="body" color="gray.600">
          No hay valores configurados para esta categoría
        </Typography>
      </Stack>
    );
  }

  return (
    <Stack gap="3">
      {enums.map((enumItem) => (
        <CardWrapper key={enumItem.id} variant="outline">
          <CardWrapper.Body p="4">
            <HStack justify="space-between" align="start">
              {/* Left: Enum info */}
              <Stack gap="2" flex="1">
                <HStack gap="3">
                  <Typography variant="body" fontWeight="semibold">
                    {enumItem.label}
                  </Typography>
                  
                  {enumItem.is_system && (
                    <Badge size="sm" colorPalette="blue">
                      <Icon icon={ShieldCheckIcon} size="xs" />
                      Sistema
                    </Badge>
                  )}

                  {enumItem.color && (
                    <Badge
                      size="sm"
                      style={{
                        backgroundColor: enumItem.color,
                        color: 'white',
                      }}
                    >
                      {enumItem.color}
                    </Badge>
                  )}
                </HStack>

                {enumItem.description && (
                  <Typography variant="body" fontSize="sm" color="gray.600">
                    {enumItem.description}
                  </Typography>
                )}

                <HStack gap="3">
                  <Typography variant="body" fontSize="xs" color="gray.500">
                    Key: <strong>{enumItem.key}</strong>
                  </Typography>

                  {enumItem.icon && (
                    <Typography variant="body" fontSize="xs" color="gray.500">
                      Icon: {enumItem.icon}
                    </Typography>
                  )}

                  <Typography variant="body" fontSize="xs" color="gray.500">
                    Orden: {enumItem.sort_order}
                  </Typography>
                </HStack>
              </Stack>

              {/* Right: Actions */}
              <HStack gap="2" align="center">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditEnum(enumItem.id)}
                >
                  <Icon icon={PencilIcon} size="sm" />
                </Button>

                {!enumItem.is_system && (
                  <Button
                    variant="ghost"
                    size="sm"
                    colorPalette="red"
                    onClick={() => handleDelete(enumItem)}
                    loading={deleteEnum.isPending}
                  >
                    <Icon icon={TrashIcon} size="sm" />
                  </Button>
                )}

                <Switch
                  checked={enumItem.is_active}
                  onCheckedChange={(e) =>
                    toggleEnum.mutate({ id: enumItem.id, isActive: e.checked })
                  }
                  disabled={toggleEnum.isPending}
                />
              </HStack>
            </HStack>
          </CardWrapper.Body>
        </CardWrapper>
      ))}
    </Stack>
  );
}
