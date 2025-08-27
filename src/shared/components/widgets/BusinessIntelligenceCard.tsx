import {
  Stack,
  Typography,
  CardWrapper,
  Button,
  Icon
} from '@/shared/ui';

interface BusinessIntelligenceCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  colorPalette: 'success' | 'warning' | 'error' | 'info' | 'brand';
  onClick: () => void;
  actionLabel?: string;
}

export function BusinessIntelligenceCard({
  title,
  description,
  icon: IconComponent,
  colorPalette,
  onClick,
  actionLabel = "Open Analysis"
}: BusinessIntelligenceCardProps) {
  return (
    <div style={{cursor: 'pointer'}} onClick={onClick}>
      <CardWrapper variant="outline">
        <Stack gap="md" align="start">
          <Stack direction="row" gap="md" align="center">
            <div 
              style={{
                padding: '0.5rem',
                backgroundColor: 'var(--colors-bg-subtle)',
                borderRadius: '0.375rem'
              }}
            >
              <Icon icon={IconComponent} size="md" color={colorPalette} />
            </div>
            <Stack gap="xs" align="start">
              <Typography variant="heading" size="md" weight="bold" color="primary">
                {title}
              </Typography>
              <Typography variant="body" size="sm" color="secondary">
                {description}
              </Typography>
            </Stack>
          </Stack>
          <div style={{width: '100%'}}>
            <Button 
              size="sm" 
              variant="outline" 
              colorPalette={colorPalette}
              onClick={() => onClick()}
            >
              <Typography variant="body" size="sm">{actionLabel}</Typography>
            </Button>
          </div>
        </Stack>
      </CardWrapper>
    </div>
  );
}