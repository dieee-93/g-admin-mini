import type { Meta, StoryObj } from '@storybook/react'
import { Alert } from './Alert'
import { Button } from './Button'
import { Stack } from './Stack'

const meta = {
  title: 'Design System/Alert',
  component: Alert,
  parameters: {
    docs: {
      description: {
        component: 'Sistema de alertas contextual con variantes específicas del negocio. Incluye Alert.Inventory y Alert.System para casos de uso especializados.',
      },
    },
  },
  argTypes: {
    status: {
      control: 'select',
      options: ['info', 'warning', 'success', 'error', 'neutral'],
      description: 'Estado semántico de la alerta',
    },
    variant: {
      control: 'select',
      options: ['subtle', 'solid', 'outline', 'top-accent', 'left-accent'],
      description: 'Variante visual de la alerta',
    },
    closable: {
      control: 'boolean',
      description: 'Si la alerta puede cerrarse',
    },
  },
} satisfies Meta<typeof Alert>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: 'Información importante',
    description: 'Este es un mensaje informativo para el usuario.',
    status: 'info',
  },
}

export const AllStatuses: Story = {
  render: () => (
    <Stack gap="md">
      <Alert status="info" title="Información" description="Mensaje informativo" />
      <Alert status="success" title="Éxito" description="Operación completada correctamente" />
      <Alert status="warning" title="Advertencia" description="Revisa esta información" />
      <Alert status="error" title="Error" description="Ha ocurrido un problema" />
      <Alert status="neutral" title="Neutral" description="Mensaje neutral" />
    </Stack>
  ),
}

export const AllVariants: Story = {
  render: () => (
    <Stack gap="md">
      <Alert variant="subtle" status="info" title="Subtle" description="Variante sutil con fondo suave" />
      <Alert variant="solid" status="success" title="Solid" description="Variante sólida con colores intensos" />
      <Alert variant="outline" status="warning" title="Outline" description="Variante con borde" />
      <Alert variant="top-accent" status="error" title="Top Accent" description="Variante con acento superior" />
      <Alert variant="left-accent" status="info" title="Left Accent" description="Variante con acento lateral" />
    </Stack>
  ),
}

export const WithActions: Story = {
  render: () => (
    <Stack gap="md">
      <Alert
        status="warning"
        title="Actualización disponible"
        description="Una nueva versión está disponible"
        closable
        onClose={() => console.log('Alert closed')}
      >
        <Alert.Action>
          <Button size="sm" variant="outline">
            Descargar ahora
          </Button>
        </Alert.Action>
      </Alert>

      <Alert
        status="error"
        title="Error de conexión"
        description="No se pudo conectar al servidor"
      >
        <Alert.Action>
          <Button size="sm" variant="solid" colorPalette="error">
            Reintentar
          </Button>
        </Alert.Action>
      </Alert>
    </Stack>
  ),
}

export const BusinessAlerts: Story = {
  render: () => (
    <Stack gap="md">
      <Alert.Inventory
        level="low"
        item="Harina"
        current={5}
        minimum={20}
        onRestock={() => console.log('Restock harina')}
      />
      
      <Alert.Inventory
        level="critical"
        item="Aceite"
        current={1}
        minimum={10}
        onRestock={() => console.log('Restock aceite')}
      />
      
      <Alert.Inventory
        level="out"
        item="Sal"
        current={0}
        minimum={5}
        onRestock={() => console.log('Restock sal')}
      />

      <Alert.System
        type="maintenance"
        message="Mantenimiento programado"
        details="El sistema estará en mantenimiento el viernes de 2:00 a 4:00 AM"
        action={
          <Button size="sm" variant="outline">
            Ver detalles
          </Button>
        }
      />

      <Alert.System
        type="update"
        message="Nueva funcionalidad disponible"
        details="Ahora puedes exportar reportes en formato PDF"
        action={
          <Button size="sm" variant="solid">
            Explorar
          </Button>
        }
      />
    </Stack>
  ),
}

export const CompoundPattern: Story = {
  render: () => (
    <Stack gap="md">
      <Alert status="info" variant="left-accent">
        <Alert.Icon>📢</Alert.Icon>
        <Alert.Title>Recordatorio personalizado</Alert.Title>
        <Alert.Description>
          No olvides revisar el inventario antes del cierre
        </Alert.Description>
        <Alert.Action>
          <Button size="sm" variant="ghost">
            Marcar como completado
          </Button>
        </Alert.Action>
      </Alert>

      <Alert status="success" variant="outline">
        <Alert.Title>Sincronización completa</Alert.Title>
        <Alert.Description>
          Todos los datos se han sincronizado correctamente con el servidor
        </Alert.Description>
      </Alert>
    </Stack>
  ),
}