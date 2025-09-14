import { useState } from 'react';
import {
  VStack,
  HStack,
  Text,
  Badge,
  SimpleGrid,
  Input,
  Textarea,
  Select,
} from '@chakra-ui/react';
import {
  PlusIcon,
} from '@heroicons/react/24/outline';
import { CardWrapper, Button } from '@/shared/ui';
import { type ReportTemplate } from '../types';
import { CATEGORY_COLLECTION } from '../constants/collections';

interface ReportBuilderProps {
  // This will be expanded later when we add the hook
}

export function ReportBuilder({}: ReportBuilderProps) {
  const [builderStep, setBuilderStep] = useState<'basic' | 'data' | 'visualization' | 'schedule'>('basic');
  const [newReport, setNewReport] = useState<Partial<ReportTemplate>>({
    name: '',
    description: '',
    category: 'custom',
    type: 'dashboard',
    dataSources: [],
    metrics: [],
    filters: [],
    visualizations: [],
    isActive: true
  });

  return (
    <CardWrapper variant="outline">
      <CardWrapper.Header>
        <HStack justify="space-between">
          <Text fontSize="lg" fontWeight="bold">🏗️ Constructor de Reportes</Text>
          <HStack gap={2}>
            {['basic', 'data', 'visualization', 'schedule'].map((step, index) => (
              <Badge
                key={step}
                colorPalette={builderStep === step ? 'blue' : index < ['basic', 'data', 'visualization', 'schedule'].indexOf(builderStep) ? 'green' : 'gray'}
                variant={builderStep === step ? 'solid' : 'outline'}
              >
                {index + 1}. {step === 'basic' ? 'Básico' :
                   step === 'data' ? 'Datos' :
                   step === 'visualization' ? 'Visualización' : 'Programación'}
              </Badge>
            ))}
          </HStack>
        </HStack>
      </CardWrapper.Header>

      <CardWrapper.Body p={6}>
        {builderStep === 'basic' && (
          <VStack gap={4} align="stretch">
            <Text fontSize="md" fontWeight="medium" mb={2}>
              Información Básica del Reporte
            </Text>

            <VStack gap={4} align="stretch">
              <Box>
                <Text fontSize="sm" color="gray.700" mb={1}>Nombre del Reporte</Text>
                <Input
                  placeholder="Ej: Dashboard de Ventas Mensual"
                  value={newReport.name || ''}
                  onChange={(e) => setNewReport(prev => ({ ...prev, name: e.target.value }))}
                />
              </Box>

              <Box>
                <Text fontSize="sm" color="gray.700" mb={1}>Descripción</Text>
                <Textarea
                  placeholder="Describe qué información mostrará este reporte..."
                  value={newReport.description || ''}
                  onChange={(e) => setNewReport(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </Box>

              <SimpleGrid columns={2} gap={4}>
                <Box>
                  <Text fontSize="sm" color="gray.700" mb={1}>Categoría</Text>
                  <Select.Root
                    collection={createListCollection({
                      items: CATEGORY_COLLECTION.items.filter(item => item.value !== 'all')
                    })}
                    value={newReport.category ? [newReport.category] : []}
                    onValueChange={(details) => setNewReport(prev => ({ ...prev, category: details.value[0] as any }))}
                  >
                    <Select.Trigger>
                      <Select.ValueText placeholder="Seleccionar categoría" />
                    </Select.Trigger>
                    <Select.Content>
                      {CATEGORY_COLLECTION.items.filter(item => item.value !== 'all').map(item => (
                        <Select.Item key={item.value} item={item}>
                          {item.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Box>

                <Box>
                  <Text fontSize="sm" color="gray.700" mb={1}>Tipo de Reporte</Text>
                  <Select.Root
                    collection={createListCollection({
                      items: [
                        { label: 'Dashboard', value: 'dashboard' },
                        { label: 'Gráfico', value: 'chart' },
                        { label: 'Tabla', value: 'table' },
                        { label: 'KPIs', value: 'kpi' },
                        { label: 'Resumen', value: 'summary' }
                      ]
                    })}
                    value={newReport.type ? [newReport.type] : []}
                    onValueChange={(details) => setNewReport(prev => ({ ...prev, type: details.value[0] as any }))}
                  >
                    <Select.Trigger>
                      <Select.ValueText placeholder="Tipo de reporte" />
                    </Select.Trigger>
                    <Select.Content>
                      {[
                        { label: 'Dashboard', value: 'dashboard' },
                        { label: 'Gráfico', value: 'chart' },
                        { label: 'Tabla', value: 'table' },
                        { label: 'KPIs', value: 'kpi' },
                        { label: 'Resumen', value: 'summary' }
                      ].map(item => (
                        <Select.Item key={item.value} item={item}>
                          {item.label}
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Root>
                </Box>
              </SimpleGrid>
            </VStack>

            <HStack justify="flex-end" mt={6}>
              <Button
                colorPalette="blue"
                onClick={() => setBuilderStep('data')}
                disabled={!newReport.name || !newReport.category || !newReport.type}
              >
                Siguiente: Datos
              </Button>
            </HStack>
          </VStack>
        )}

        {/* Other builder steps would be implemented here */}
        {builderStep !== 'basic' && (
          <CardWrapper variant="subtle">
            <CardWrapper.Body p={8} textAlign="center">
              <PlusIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <Text fontSize="lg" fontWeight="medium" mb={2}>
                Constructor de Reportes - {builderStep}
              </Text>
              <Text color="gray.600">
                Esta sección del constructor de reportes será implementada en la versión completa.
              </Text>
              <HStack justify="center" gap={2} mt={4}>
                <Button
                  variant="outline"
                  onClick={() => {
                    const steps = ['basic', 'data', 'visualization', 'schedule'];
                    const currentIndex = steps.indexOf(builderStep);
                    if (currentIndex > 0) {
                      setBuilderStep(steps[currentIndex - 1] as any);
                    }
                  }}
                >
                  Anterior
                </Button>
                <Button
                  colorPalette="blue"
                  onClick={() => {
                    const steps = ['basic', 'data', 'visualization', 'schedule'];
                    const currentIndex = steps.indexOf(builderStep);
                    if (currentIndex < steps.length - 1) {
                      setBuilderStep(steps[currentIndex + 1] as any);
                    }
                  }}
                >
                  Siguiente
                </Button>
              </HStack>
            </CardWrapper.Body>
          </CardWrapper>
        )}
      </CardWrapper.Body>
    </CardWrapper>
  );
}
