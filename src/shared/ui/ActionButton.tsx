import { Stack, Typography, Button, Icon } from '@/shared/ui';

// Action Button Props - Specialized button with icon and description layout
interface ActionButtonProps {
  title: string;
  description?: string;
  icon: React.ComponentType<any>;
  colorPalette: "green" | "blue" | "red" | "gray" | "orange" | "purple" | "cyan" | "pink";
  onClick: () => void;
}

export function ActionButton({
  title,
  description,
  icon,
  colorPalette,
  onClick
}: ActionButtonProps) {
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
                color="text.secondary" 
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