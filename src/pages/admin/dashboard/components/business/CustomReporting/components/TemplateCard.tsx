import {
  VStack,
  HStack,
  Text,
  Badge,
  SimpleGrid,
  IconButton,
} from '@chakra-ui/react';
import {
  CalendarIcon,
  PlayIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { CardWrapper, Button } from '@/shared/ui';
import { type ReportTemplate } from '../types';

interface TemplateCardProps {
  template: ReportTemplate;
  getCategoryColor: (category: string) => string;
  generateReport: (templateId: string, format?: string) => void;
  isGenerating: string | null;
}

export function TemplateCard({ template, getCategoryColor, generateReport, isGenerating }: TemplateCardProps) {
  return (
    <CardWrapper key={template.id} variant="outline">
      <CardWrapper.Body p={4}>
        <VStack align="stretch" gap={3}>
          {/* Header */}
          <HStack justify="space-between">
            <VStack align="start" gap={0}>
              <Text fontSize="md" fontWeight="bold">
                {template.name}
              </Text>
              <HStack gap={1}>
                <Badge colorPalette={getCategoryColor(template.category)} size="xs">
                  {template.category}
                </Badge>
                <Badge variant="outline" size="xs">
                  {template.type}
                </Badge>
                {!template.isActive && (
                  <Badge colorPalette="gray" size="xs">
                    Inactivo
                  </Badge>
                )}
              </HStack>
            </VStack>
          </HStack>

          {/* Description */}
          <Text fontSize="sm" color="gray.600" lineHeight={1.4}>
            {template.description}
          </Text>

          {/* Stats */}
          <SimpleGrid columns={2} gap={2} fontSize="xs">
            <VStack align="start" gap={0}>
              <Text color="gray.500">Generaciones:</Text>
              <Text fontWeight="medium">{template.generationCount}</Text>
            </VStack>
            <VStack align="end" gap={0}>
              <Text color="gray.500">Última generación:</Text>
              <Text fontWeight="medium">
                {template.lastGenerated
                  ? new Date(template.lastGenerated).toLocaleDateString()
                  : 'Nunca'
                }
              </Text>
            </VStack>
          </SimpleGrid>

          {/* Schedule Info */}
          {template.schedule?.isEnabled && (
            <HStack gap={2} fontSize="xs" color="blue.600" bg="blue.50" p={2} borderRadius="sm">
              <CalendarIcon className="w-3 h-3" />
              <Text>
                Programado: {template.schedule.frequency} a las {template.schedule.time}
              </Text>
            </HStack>
          )}

          {/* Actions */}
          <HStack gap={2}>
            <Button
              size="sm"
              flex="1"
              onClick={() => generateReport(template.id, 'pdf')}
              loading={isGenerating === template.id}
              loadingText="Generando..."
            >
              <PlayIcon className="w-3 h-3 mr-1" />
              Generar
            </Button>

            <IconButton size="sm" variant="outline">
              <EyeIcon className="w-3 h-3" />
            </IconButton>

            <IconButton size="sm" variant="outline">
              <PencilIcon className="w-3 h-3" />
            </IconButton>

            <IconButton size="sm" variant="outline" colorPalette="red">
              <TrashIcon className="w-3 h-3" />
            </IconButton>
          </HStack>
        </VStack>
      </CardWrapper.Body>
    </CardWrapper>
  );
}
