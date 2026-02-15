import { SimpleGrid, CardWrapper, Stack, Skeleton } from '@/shared/ui';

export function LoadingSkeleton() {
  return (
    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap="md">
      {Array.from({ length: 6 }).map((_, i) => (
        <CardWrapper key={i}>
          <Stack gap="md">
            <Stack direction="row" gap="md" align="center">
              <Skeleton height="48px" width="48px" borderRadius="full" />
              <Stack gap="xs" flex={1}>
                <Skeleton height="20px" width="60%" />
                <Skeleton height="16px" width="40%" />
              </Stack>
            </Stack>
            <Stack gap="sm">
              <Skeleton height="16px" width="100%" />
              <Skeleton height="16px" width="80%" />
              <Skeleton height="16px" width="90%" />
            </Stack>
          </Stack>
        </CardWrapper>
      ))}
    </SimpleGrid>
  );
}
