import type { Meta, StoryObj } from '@storybook/react'
import { Card } from './Card'
import { Button } from './Button'
import { Typography } from './Typography'
import { Stack, HStack } from './Stack'

const meta = {
  title: 'Design System/Card',
  component: Card,
  parameters: {
    docs: {
      description: {
        component: 'Componente Card mejorado con compound pattern. Incluye Card.Header, Card.Body, y Card.Footer con props flexibles para alineación y espaciado.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['elevated', 'outline', 'subtle', 'filled', 'ghost'],
      description: 'Variante visual de la tarjeta',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Tamaño base de la tarjeta',
    },
    padding: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Espaciado interno',
    },
    colorPalette: {
      control: 'select',
      options: ['gray', 'brand', 'accent', 'success', 'warning', 'error', 'info'],
      description: 'Paleta de colores semántica',
    },
    interactive: {
      control: 'boolean',
      description: 'Si la tarjeta es interactiva (hover effects)',
    },
    disabled: {
      control: 'boolean',
      description: 'Estado deshabilitado',
    },
    loading: {
      control: 'boolean',
      description: 'Estado de carga',
    },
  },
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Contenido básico de la tarjeta',
    variant: 'elevated',
    size: 'md',
    padding: 'md',
  },
}

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
      <Card variant="elevated">
        <Typography variant="title">Elevated</Typography>
        <Typography variant="body" color="secondary">Con sombra elevada</Typography>
      </Card>
      <Card variant="outline">
        <Typography variant="title">Outline</Typography>
        <Typography variant="body" color="secondary">Con borde visible</Typography>
      </Card>
      <Card variant="subtle">
        <Typography variant="title">Subtle</Typography>
        <Typography variant="body" color="secondary">Fondo sutil</Typography>
      </Card>
      <Card variant="filled">
        <Typography variant="title">Filled</Typography>
        <Typography variant="body" color="secondary">Fondo relleno</Typography>
      </Card>
      <Card variant="ghost">
        <Typography variant="title">Ghost</Typography>
        <Typography variant="body" color="secondary">Sin fondo</Typography>
      </Card>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <Stack gap="md">
      {['xs', 'sm', 'md', 'lg', 'xl'].map((size) => (
        <Card key={size} size={size as any} variant="elevated">
          <Typography variant="title">Size: {size}</Typography>
          <Typography variant="body" color="secondary">
            Esta tarjeta usa el tamaño {size}
          </Typography>
        </Card>
      ))}
    </Stack>
  ),
}

export const ColorPalettes: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
      {['gray', 'brand', 'accent', 'success', 'warning', 'error', 'info'].map((palette) => (
        <Card key={palette} colorPalette={palette as any} variant="filled">
          <Typography variant="title" style={{ textTransform: 'capitalize' }}>
            {palette}
          </Typography>
          <Typography variant="body">
            Paleta de color {palette}
          </Typography>
        </Card>
      ))}
    </div>
  ),
}

export const CompoundPattern: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
      <Card variant="elevated" padding="none">
        <Card.Header justify="space-between">
          <Typography variant="heading">Header con acciones</Typography>
          <Button size="sm" variant="ghost">Editar</Button>
        </Card.Header>
        <Card.Body>
          <Typography variant="body">
            Este es el contenido del cuerpo de la tarjeta. Aquí va toda la información principal.
          </Typography>
        </Card.Body>
        <Card.Footer justify="space-between">
          <Typography variant="caption" color="secondary">Hace 2 horas</Typography>
          <HStack gap="sm">
            <Button size="sm" variant="outline">Cancelar</Button>
            <Button size="sm" variant="solid">Guardar</Button>
          </HStack>
        </Card.Footer>
      </Card>

      <Card variant="outline" padding="none">
        <Card.Header align="center">
          <Typography variant="heading">Header centrado</Typography>
        </Card.Header>
        <Card.Body scrollable style={{ maxHeight: '150px' }}>
          <Typography variant="body">
            Contenido con scroll. Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
            Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
            quis nostrud exercitation ullamco laboris. Duis aute irure dolor in reprehenderit in voluptate
            velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident,
            sunt in culpa qui officia deserunt mollit anim id est laborum.
          </Typography>
        </Card.Body>
        <Card.Footer justify="center">
          <Button size="sm">Ver más</Button>
        </Card.Footer>
      </Card>
    </div>
  ),
}

export const InteractiveCards: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
      <Card 
        interactive 
        variant="elevated"
        onClick={() => alert('Tarjeta clickeada!')}
      >
        <Typography variant="title">Tarjeta Interactiva</Typography>
        <Typography variant="body" color="secondary">Pasa el mouse por encima</Typography>
      </Card>

      <Card disabled variant="elevated">
        <Typography variant="title">Tarjeta Deshabilitada</Typography>
        <Typography variant="body" color="secondary">No se puede interactuar</Typography>
      </Card>

      <Card loading variant="elevated" />
    </div>
  ),
}

export const RealWorldExamples: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
      {/* Tarjeta de producto */}
      <Card variant="elevated" padding="none">
        <div style={{ 
          height: '160px', 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '8px 8px 0 0'
        }} />
        <Card.Body>
          <Typography variant="title">Producto Premium</Typography>
          <Typography variant="body" color="secondary">
            Descripción del producto con características principales
          </Typography>
          <HStack justify="space-between" style={{ marginTop: '12px' }}>
            <Typography variant="heading" color="accent">$99.99</Typography>
            <Typography variant="caption" color="success">En stock</Typography>
          </HStack>
        </Card.Body>
        <Card.Footer>
          <Button width="full" variant="solid" colorPalette="brand">
            Agregar al carrito
          </Button>
        </Card.Footer>
      </Card>

      {/* Tarjeta de estadística */}
      <Card variant="filled" colorPalette="success">
        <Card.Header justify="space-between" align="center">
          <Typography variant="overline" color="inherit">VENTAS MENSUALES</Typography>
          <div style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '50%', 
            background: 'rgba(255,255,255,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            📈
          </div>
        </Card.Header>
        <Card.Body padding="sm">
          <Typography variant="display" color="inherit">1,247</Typography>
          <Typography variant="caption" color="inherit">+12% vs mes anterior</Typography>
        </Card.Body>
      </Card>

      {/* Tarjeta de perfil */}
      <Card variant="outline" padding="none">
        <Card.Header>
          <HStack gap="md">
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: '#0ea5ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold'
            }}>
              JD
            </div>
            <div>
              <Typography variant="title">Juan Pérez</Typography>
              <Typography variant="caption" color="secondary">Administrador</Typography>
            </div>
          </HStack>
        </Card.Header>
        <Card.Body>
          <Typography variant="body" color="secondary">
            Último acceso hace 2 horas. Permisos completos en el sistema.
          </Typography>
        </Card.Body>
        <Card.Footer justify="space-between">
          <Button size="sm" variant="outline">Ver perfil</Button>
          <Button size="sm" variant="ghost" colorPalette="error">Desactivar</Button>
        </Card.Footer>
      </Card>
    </div>
  ),
}