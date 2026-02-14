/**
 * DIGITAL DELIVERY SECTION
 *
 * Configuración de entrega para productos digitales.
 * Visible para: digital SOLO (si capability 'digital_products' activa)
 *
 * Features:
 * - Selector de delivery_type (5 opciones)
 * - Configuraciones condicionales según tipo
 * - Validaciones específicas por tipo
 * - Helper texts claros
 *
 * Tipos de entrega:
 * - download: Archivo descargable
 * - streaming: Video/audio en streaming
 * - access: Acceso a plataforma (cursos, membresías)
 * - redirect: Redirección a URL externa
 * - hybrid: Combinación de múltiples tipos
 *
 * @design PRODUCTS_FORM_DIGITAL_SECTIONS_SPEC.md
 */

import {
  Stack,
  Input,
  Alert,
  SelectField,
  createListCollection,
  HStack,
  Checkbox,
  Field
} from '@/shared/ui';
import type { FormSectionProps, DigitalDeliveryFields } from '../../types/productForm';

interface DigitalDeliverySectionProps extends Omit<FormSectionProps, 'data' | 'onChange'> {
  data: DigitalDeliveryFields;
  onChange: (data: DigitalDeliveryFields) => void;
}

// Delivery types
const DELIVERY_TYPES = createListCollection({
  items: [
    { label: 'Descarga de archivo', value: 'download' },
    { label: 'Streaming (video/audio)', value: 'streaming' },
    { label: 'Acceso a plataforma', value: 'access' },
    { label: 'Redirección externa', value: 'redirect' },
    { label: 'Híbrido (múltiple)', value: 'hybrid' }
  ]
});

// Streaming platforms
const STREAMING_PLATFORMS = createListCollection({
  items: [
    { label: 'Vimeo', value: 'vimeo' },
    { label: 'YouTube', value: 'youtube' },
    { label: 'Custom/Propio', value: 'custom' }
  ]
});

export function DigitalDeliverySection({
  data,
  onChange,
  errors = [],
  readOnly = false
}: DigitalDeliverySectionProps) {
  // Handle field changes
  const handleChange = <K extends keyof DigitalDeliveryFields>(
    field: K,
    value: DigitalDeliveryFields[K]
  ) => {
    onChange({
      ...data,
      [field]: value
    });
  };

  // Get field error
  const getFieldError = (fieldName: string) => {
    return errors.find(e =>
      e.field === `digital_delivery.${fieldName}` || e.field === fieldName
    );
  };

  // Handle delivery type change
  const handleDeliveryTypeChange = (newType: DigitalDeliveryFields['delivery_type']) => {
    // Clear previous configs when changing type
    const newData: DigitalDeliveryFields = {
      delivery_type: newType
    };

    // Initialize default config for new type
    switch (newType) {
      case 'download':
        newData.download_config = {
          file_url: '',
          file_size_mb: undefined,
          file_format: undefined,
          download_limit: undefined,
          expiry_days: undefined
        };
        break;
      case 'streaming':
        newData.streaming_config = {
          platform: 'vimeo',
          video_url: '',
          duration_minutes: undefined
        };
        break;
      case 'access':
        newData.access_config = {
          platform: '',
          access_url: '',
          access_duration_days: undefined,
          max_devices: undefined,
          concurrent_access: false
        };
        break;
      case 'redirect':
        newData.redirect_config = {
          redirect_url: '',
          redirect_delay_seconds: 0
        };
        break;
      case 'hybrid':
        newData.hybrid_config = {
          types: []
        };
        break;
    }

    onChange(newData);
  };

  return (
    <Stack gap={4}>
      {/* Delivery type selector */}
      <Field label="Tipo de entrega" required>
        <SelectField
          placeholder="Selecciona tipo de entrega"
          collection={DELIVERY_TYPES}
          value={[data.delivery_type]}
          onValueChange={(details) => {
            const selected = details.value[0] as DigitalDeliveryFields['delivery_type'];
            handleDeliveryTypeChange(selected);
          }}
          disabled={readOnly}
        />
        <Field.HelperText>
          Cómo se entregará el producto digital al cliente
        </Field.HelperText>
      </Field>

      {/* Download Config */}
      {data.delivery_type === 'download' && data.download_config && (
        <>
          <Alert status="info" size="sm">
            <Alert.Title>Descarga de archivo</Alert.Title>
            <Alert.Description>
              El cliente recibirá un enlace para descargar el archivo después de la compra.
            </Alert.Description>
          </Alert>

          <Field
            label="URL del archivo"
            required
            invalid={!!getFieldError('download_config.file_url')}
            errorText={getFieldError('download_config.file_url')?.message}
          >
            <Input
              type="url"
              placeholder="https://..."
              value={data.download_config.file_url || ''}
              onChange={(e) => {
                handleChange('download_config', {
                  ...data.download_config!,
                  file_url: e.target.value
                });
              }}
              disabled={readOnly}
            />
            <Field.HelperText>
              URL directa al archivo (debe ser accesible)
            </Field.HelperText>
          </Field>

          <HStack gap={4}>
            <Field label="Tamaño (MB)" flex="1">
              <Input
                type="number"
                min="0"
                step="0.1"
                placeholder="10.5"
                value={data.download_config.file_size_mb?.toString() || ''}
                onChange={(e) => {
                  const val = e.target.value ? parseFloat(e.target.value) : undefined;
                  handleChange('download_config', {
                    ...data.download_config!,
                    file_size_mb: val
                  });
                }}
                disabled={readOnly}
              />
            </Field>

            <Field label="Formato" flex="1">
              <Input
                placeholder="PDF, ZIP, MP4..."
                value={data.download_config.file_format || ''}
                onChange={(e) => {
                  handleChange('download_config', {
                    ...data.download_config!,
                    file_format: e.target.value
                  });
                }}
                disabled={readOnly}
              />
            </Field>
          </HStack>

          <HStack gap={4}>
            <Field label="Límite de descargas" flex="1">
              <Input
                type="number"
                min="1"
                placeholder="3"
                value={data.download_config.download_limit?.toString() || ''}
                onChange={(e) => {
                  const val = e.target.value ? parseInt(e.target.value) : undefined;
                  handleChange('download_config', {
                    ...data.download_config!,
                    download_limit: val
                  });
                }}
                disabled={readOnly}
              />
              <Field.HelperText>
                Número máximo de descargas permitidas
              </Field.HelperText>
            </Field>

            <Field label="Expiración (días)" flex="1">
              <Input
                type="number"
                min="1"
                placeholder="30"
                value={data.download_config.expiry_days?.toString() || ''}
                onChange={(e) => {
                  const val = e.target.value ? parseInt(e.target.value) : undefined;
                  handleChange('download_config', {
                    ...data.download_config!,
                    expiry_days: val
                  });
                }}
                disabled={readOnly}
              />
              <Field.HelperText>
                Días hasta que expire el enlace
              </Field.HelperText>
            </Field>
          </HStack>
        </>
      )}

      {/* Streaming Config */}
      {data.delivery_type === 'streaming' && data.streaming_config && (
        <>
          <Alert status="info" size="sm">
            <Alert.Title>Streaming de video/audio</Alert.Title>
            <Alert.Description>
              El cliente podrá ver/escuchar el contenido en streaming desde la plataforma seleccionada.
            </Alert.Description>
          </Alert>

          <Field label="Plataforma" required>
            <SelectField
              placeholder="Selecciona plataforma"
              collection={STREAMING_PLATFORMS}
              value={[data.streaming_config.platform]}
              onValueChange={(details) => {
                const selected = details.value[0] as string;
                handleChange('streaming_config', {
                  ...data.streaming_config!,
                  platform: selected
                });
              }}
              disabled={readOnly}
            />
          </Field>

          <Field
            label="URL del video"
            required
            invalid={!!getFieldError('streaming_config.video_url')}
            errorText={getFieldError('streaming_config.video_url')?.message}
          >
            <Input
              type="url"
              placeholder="https://..."
              value={data.streaming_config.video_url || ''}
              onChange={(e) => {
                handleChange('streaming_config', {
                  ...data.streaming_config!,
                  video_url: e.target.value
                });
              }}
              disabled={readOnly}
            />
            <Field.HelperText>
              URL del video en la plataforma de streaming
            </Field.HelperText>
          </Field>

          <Field label="Duración (minutos)">
            <Input
              type="number"
              min="1"
              placeholder="60"
              value={data.streaming_config.duration_minutes?.toString() || ''}
              onChange={(e) => {
                const val = e.target.value ? parseInt(e.target.value) : undefined;
                handleChange('streaming_config', {
                  ...data.streaming_config!,
                  duration_minutes: val
                });
              }}
              disabled={readOnly}
            />
            <Field.HelperText>
              Duración total del contenido (opcional)
            </Field.HelperText>
          </Field>
        </>
      )}

      {/* Access Config */}
      {data.delivery_type === 'access' && data.access_config && (
        <>
          <Alert status="info" size="sm">
            <Alert.Title>Acceso a plataforma</Alert.Title>
            <Alert.Description>
              El cliente recibirá credenciales o acceso directo a una plataforma (ej: curso online).
            </Alert.Description>
          </Alert>

          <Field label="Nombre de la plataforma" required>
            <Input
              placeholder="ej: Udemy, Coursera, Plataforma propia..."
              value={data.access_config.platform || ''}
              onChange={(e) => {
                handleChange('access_config', {
                  ...data.access_config!,
                  platform: e.target.value
                });
              }}
              disabled={readOnly}
            />
          </Field>

          <Field
            label="URL de acceso"
            required
            invalid={!!getFieldError('access_config.access_url')}
            errorText={getFieldError('access_config.access_url')?.message}
          >
            <Input
              type="url"
              placeholder="https://..."
              value={data.access_config.access_url || ''}
              onChange={(e) => {
                handleChange('access_config', {
                  ...data.access_config!,
                  access_url: e.target.value
                });
              }}
              disabled={readOnly}
            />
            <Field.HelperText>
              URL donde el cliente accederá al contenido
            </Field.HelperText>
          </Field>

          <HStack gap={4}>
            <Field label="Duración del acceso (días)" flex="1">
              <Input
                type="number"
                min="1"
                placeholder="365"
                value={data.access_config.access_duration_days?.toString() || ''}
                onChange={(e) => {
                  const val = e.target.value ? parseInt(e.target.value) : undefined;
                  handleChange('access_config', {
                    ...data.access_config!,
                    access_duration_days: val
                  });
                }}
                disabled={readOnly}
              />
              <Field.HelperText>
                Días de acceso (vacío = ilimitado)
              </Field.HelperText>
            </Field>

            <Field label="Máximo de dispositivos" flex="1">
              <Input
                type="number"
                min="1"
                placeholder="3"
                value={data.access_config.max_devices?.toString() || ''}
                onChange={(e) => {
                  const val = e.target.value ? parseInt(e.target.value) : undefined;
                  handleChange('access_config', {
                    ...data.access_config!,
                    max_devices: val
                  });
                }}
                disabled={readOnly}
              />
              <Field.HelperText>
                Dispositivos simultáneos permitidos
              </Field.HelperText>
            </Field>
          </HStack>

          <Field>
            <Checkbox
              checked={data.access_config.concurrent_access || false}
              onCheckedChange={(e) => {
                handleChange('access_config', {
                  ...data.access_config!,
                  concurrent_access: e.checked
                });
              }}
              disabled={readOnly}
            >
              Permitir acceso concurrente desde múltiples dispositivos
            </Checkbox>
          </Field>
        </>
      )}

      {/* Redirect Config */}
      {data.delivery_type === 'redirect' && data.redirect_config && (
        <>
          <Alert status="info" size="sm">
            <Alert.Title>Redirección externa</Alert.Title>
            <Alert.Description>
              El cliente será redirigido automáticamente a una URL externa después de la compra.
            </Alert.Description>
          </Alert>

          <Field
            label="URL de destino"
            required
            invalid={!!getFieldError('redirect_config.redirect_url')}
            errorText={getFieldError('redirect_config.redirect_url')?.message}
          >
            <Input
              type="url"
              placeholder="https://..."
              value={data.redirect_config.redirect_url || ''}
              onChange={(e) => {
                handleChange('redirect_config', {
                  ...data.redirect_config!,
                  redirect_url: e.target.value
                });
              }}
              disabled={readOnly}
            />
            <Field.HelperText>
              URL a donde se redirigirá al cliente (ej: webinar, evento)
            </Field.HelperText>
          </Field>

          <Field label="Retraso en la redirección (segundos)">
            <Input
              type="number"
              min="0"
              placeholder="5"
              value={data.redirect_config.redirect_delay_seconds?.toString() || ''}
              onChange={(e) => {
                const val = e.target.value ? parseInt(e.target.value) : undefined;
                handleChange('redirect_config', {
                  ...data.redirect_config!,
                  redirect_delay_seconds: val
                });
              }}
              disabled={readOnly}
            />
            <Field.HelperText>
              Tiempo de espera antes de redirigir (0 = inmediato)
            </Field.HelperText>
          </Field>
        </>
      )}

      {/* Hybrid Config */}
      {data.delivery_type === 'hybrid' && data.hybrid_config && (
        <>
          <Alert status="warning" size="sm">
            <Alert.Title>Entrega híbrida</Alert.Title>
            <Alert.Description>
              El producto incluirá múltiples tipos de entrega. Configura cada tipo
              individualmente después de crear el producto.
            </Alert.Description>
          </Alert>

          <Field>
            <Checkbox
              checked={data.hybrid_config.types.includes('download')}
              onCheckedChange={(e) => {
                const types = e.checked
                  ? [...data.hybrid_config!.types, 'download']
                  : data.hybrid_config!.types.filter(t => t !== 'download');
                handleChange('hybrid_config', { types });
              }}
              disabled={readOnly}
            >
              Descarga de archivo
            </Checkbox>
          </Field>

          <Field>
            <Checkbox
              checked={data.hybrid_config.types.includes('streaming')}
              onCheckedChange={(e) => {
                const types = e.checked
                  ? [...data.hybrid_config!.types, 'streaming']
                  : data.hybrid_config!.types.filter(t => t !== 'streaming');
                handleChange('hybrid_config', { types });
              }}
              disabled={readOnly}
            >
              Streaming de video/audio
            </Checkbox>
          </Field>

          <Field>
            <Checkbox
              checked={data.hybrid_config.types.includes('access')}
              onCheckedChange={(e) => {
                const types = e.checked
                  ? [...data.hybrid_config!.types, 'access']
                  : data.hybrid_config!.types.filter(t => t !== 'access');
                handleChange('hybrid_config', { types });
              }}
              disabled={readOnly}
            >
              Acceso a plataforma
            </Checkbox>
          </Field>
        </>
      )}
    </Stack>
  );
}

/**
 * Helper: Validar URL
 */
export function validateUrl(url?: string): string | null {
  if (!url) return null;
  try {
    new URL(url);
    return null;
  } catch {
    return 'URL inválida';
  }
}
