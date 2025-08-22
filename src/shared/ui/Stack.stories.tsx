import type { Meta, StoryObj } from '@storybook/react'
import { Stack, VStack, HStack, Cluster, Center } from './Stack'
import { Layout } from './Layout'

const meta = {
  title: 'Design System/Stack',
  component: Stack,
  parameters: {
    docs: {
      description: {
        component: 'Sistema unificado de layout flexbox que reemplaza VStack/HStack. Incluye variantes especializadas como Cluster y Center.',
      },
    },
  },
  argTypes: {
    direction: {
      control: 'select',
      options: ['row', 'column', 'row-reverse', 'column-reverse'],
      description: 'Dirección del stack',
    },
    gap: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'],
      description: 'Espacio entre elementos usando tokens',
    },
    align: {
      control: 'select',
      options: ['start', 'center', 'end', 'stretch', 'baseline'],
      description: 'Alineación de elementos',
    },
    justify: {
      control: 'select',
      options: ['start', 'center', 'end', 'space-between', 'space-around', 'space-evenly'],
      description: 'Justificación de elementos',
    },
  },
} satisfies Meta<typeof Stack>

export default meta
type Story = StoryObj<typeof meta>

const ItemBox = ({ children, ...props }: any) => (
  <Layout variant="panel" padding="sm" {...props}>
    {children}
  </Layout>
)

export const Default: Story = {
  args: {
    gap: 'md',
    children: (
      <>
        <ItemBox>Item 1</ItemBox>
        <ItemBox>Item 2</ItemBox>
        <ItemBox>Item 3</ItemBox>
      </>
    ),
  },
}

export const Directions: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h3>Column (default)</h3>
        <Stack direction="column" gap="sm">
          <ItemBox>Item 1</ItemBox>
          <ItemBox>Item 2</ItemBox>
          <ItemBox>Item 3</ItemBox>
        </Stack>
      </div>
      
      <div>
        <h3>Row</h3>
        <Stack direction="row" gap="sm">
          <ItemBox>Item 1</ItemBox>
          <ItemBox>Item 2</ItemBox>
          <ItemBox>Item 3</ItemBox>
        </Stack>
      </div>
      
      <div>
        <h3>Row Reverse</h3>
        <Stack direction="row-reverse" gap="sm">
          <ItemBox>Item 1</ItemBox>
          <ItemBox>Item 2</ItemBox>
          <ItemBox>Item 3</ItemBox>
        </Stack>
      </div>
    </div>
  ),
}

export const GapVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {['none', 'xs', 'sm', 'md', 'lg', 'xl', '2xl'].map((gap) => (
        <div key={gap}>
          <h4>Gap: {gap}</h4>
          <Stack direction="row" gap={gap as any}>
            <ItemBox>A</ItemBox>
            <ItemBox>B</ItemBox>
            <ItemBox>C</ItemBox>
          </Stack>
        </div>
      ))}
    </div>
  ),
}

export const Alignment: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h3>Align: Start</h3>
        <Stack direction="row" gap="sm" align="start" style={{ minHeight: '80px', border: '1px dashed #ccc' }}>
          <ItemBox>Short</ItemBox>
          <ItemBox style={{ height: '60px' }}>Tall item</ItemBox>
          <ItemBox>Short</ItemBox>
        </Stack>
      </div>
      
      <div>
        <h3>Align: Center</h3>
        <Stack direction="row" gap="sm" align="center" style={{ minHeight: '80px', border: '1px dashed #ccc' }}>
          <ItemBox>Short</ItemBox>
          <ItemBox style={{ height: '60px' }}>Tall item</ItemBox>
          <ItemBox>Short</ItemBox>
        </Stack>
      </div>
      
      <div>
        <h3>Align: Stretch</h3>
        <Stack direction="row" gap="sm" align="stretch" style={{ minHeight: '80px', border: '1px dashed #ccc' }}>
          <ItemBox>Short</ItemBox>
          <ItemBox>This will stretch</ItemBox>
          <ItemBox>Short</ItemBox>
        </Stack>
      </div>
    </div>
  ),
}

export const Justify: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h3>Justify: Space Between</h3>
        <Stack direction="row" gap="sm" justify="space-between" style={{ border: '1px dashed #ccc', padding: '8px' }}>
          <ItemBox>A</ItemBox>
          <ItemBox>B</ItemBox>
          <ItemBox>C</ItemBox>
        </Stack>
      </div>
      
      <div>
        <h3>Justify: Center</h3>
        <Stack direction="row" gap="sm" justify="center" style={{ border: '1px dashed #ccc', padding: '8px' }}>
          <ItemBox>A</ItemBox>
          <ItemBox>B</ItemBox>
          <ItemBox>C</ItemBox>
        </Stack>
      </div>
      
      <div>
        <h3>Justify: Space Evenly</h3>
        <Stack direction="row" gap="sm" justify="space-evenly" style={{ border: '1px dashed #ccc', padding: '8px' }}>
          <ItemBox>A</ItemBox>
          <ItemBox>B</ItemBox>
          <ItemBox>C</ItemBox>
        </Stack>
      </div>
    </div>
  ),
}

export const ConvenienceComponents: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h3>VStack - Vertical Stack</h3>
        <VStack gap="sm">
          <ItemBox>Item 1</ItemBox>
          <ItemBox>Item 2</ItemBox>
          <ItemBox>Item 3</ItemBox>
        </VStack>
      </div>
      
      <div>
        <h3>HStack - Horizontal Stack</h3>
        <HStack gap="sm">
          <ItemBox>Item 1</ItemBox>
          <ItemBox>Item 2</ItemBox>
          <ItemBox>Item 3</ItemBox>
        </HStack>
      </div>
      
      <div>
        <h3>Cluster - Flexible Wrap</h3>
        <Cluster gap="sm" style={{ border: '1px dashed #ccc', padding: '8px' }}>
          <ItemBox>Tag 1</ItemBox>
          <ItemBox>Tag 2</ItemBox>
          <ItemBox>Much longer tag</ItemBox>
          <ItemBox>Tag 4</ItemBox>
          <ItemBox>Another tag</ItemBox>
          <ItemBox>Final tag</ItemBox>
        </Cluster>
      </div>
      
      <div>
        <h3>Center - Perfect Centering</h3>
        <Center style={{ border: '1px dashed #ccc', height: '120px' }}>
          <ItemBox>Perfectly Centered</ItemBox>
        </Center>
      </div>
    </div>
  ),
}

export const RealWorldExample: Story = {
  render: () => (
    <Layout variant="panel" padding="md">
      <VStack gap="lg">
        <HStack justify="space-between" align="center">
          <div>
            <h2>Dashboard Header</h2>
            <p style={{ color: '#666', margin: 0 }}>Gestión de inventario</p>
          </div>
          <HStack gap="sm">
            <button>Configuración</button>
            <button>Ayuda</button>
          </HStack>
        </HStack>
        
        <Cluster gap="sm">
          <span style={{ padding: '4px 8px', background: '#e3f2fd', borderRadius: '4px' }}>Filtro: Activos</span>
          <span style={{ padding: '4px 8px', background: '#f3e5f5', borderRadius: '4px' }}>Categoría: Todos</span>
          <span style={{ padding: '4px 8px', background: '#e8f5e8', borderRadius: '4px' }}>Estado: En stock</span>
        </Cluster>
        
        <HStack gap="md" align="stretch">
          <Layout variant="panel" padding="md" style={{ flex: 1 }}>
            <h3>Métricas</h3>
            <VStack gap="sm">
              <div>Total items: 1,247</div>
              <div>Bajo stock: 23</div>
              <div>Agotados: 5</div>
            </VStack>
          </Layout>
          
          <Layout variant="panel" padding="md" style={{ flex: 2 }}>
            <h3>Gráfico</h3>
            <Center style={{ height: '120px', background: '#f5f5f5', borderRadius: '4px' }}>
              [Gráfico placeholder]
            </Center>
          </Layout>
        </HStack>
      </VStack>
    </Layout>
  ),
}