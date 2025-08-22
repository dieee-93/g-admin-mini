import type { Meta, StoryObj } from '@storybook/react'
import { Layout } from './Layout'

const meta = {
  title: 'Design System/Layout',
  component: Layout,
  parameters: {
    docs: {
      description: {
        component: 'Wrapper inteligente para Box con variantes semánticas y props estandarizadas. Reemplaza el uso directo de Box con patrones consistentes.',
      },
    },
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['container', 'section', 'panel', 'sidebar', 'content', 'header', 'footer'],
      description: 'Variante semántica que aplica estilos predefinidos',
    },
    padding: {
      control: 'select',
      options: ['none', 'xs', 'sm', 'md', 'lg', 'xl'],
      description: 'Espaciado interno usando tokens del sistema',
    },
    width: {
      control: 'select',
      options: ['auto', 'full', 'fit', 'container'],
      description: 'Ancho del componente',
    },
    height: {
      control: 'select',
      options: ['auto', 'full', 'screen', 'fit'],
      description: 'Alto del componente',
    },
  },
} satisfies Meta<typeof Layout>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: 'Contenido del layout',
    padding: 'md',
  },
}

export const Container: Story = {
  args: {
    variant: 'container',
    children: 'Layout tipo container - centrado con max-width',
  },
}

export const Panel: Story = {
  args: {
    variant: 'panel',
    children: 'Layout tipo panel - con fondo, bordes y sombra',
  },
}

export const Section: Story = {
  args: {
    variant: 'section',
    children: 'Layout tipo section - con padding vertical',
  },
}

export const Header: Story = {
  args: {
    variant: 'header',
    children: 'Header layout - sticky con bordes',
  },
}

export const Footer: Story = {
  args: {
    variant: 'footer',
    children: 'Footer layout - con fondo diferenciado',
  },
}

export const Sidebar: Story = {
  args: {
    variant: 'sidebar',
    children: 'Sidebar layout - ancho fijo responsive',
  },
}

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <Layout variant="header">Header Layout</Layout>
      <div style={{ display: 'flex', gap: '16px', minHeight: '200px' }}>
        <Layout variant="sidebar">Sidebar</Layout>
        <Layout variant="content">
          <Layout variant="container">
            <Layout variant="panel">Panel dentro de container</Layout>
          </Layout>
        </Layout>
      </div>
      <Layout variant="footer">Footer Layout</Layout>
    </div>
  ),
}

export const PaddingVariants: Story = {
  render: () => (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
      <Layout padding="none" variant="panel">None</Layout>
      <Layout padding="xs" variant="panel">XS</Layout>
      <Layout padding="sm" variant="panel">SM</Layout>
      <Layout padding="md" variant="panel">MD</Layout>
      <Layout padding="lg" variant="panel">LG</Layout>
      <Layout padding="xl" variant="panel">XL</Layout>
    </div>
  ),
}