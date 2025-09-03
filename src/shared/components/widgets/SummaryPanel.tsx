import { useState } from 'react';
import {
  Stack,
  Typography,
  CardWrapper,
  Button,
  Grid,
  Badge,
  Icon
} from '@/shared/ui';
import { 
  ChevronDownIcon, 
  ChevronUpIcon,
  CogIcon
} from '@heroicons/react/24/outline';

interface SummaryMetric {
  id: string;
  label: string;
  value: string | number;
  icon?: React.ComponentType<any>;
  status?: 'success' | 'warning' | 'error' | 'info';
  subtitle?: string;
}

interface SummaryPanelProps {
  title: string;
  metrics: SummaryMetric[];
  status?: {
    text: string;
    type: 'online' | 'warning' | 'error';
  };
  onConfigure?: () => void;
  defaultExpanded?: boolean;
}

export function SummaryPanel({
  title,
  metrics,
  status,
  onConfigure,
  defaultExpanded = false
}: SummaryPanelProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const getStatusColorPalette = (type: string): 'success' | 'warning' | 'error' | 'gray' => {
    switch (type) {
      case 'online': return 'success';
      case 'warning': return 'warning'; 
      case 'error': return 'error';
      default: return 'gray';
    }
  };

  const formatValue = (value: string | number) => {
    if (typeof value === 'number') {
      return value.toLocaleString();
    }
    return value;
  };

  return (
    <CardWrapper>
      {/* Header */}
      <div 
        style={{padding: '1rem', cursor: 'pointer'}}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <Stack direction="row" justify="space-between" align="center">
          <Stack direction="row" gap="sm" align="center">
            <Typography variant="heading" size="lg" weight="semibold" color="text.primary">
              🎯 {title}
            </Typography>
            {status && (
              <Stack direction="row" gap="xs" align="center">
                <Badge colorPalette={getStatusColorPalette(status.type)} variant="solid" size="xs">
                  ●
                </Badge>
                <Typography 
                  variant="body" 
                  size="sm" 
                   
                  weight="medium"
                >
                  {status.text}
                </Typography>
              </Stack>
            )}
          </Stack>
          
          <Stack direction="row" gap="xs">
            {onConfigure && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onConfigure()}
              >
                <Stack direction="row" align="center" gap="xs">
                  <Icon icon={CogIcon} size="xs" />
                  <Typography variant="body" size="sm">Configurar</Typography>
                </Stack>
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Icon 
                icon={isExpanded ? ChevronUpIcon : ChevronDownIcon} 
                size="sm" 
              />
            </Button>
          </Stack>
        </Stack>
      </div>

      {/* Collapsible Content */}
      {isExpanded && (
        <div style={{padding: '1rem', paddingTop: '0'}}>
          <Grid 
            templateColumns={{ 
              base: "1fr", 
              md: "repeat(2, 1fr)", 
              lg: "repeat(4, 1fr)" 
            }} 
            gap="md"
          >
            {metrics.map((metric) => {
              return (
                <CardWrapper key={metric.id} variant="outline">
                  <Stack gap="sm" align="start">
                    <Stack direction="row" gap="sm" align="center">
                      {metric.icon && (
                        <Icon icon={metric.icon} size="sm" color="text.secondary" />
                      )}
                      <Typography 
                        variant="body" 
                        size="sm" 
                        color="text.secondary" 
                        weight="medium"
                      >
                        {metric.label}
                      </Typography>
                      {metric.status && (
                        <Badge 
                          colorPalette={metric.status} 
                          variant="subtle" 
                          size="sm"
                        >
                          {metric.status}
                        </Badge>
                      )}
                    </Stack>
                    
                    <Typography 
                      variant="heading" 
                      size="xl" 
                      weight="bold" 
                      color="text.primary"
                    >
                      {formatValue(metric.value)}
                    </Typography>
                    
                    {metric.subtitle && (
                      <Typography variant="body" size="xs" color="text.muted">
                        {metric.subtitle}
                      </Typography>
                    )}
                  </Stack>
                </CardWrapper>
              );
            })}
          </Grid>
        </div>
      )}
    </CardWrapper>
  );
}