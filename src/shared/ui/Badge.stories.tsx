import type { Meta, StoryObj } from '@storybook/react'
import { Badge } from './Badge'
import { Stack, HStack } from './Stack'

const meta = {
  title: 'Design System/Badge',
  component: Badge,
  parameters: {
    docs: {
      description: {
        component: 'Sistema de badges con estados semánticos y componentes especializados para casos de uso del negocio.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['solid', 'subtle', 'outline', 'surface'],
      description: 'Variante visual del badge',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Tamaño del badge',
    },
    colorPalette: {
      control: 'select',
      options: ['gray', 'brand', 'accent', 'success', 'warning', 'error', 'info'],
      description: 'Paleta de colores',
    },
  },
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Badge',
    variant: 'subtle',
    size: 'sm',
  },
}

export const Variants: Story = {
  render: () => (
    <HStack gap="sm" style={{ flexWrap: 'wrap' }}>
      <Badge variant="solid">Solid</Badge>
      <Badge variant="subtle">Subtle</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="surface">Surface</Badge>
    </HStack>
  ),
}

export const Sizes: Story = {
  render: () => (
    <HStack gap="sm" align="center">
      <Badge size="xs">XS</Badge>
      <Badge size="sm">SM</Badge>
      <Badge size="md">MD</Badge>
      <Badge size="lg">LG</Badge>
    </HStack>
  ),
}

export const Colors: Story = {
  render: () => (
    <HStack gap="sm" style={{ flexWrap: 'wrap' }}>
      <Badge colorPalette="gray">Gray</Badge>
      <Badge colorPalette="brand">Brand</Badge>
      <Badge colorPalette="accent">Accent</Badge>
      <Badge colorPalette="success">Success</Badge>
      <Badge colorPalette="warning">Warning</Badge>
      <Badge colorPalette="error">Error</Badge>
      <Badge colorPalette="info">Info</Badge>
    </HStack>
  ),
}

export const WithIcons: Story = {
  render: () => (
    <HStack gap="sm" style={{ flexWrap: 'wrap' }}>
      <Badge startIcon={<span>🚀</span>}>Con icono inicial</Badge>
      <Badge endIcon={<span>✨</span>}>Con icono final</Badge>
      <Badge startIcon={<span>📊</span>} endIcon={<span>→</span>}>Ambos iconos</Badge>
    </HStack>
  ),
}

export const StatusBadges: Story = {
  render: () => (
    <Stack gap="md">
      <div>
        <h4>Estados básicos</h4>
        <HStack gap="sm" style={{ flexWrap: 'wrap', marginTop: '8px' }}>
          <Badge.Status status="active" />
          <Badge.Status status="inactive" />
          <Badge.Status status="pending" />
          <Badge.Status status="approved" />
          <Badge.Status status="rejected" />
          <Badge.Status status="draft" />
        </HStack>
      </div>
    </Stack>
  ),
}

export const StockBadges: Story = {
  render: () => (
    <Stack gap="md">
      <div>
        <h4>Niveles de stock</h4>
        <HStack gap="sm" style={{ flexWrap: 'wrap', marginTop: '8px' }}>
          <Badge.Stock level="good" />
          <Badge.Stock level="low" />
          <Badge.Stock level="critical" />
          <Badge.Stock level="out" />
          <Badge.Stock level="excess" />
        </HStack>
      </div>
      
      <div>
        <h4>Con valores</h4>
        <HStack gap="sm" style={{ flexWrap: 'wrap', marginTop: '8px' }}>
          <Badge.Stock level="good" value={150} showValue />
          <Badge.Stock level="low" value={8} showValue />
          <Badge.Stock level="critical" value={2} showValue />
          <Badge.Stock level="out" value={0} showValue />
        </HStack>
      </div>
    </Stack>
  ),
}

export const PriorityBadges: Story = {
  render: () => (
    <Stack gap="md">
      <div>
        <h4>Prioridades</h4>
        <HStack gap="sm" style={{ flexWrap: 'wrap', marginTop: '8px' }}>
          <Badge.Priority priority="low" />
          <Badge.Priority priority="medium" />
          <Badge.Priority priority="high" />
          <Badge.Priority priority="urgent" />
        </HStack>
      </div>
      
      <div>
        <h4>Sin iconos</h4>
        <HStack gap="sm" style={{ flexWrap: 'wrap', marginTop: '8px' }}>
          <Badge.Priority priority="low" showIcon={false} />
          <Badge.Priority priority="medium" showIcon={false} />
          <Badge.Priority priority="high" showIcon={false} />
          <Badge.Priority priority="urgent" showIcon={false} />
        </HStack>
      </div>
    </Stack>
  ),
}

export const InventoryBadges: Story = {
  render: () => (
    <Stack gap="md">
      <div>
        <h4>Estado de inventario automático</h4>
        <HStack gap="sm" style={{ flexWrap: 'wrap', marginTop: '8px' }}>
          <Badge.Inventory item="Harina" current={50} minimum={20} />
          <Badge.Inventory item="Aceite" current={15} minimum={20} />
          <Badge.Inventory item="Sal" current={5} minimum={20} />
          <Badge.Inventory item="Azúcar" current={0} minimum={10} />
        </HStack>
      </div>
      
      <div>
        <h4>Solo valores</h4>
        <HStack gap="sm" style={{ flexWrap: 'wrap', marginTop: '8px' }}>
          <Badge.Inventory current={85} minimum={50} />
          <Badge.Inventory current={12} minimum={25} />
          <Badge.Inventory current={3} minimum={15} />
          <Badge.Inventory current={0} minimum={10} />
        </HStack>
      </div>
    </Stack>
  ),
}

export const RoleBadges: Story = {
  render: () => (
    <Stack gap="md">
      <div>
        <h4>Roles de usuario</h4>
        <HStack gap="sm" style={{ flexWrap: 'wrap', marginTop: '8px' }}>
          <Badge.Role role="admin" />
          <Badge.Role role="manager" />
          <Badge.Role role="employee" />
          <Badge.Role role="viewer" />
          <Badge.Role role="guest" />
        </HStack>
      </div>
      
      <div>
        <h4>Con permisos específicos</h4>
        <HStack gap="sm" style={{ flexWrap: 'wrap', marginTop: '8px' }}>
          <Badge.Role 
            role="manager" 
            permissions={['read', 'write', 'delete']} 
          />
          <Badge.Role 
            role="employee" 
            permissions={['read', 'write']} 
          />
        </HStack>
      </div>
    </Stack>
  ),
}

export const InteractiveFeatures: Story = {
  render: () => (
    <Stack gap="md">
      <div>
        <h4>Interactive badges</h4>
        <HStack gap="sm" style={{ flexWrap: 'wrap', marginTop: '8px' }}>
          <Badge clickable onClick={() => alert('Badge clicked!')}>
            Clickeable
          </Badge>
          <Badge pulse colorPalette="error">
            Con animación pulse
          </Badge>
          <Badge dot colorPalette="success">
            Con punto indicador
          </Badge>
          <Badge rounded colorPalette="brand">
            Completamente redondeado
          </Badge>
        </HStack>
      </div>
    </Stack>
  ),
}