import React, { useState, Component } from 'react';
/**
 * Component Showcase - Demostración de Componentes Avanzados
 *
 * Página de ejemplo mostrando Table, Tabs, Accordion, Pagination, Alert, EmptyState
 */

import {
  ContentLayout,
  PageHeader,
  Section,
  CardWrapper,
  Button,
  Stack,
  Text,
  Table,
  Tabs,
  Accordion,
  Pagination,
  Alert,
  EmptyState,
  Badge,
  StatusBadge,
  useToast } from
'../shared/ui';
// Datos de ejemplo para la tabla
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}
const sampleUsers: User[] = [
{
  id: '1',
  name: 'Juan Pérez',
  email: 'juan@example.com',
  role: 'Admin',
  status: 'active'
},
{
  id: '2',
  name: 'María García',
  email: 'maria@example.com',
  role: 'Editor',
  status: 'active'
},
{
  id: '3',
  name: 'Carlos López',
  email: 'carlos@example.com',
  role: 'Viewer',
  status: 'inactive'
},
{
  id: '4',
  name: 'Ana Martínez',
  email: 'ana@example.com',
  role: 'Editor',
  status: 'active'
},
{
  id: '5',
  name: 'Luis Rodríguez',
  email: 'luis@example.com',
  role: 'Viewer',
  status: 'active'
}];

export function ComponentShowcase() {
  const toast = useToast();
  // Estado para la tabla
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [sortColumn, setSortColumn] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  // Estado para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  // Estado para alerts
  const [showAlert, setShowAlert] = useState(true);
  const handleSortChange = (column: string, direction: 'asc' | 'desc') => {
    setSortColumn(column);
    setSortDirection(direction);
    toast({
      title: 'Ordenamiento cambiado',
      description: `Columna: ${column}, Dirección: ${direction}`,
      status: 'info',
      duration: 2000
    });
  };
  return (
    <ContentLayout spacing="normal">
      <PageHeader
        title="Componentes Avanzados"
        subtitle="Table, Tabs, Accordion, Pagination, Alert, EmptyState"
        actions={
        <Button colorScheme="blue" onClick={() => setShowAlert(true)}>
            Mostrar Alert
          </Button>
        } />


      {/* Alerts */}
      {showAlert &&
      <Section>
          <Stack gap="4">
            <Alert
            status="info"
            title="Información"
            description="Este es un mensaje informativo con opción de cerrar."
            closable
            onClose={() => setShowAlert(false)} />


            <Alert
            status="success"
            title="Operación exitosa"
            description="Los cambios se guardaron correctamente."
            variant="left-accent" />


            <Alert
            status="warning"
            title="Advertencia"
            description="Algunos campos requieren atención." />


            <Alert
            status="error"
            title="Error"
            description="No se pudo completar la operación. Intenta nuevamente." />

          </Stack>
        </Section>
      }

      {/* Tabs */}
      <Section title="Tabs - Pestañas">
        <Tabs
          tabs={[
          {
            label: 'Usuarios',
            badge: sampleUsers.length,
            icon: '👥',
            content:
            <Stack gap="4">
                  <Text fontSize="sm" color="text.secondary">
                    Lista de usuarios del sistema
                  </Text>
                  <Table
                columns={[
                {
                  key: 'name',
                  label: 'Nombre',
                  sortable: true,
                  render: (value) =>
                  <Text fontWeight="medium">{value}</Text>

                },
                {
                  key: 'email',
                  label: 'Email',
                  sortable: true
                },
                {
                  key: 'role',
                  label: 'Rol',
                  render: (value) =>
                  <Badge colorScheme="blue">{value}</Badge>

                },
                {
                  key: 'status',
                  label: 'Estado',
                  render: (value) => <StatusBadge status={value} />
                }]
                }
                data={sampleUsers}
                rowKey="id"
                selectable
                selectedRows={selectedRows}
                onSelectionChange={setSelectedRows}
                sortColumn={sortColumn}
                sortDirection={sortDirection}
                onSortChange={handleSortChange} />


                  {selectedRows.length > 0 &&
              <Alert
                status="info"
                description={`${selectedRows.length} usuario(s) seleccionado(s)`} />

              }
                </Stack>

          },
          {
            label: 'Configuración',
            icon: '⚙️',
            content:
            <CardWrapper>
                  <Text fontSize="sm" color="text.secondary">
                    Configuración del sistema
                  </Text>
                </CardWrapper>

          },
          {
            label: 'Reportes',
            icon: '📊',
            badge: '3',
            content:
            <EmptyState
              icon="📊"
              title="No hay reportes disponibles"
              description="Crea tu primer reporte para comenzar a analizar datos."
              action={{
                label: 'Crear Reporte',
                onClick: () =>
                toast({
                  title: 'Crear reporte',
                  status: 'info',
                  duration: 2000
                })
              }}
              secondaryAction={{
                label: 'Ver Ejemplos',
                onClick: () =>
                toast({
                  title: 'Ver ejemplos',
                  status: 'info',
                  duration: 2000
                })
              }} />


          }]
          } />

      </Section>

      {/* Accordion */}
      <Section title="Accordion - Contenido Colapsable">
        <Accordion
          items={[
          {
            title: '¿Qué es el sistema de diseño?',
            icon: '❓',
            content:
            <Text fontSize="sm" color="text.secondary">
                  Un sistema de diseño es una colección de componentes
                  reutilizables, guiados por estándares claros, que se pueden
                  ensamblar para construir cualquier número de aplicaciones.
                </Text>

          },
          {
            title: 'Componentes disponibles',
            badge: '20+',
            icon: '🧩',
            content:
            <Stack gap="2" fontSize="sm" color="text.secondary">
                  <Text>
                    • Formularios: InputField, SelectField, TextareaField
                  </Text>
                  <Text>
                    • Layout: ContentLayout, PageHeader, Section, CardWrapper
                  </Text>
                  <Text>• Data: Table, Tabs, Accordion, MetricCard</Text>
                  <Text>
                    • Feedback: Alert, Modal, LoadingState, EmptyState
                  </Text>
                  <Text>• Navegación: Pagination, Tabs</Text>
                </Stack>

          },
          {
            title: 'Hooks personalizados',
            badge: '3',
            icon: '🎣',
            content:
            <Stack gap="2" fontSize="sm" color="text.secondary">
                  <Text>• useFormValidation - Validación de formularios</Text>
                  <Text>• useDisclosure - Estado de modals/drawers</Text>
                  <Text>• useToast - Notificaciones (Chakra UI)</Text>
                </Stack>

          }]
          }
          allowMultiple
          defaultIndex={[0]} />

      </Section>

      {/* Pagination */}
      <Section title="Pagination - Paginación">
        <CardWrapper>
          <Pagination
            currentPage={currentPage}
            totalPages={10}
            onPageChange={setCurrentPage}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            totalItems={95}
            showPageSizeSelector />

        </CardWrapper>
      </Section>

      {/* Empty State */}
      <Section title="Empty State - Estado Vacío">
        <EmptyState
          icon="📭"
          title="No hay mensajes"
          description="Cuando recibas mensajes, aparecerán aquí."
          action={{
            label: 'Enviar Mensaje',
            onClick: () =>
            toast({
              title: 'Enviar mensaje',
              status: 'info',
              duration: 2000
            })
          }} />

      </Section>
    </ContentLayout>);

}