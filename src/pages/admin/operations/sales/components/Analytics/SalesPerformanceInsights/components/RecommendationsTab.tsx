import React from 'react';
import {
  VStack,
  HStack,
  Text,
  Badge,
  Grid,
  Alert,
  CardWrapper
} from '@/shared/ui';
import {
  BoltIcon,
  FireIcon,
  ChartBarIcon,
  TrophyIcon,
  LightBulbIcon,
} from '@heroicons/react/24/outline';
import type { PerformanceMetrics } from '../types';

interface RecommendationsTabProps {
  performance: PerformanceMetrics;
}

export const RecommendationsTab: React.FC<RecommendationsTabProps> = ({ performance }) => {
  return (
    <VStack align="stretch" gap="6">
      <CardWrapper bg="gradient-to-r from-blue-500 to-purple-600" color="white">
        <CardWrapper.Body p="6">
          <VStack align="center" gap="4">
            <BoltIcon className="w-12 h-12" />
            <Text fontSize="2xl" fontWeight="bold" textAlign="center">
              Strategic Action Plan
            </Text>
            <Text textAlign="center" opacity={0.9}>
              Prioritized recommendations to optimize your business performance
            </Text>
          </VStack>
        </CardWrapper.Body>
      </CardWrapper>

      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap="6">
        <CardWrapper borderTop="4px solid" borderTopColor="red.400">
          <CardWrapper.Header>
            <HStack gap="2">
              <FireIcon className="w-5 h-5 text-red-500" />
              <Text fontWeight="semibold" color="red.600">Immediate Actions</Text>
            </HStack>
          </CardWrapper.Header>
          <CardWrapper.Body>
            <VStack align="stretch" gap="3">
              {performance.recommendations.immediate_actions.map((action, index) => (
                <HStack key={index} gap="3" align="start">
                  <Badge colorPalette="red" size="sm">{index + 1}</Badge>
                  <Text fontSize="sm">{action}</Text>
                </HStack>
              ))}
            </VStack>
          </CardWrapper.Body>
        </CardWrapper>

        <CardWrapper borderTop="4px solid" borderTopColor="blue.400">
          <CardWrapper.Header>
            <HStack gap="2">
              <ChartBarIcon className="w-5 h-5 text-blue-500" />
              <Text fontWeight="semibold" color="blue.600">Strategic Initiatives</Text>
            </HStack>
          </CardWrapper.Header>
          <CardWrapper.Body>
            <VStack align="stretch" gap="3">
              {performance.recommendations.strategic_initiatives.map((initiative, index) => (
                <HStack key={index} gap="3" align="start">
                  <Badge colorPalette="blue" size="sm">{index + 1}</Badge>
                  <Text fontSize="sm">{initiative}</Text>
                </HStack>
              ))}
            </VStack>
          </CardWrapper.Body>
        </CardWrapper>

        <CardWrapper borderTop="4px solid" borderTopColor="green.400">
          <CardWrapper.Header>
            <HStack gap="2">
              <TrophyIcon className="w-5 h-5 text-green-500" />
              <Text fontWeight="semibold" color="green.600">Long-term Goals</Text>
            </HStack>
          </CardWrapper.Header>
          <CardWrapper.Body>
            <VStack align="stretch" gap="3">
              {performance.recommendations.long_term_goals.map((goal, index) => (
                <HStack key={index} gap="3" align="start">
                  <Badge colorPalette="green" size="sm">{index + 1}</Badge>
                  <Text fontSize="sm">{goal}</Text>
                </HStack>
              ))}
            </VStack>
          </CardWrapper.Body>
        </CardWrapper>
      </Grid>

      <Alert.Root status="info">
        <Alert.Indicator>
          <LightBulbIcon className="w-5 h-5" />
        </Alert.Indicator>
        <Alert.Description>
          <Text fontWeight="bold">Pro Tip:</Text> Focus on immediate actions first for quick wins,
          then implement strategic initiatives for sustainable growth.
        </Alert.Description>
      </Alert.Root>
    </VStack>
  );
};
