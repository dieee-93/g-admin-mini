import React from 'react';
import {
  VStack,
  HStack,
  Text,
  Button,
} from '@chakra-ui/react';
import { CardWrapper, CircularProgress } from '@/shared/ui';
import {
  TrophyIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import type { PerformanceMetrics } from '../types';

interface PerformanceHeaderProps {
  performance: PerformanceMetrics | null;
  loading: boolean;
  onRefresh: () => void;
}

export const PerformanceHeader: React.FC<PerformanceHeaderProps> = ({
  performance,
  loading,
  onRefresh,
}) => {
  return (
    <CardWrapper bg="gradient-to-r from-green-600 to-teal-700" color="white">
      <CardWrapper.Body p={6}>
        <VStack align="stretch" gap={4}>
          <HStack justify="space-between" align="center">
            <HStack gap={3}>
              <TrophyIcon className="w-8 h-8" />
              <VStack align="start" gap={0}>
                <Text fontSize="2xl" fontWeight="bold">Sales Performance Insights</Text>
                <Text opacity={0.9}>Comprehensive business performance analysis and recommendations</Text>
              </VStack>
            </HStack>
            <Button
              variant="outline"
              color="white"
              borderColor="whiteAlpha.300"
              onClick={onRefresh}
              loading={loading}
              size="sm"
            >
              Refresh
            </Button>
          </HStack>

          {performance && (
            <HStack justify="center" gap={8}>
              <VStack gap={1}>
                <CircularProgress.Root value={performance.overall_score} size="80px">
                  <CircularProgress.Circle stroke="rgba(255,255,255,0.3)" />
                  <CircularProgress.Circle stroke="white" />
                  <CircularProgress.ValueText fontSize="lg" fontWeight="bold">
                    {performance.overall_score}
                  </CircularProgress.ValueText>
                </CircularProgress.Root>
                <Text opacity={0.8}>Overall Score</Text>
              </VStack>
              <VStack gap={1}>
                <ShieldCheckIcon className="w-12 h-12" />
                <Text fontSize="xl" fontWeight="bold" textTransform="capitalize">
                  {performance.benchmarks.your_position.replace('_', ' ')}
                </Text>
                <Text opacity={0.8}>Market Position</Text>
              </VStack>
            </HStack>
          )}
        </VStack>
      </CardWrapper.Body>
    </CardWrapper>
  );
};
