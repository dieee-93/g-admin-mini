import { Stack, Typography, Button, Icon } from '@/shared/ui';

// Quick Action Card Props
interface QuickActionCardProps {
  title: string;
  description?: string;
  icon: React.ComponentType<any>;
  colorPalette: 'gray' | 'brand' | 'success' | 'warning' | 'error' | 'info';
  onClick: () => void;
}

export function QuickActionCard({
  title,
  description,
  icon,
  colorPalette,
  onClick
}: QuickActionCardProps) {
  return (
    <div
      style={{
        height: 'auto',
        padding: '0.75rem'
      }}
    >
      <Button
        variant="outline"
        size="md"
        onClick={onClick}
        colorPalette={colorPalette}
      >
        <Stack direction="column" gap="xs" align="center">
          <Icon icon={icon} size="md" />
          <Stack direction="column" gap="none" align="center">
            <Typography variant="body" size="xs" fontWeight="semibold">{title}</Typography>
            {description && (
              <Typography 
                variant="body" 
                size="xs" 
                color="secondary" 
                textAlign="center"
              >
                {description}
              </Typography>
            )}
          </Stack>
        </Stack>
      </Button>
    </div>
  );
}