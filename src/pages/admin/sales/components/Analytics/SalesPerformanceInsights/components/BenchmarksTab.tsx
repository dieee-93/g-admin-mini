import React from 'react';
import {
  VStack,
  HStack,
  Text,
  Badge,
  Progress,
  CardWrapper,
} from '@chakra-ui/react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';
import type { PerformanceMetrics } from '../types';

interface BenchmarksTabProps {
  performance: PerformanceMetrics;
}

export const BenchmarksTab: React.FC<BenchmarksTabProps> = ({ performance }) => {
  return (
    <VStack align="stretch" gap={6}>
      <CardWrapper .Root>
        <CardWrapper .Header>
          <Text fontSize="lg" fontWeight="semibold">Industry Benchmarks</Text>
        </CardWrapper .Header>
        <CardWrapper .Body>
          <VStack align="stretch" gap={4}>
            <HStack justify="space-between">
              <Text>Your Performance</Text>
              <Badge colorPalette="green" size="lg">{performance.overall_score}</Badge>
            </HStack>
            <Progress.Root value={performance.overall_score} colorPalette="green" size="md">
              <Progress.Track>
                <Progress.Range />
              </Progress.Track>
            </Progress.Root>

            <HStack justify="space-between">
              <Text>Industry Average</Text>
              <Text fontWeight="bold">{performance.benchmarks.industry_average}</Text>
            </HStack>
            <Progress.Root value={performance.benchmarks.industry_average} colorPalette="gray" size="sm">
              <Progress.Track>
                <Progress.Range />
              </Progress.Track>
            </Progress.Root>

            <HStack justify="space-between">
              <Text>Top Performers</Text>
              <Text fontWeight="bold" color="purple.600">{performance.benchmarks.top_performers}</Text>
            </HStack>
            <Progress.Root value={performance.benchmarks.top_performers} colorPalette="purple" size="sm">
              <Progress.Track>
                <Progress.Range />
              </Progress.Track>
            </Progress.Root>
          </VStack>
        </CardWrapper .Body>
      </CardWrapper .Root>

      <CardWrapper .Root>
        <CardWrapper .Header>
          <Text fontSize="lg" fontWeight="semibold">Competitive Position</Text>
        </CardWrapper .Header>
        <CardWrapper .Body>
          <VStack align="center" gap={4}>
            <ShieldCheckIcon className="w-16 h-16 text-green-500" />
            <Text fontSize="2xl" fontWeight="bold" color="green.600" textTransform="capitalize">
              {performance.benchmarks.your_position.replace('_', ' ')} Performer
            </Text>
            <Text textAlign="center" color="gray.600">
              You're performing above industry average and competing well with top performers
            </Text>
            <Badge colorPalette="green" size="lg">
              +{performance.overall_score - performance.benchmarks.industry_average} points above average
            </Badge>
          </VStack>
        </CardWrapper .Body>
      </CardWrapper .Root>
    </VStack>
  );
};
