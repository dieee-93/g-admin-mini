import { Card, Stack, Typography, Box } from '@/shared/ui';
import { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
  height?: string | number;
  loading?: boolean;
}

export function ChartCard({
  title,
  description,
  children,
  height = '300px',
  loading = false
}: ChartCardProps) {
  return (
    <Card.Root variant="elevated" size="md">
      <Card.Header>
        <Stack direction="column" gap="xs">
          <Typography variant="heading" size="md">
            {title}
          </Typography>
          {description && (
            <Typography variant="body" size="sm" color="gray.600">
              {description}
            </Typography>
          )}
        </Stack>
      </Card.Header>

      <Card.Body>
        <Box
          height={height}
          width="100%"
          position="relative"
          opacity={loading ? 0.5 : 1}
        >
          {loading ? (
            <Stack
              align="center"
              justify="center"
              height="100%"
            >
              <Typography variant="body" color="gray.500">
                Cargando datos...
              </Typography>
            </Stack>
          ) : (
            children
          )}
        </Box>
      </Card.Body>
    </Card.Root>
  );
}
