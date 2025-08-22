import type { Meta, StoryObj } from '@storybook/react'
import { Typography, Heading, Title, Body, Caption, Label, Code } from './Typography'

const meta = {
  title: 'Design System/Typography',
  component: Typography,
  parameters: {
    docs: {
      description: {
        component: 'Sistema tipográfico unificado que reemplaza el uso directo de Text. Incluye variantes semánticas, colores contextuales y helpers de conveniencia.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['display', 'heading', 'title', 'subtitle', 'body', 'caption', 'overline', 'code', 'label'],
      description: 'Variante tipográfica con estilos predefinidos',
    },
    color: {
      control: 'select',
      options: ['primary', 'secondary', 'muted', 'accent', 'success', 'warning', 'error', 'info', 'inherit'],
      description: 'Color semántico del texto',
    },
    weight: {
      control: 'select',
      options: ['light', 'normal', 'medium', 'semibold', 'bold'],
      description: 'Peso de la fuente',
    },
    align: {
      control: 'select',
      options: ['left', 'center', 'right', 'justify'],
      description: 'Alineación del texto',
    },
  },
} satisfies Meta<typeof Typography>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Texto por defecto',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Typography variant="display">Display - Texto destacado para títulos principales</Typography>
      <Typography variant="heading">Heading - Para títulos de sección</Typography>
      <Typography variant="title">Title - Para títulos de componentes</Typography>
      <Typography variant="subtitle">Subtitle - Para subtítulos descriptivos</Typography>
      <Typography variant="body">Body - Para texto de párrafos y contenido principal</Typography>
      <Typography variant="caption">Caption - Para texto secundario pequeño</Typography>
      <Typography variant="overline">Overline - Para etiquetas y metadatos</Typography>
      <Typography variant="code">Code - Para código y valores técnicos</Typography>
      <Typography variant="label">Label - Para etiquetas de formularios</Typography>
    </div>
  ),
}

export const ColorVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Typography color="primary">Primary - Color principal del texto</Typography>
      <Typography color="secondary">Secondary - Color secundario</Typography>
      <Typography color="muted">Muted - Color atenuado</Typography>
      <Typography color="accent">Accent - Color de acento</Typography>
      <Typography color="success">Success - Color de éxito</Typography>
      <Typography color="warning">Warning - Color de advertencia</Typography>
      <Typography color="error">Error - Color de error</Typography>
      <Typography color="info">Info - Color informativo</Typography>
    </div>
  ),
}

export const WeightVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Typography weight="light">Light - Peso ligero</Typography>
      <Typography weight="normal">Normal - Peso normal</Typography>
      <Typography weight="medium">Medium - Peso medio</Typography>
      <Typography weight="semibold">Semibold - Peso semi-negrita</Typography>
      <Typography weight="bold">Bold - Peso negrita</Typography>
    </div>
  ),
}

export const ConvenienceComponents: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Heading>Heading Component - h2 por defecto</Heading>
      <Title>Title Component - h3 por defecto</Title>
      <Body>Body Component - párrafo por defecto</Body>
      <Caption>Caption Component - span por defecto</Caption>
      <Label>Label Component - label por defecto</Label>
      <Code>Code Component - código inline</Code>
    </div>
  ),
}

export const TextStates: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      <Typography truncate style={{ width: '200px' }}>
        Este texto es muy largo y debería truncarse con ellipsis cuando excede el ancho
      </Typography>
      <Typography noWrap style={{ width: '200px' }}>
        Este texto no debería hacer wrap y se mantiene en una línea
      </Typography>
      <Typography decoration="underline">Texto subrayado</Typography>
      <Typography decoration="line-through">Texto tachado</Typography>
      <Typography transform="uppercase">texto en mayúsculas</Typography>
      <Typography transform="capitalize">texto capitalizado</Typography>
    </div>
  ),
}