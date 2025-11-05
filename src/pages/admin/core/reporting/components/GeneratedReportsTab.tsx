import {
  VStack,
  HStack,
  Text,
  Badge,
  Progress,
} from '@chakra-ui/react';
import {
  CalendarIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { CardWrapper, Button } from '@/shared/ui';
import { type GeneratedReport } from '../types';

interface GeneratedReportsTabProps {
  reports: GeneratedReport[];
  getStatusColor: (status: string) => string;
}

export function GeneratedReportsTab({ reports, getStatusColor }: GeneratedReportsTabProps) {
  return (
    <VStack gap="4" align="stretch">
      {reports.map((report) => (
        <CardWrapper key={report.id} variant="outline">
          <CardWrapper.Body p="4">
            <HStack justify="space-between" align="start">
              <VStack align="start" gap="2" flex="1">
                <HStack gap="2">
                  <Text fontSize="md" fontWeight="bold">
                    {report.templateName}
                  </Text>
                  <Badge colorPalette={getStatusColor(report.status)}>
                    {report.status === 'completed' ? 'Completado' :
                      report.status === 'generating' ? 'Generando' : 'Fallido'}
                  </Badge>
                  <Badge variant="outline" size="sm">
                    {report.format.toUpperCase()}
                  </Badge>
                </HStack>

                <HStack gap="4" fontSize="sm" color="gray.600">
                  <HStack gap="1">
                    <CalendarIcon className="w-4 h-4" />
                    <Text>{new Date(report.generatedAt).toLocaleString()}</Text>
                  </HStack>
                  <HStack gap="1">
                    <ClockIcon className="w-4 h-4" />
                    <Text>{(report.executionTime / 1000).toFixed(1)}s</Text>
                  </HStack>
                  {report.fileSize && (
                    <Text>
                      Tamaño: {(report.fileSize / (1024 * 1024)).toFixed(1)} MB
                    </Text>
                  )}
                </HStack>

                <Text fontSize="xs" color="gray.500">
                  Generado por: {report.generatedBy}
                </Text>
              </VStack>

              <VStack gap="2">
                {report.status === 'generating' && (
                  <Progress.Root colorPalette="blue" size="sm" width="100px" indeterminate />
                )}

                {report.status === 'completed' && report.downloadUrl && (
                  <Button size="sm" variant="outline" colorPalette="green">
                    <ArrowDownTrayIcon className="w-3 h-3 mr-1" />
                    Descargar
                  </Button>
                )}

                {report.status === 'failed' && (
                  <Button size="sm" variant="outline" colorPalette="red">
                    <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
                    Error
                  </Button>
                )}
              </VStack>
            </HStack>
          </CardWrapper.Body>
        </CardWrapper>
      ))}
    </VStack>
  );
}
