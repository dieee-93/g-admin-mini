import {
  Stack,
  Typography,
  CardWrapper,
  Badge,
  Icon
} from '@/shared/ui';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  additionalInfo?: string;
  icon: React.ComponentType<any>;
  iconColor?: string;
  iconBg?: string;
  onClick?: () => void;
  badge?: {
    value: string;
    colorPalette: 'gray' | 'brand' | 'success' | 'warning' | 'error' | 'info';
    variant?: 'solid' | 'subtle' | 'outline' | 'surface';
  };
  isLoading?: boolean;
}

export function MetricCard({
  title,
  value,
  subtitle,
  additionalInfo,
  icon: IconComponent,
  iconColor,
  iconBg,
  onClick,
  badge,
  isLoading = false
}: MetricCardProps) {
  return (
    <CardWrapper onClick={onClick}>
      <Stack gap="sm" align="start">
        <Stack direction="row" justify="space-between" width="full">
          <Icon 
            icon={IconComponent} 
            size="lg" 
            color={iconColor || "theme.500"}
          />
          {badge && (
            <Badge 
              colorPalette={badge.colorPalette} 
              variant={badge.variant || "solid"}
            >
              {badge.value}
            </Badge>
          )}
        </Stack>
        
        <Stack gap="xs" align="start" width="full">
          <Typography 
            variant="heading" 
            size="2xl" 
            weight="bold" 
            color="primary"
          >
            {typeof value === 'number' ? value.toLocaleString() : value}
          </Typography>
          
          <Typography 
            variant="body" 
            size="sm" 
            color="secondary"
          >
            {title}
          </Typography>
          
          {additionalInfo && (
            <Typography 
              variant="body" 
              size="xs" 
               
              weight="medium"
            >
              {additionalInfo}
            </Typography>
          )}
          
          {subtitle && (
            <Typography 
              variant="body" 
              size="xs" 
              color="muted"
            >
              {subtitle}
            </Typography>
          )}
        </Stack>
      </Stack>
    </CardWrapper>
  );
}