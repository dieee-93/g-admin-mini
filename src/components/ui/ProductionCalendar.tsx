// src/components/ui/ProductionCalendar.tsx
// Functional Production Calendar Component for ChakraUI v3.23.0

import React from 'react';
import {
  Box,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  Grid
} from '@chakra-ui/react';

interface ProductionPlan {
  id: string;
  planned_date: string;
  product_name: string;
  quantity: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'delayed';
}

interface ProductionCalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  plans: ProductionPlan[];
}

export function ProductionCalendar({ selectedDate, onDateChange, plans }: ProductionCalendarProps) {
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  
  // Calculate calendar days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDate = new Date(firstDay);
  startDate.setDate(startDate.getDate() - firstDay.getDay());
  
  const days = [];
  for (let i = 0; i < 42; i++) {
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    days.push(currentDate);
  }
  
  const handlePrevMonth = () => {
    const prevMonth = new Date(selectedDate);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    onDateChange(prevMonth);
  };
  
  const handleNextMonth = () => {
    const nextMonth = new Date(selectedDate);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    onDateChange(nextMonth);
  };
  
  const getStatusColor = (status: ProductionPlan['status']) => {
    switch (status) {
      case 'completed': return 'green';
      case 'in_progress': return 'blue';
      case 'delayed': return 'red';
      default: return 'gray';
    }
  };
  
  return (
    <VStack gap={4} align="stretch">
      {/* Calendar Header */}
      <HStack justify="space-between" p={3} bg="gray.50" borderRadius="md">
        <Button size="sm" variant="ghost" onClick={handlePrevMonth}>
          ←
        </Button>
        
        <Text fontSize="lg" fontWeight="semibold">
          {selectedDate.toLocaleDateString('es-ES', { 
            month: 'long', 
            year: 'numeric' 
          })}
        </Text>
        
        <Button size="sm" variant="ghost" onClick={handleNextMonth}>
          →
        </Button>
      </HStack>
      
      {/* Calendar Grid */}
      <Grid templateColumns="repeat(7, 1fr)" gap={2}>
        {/* Day Headers */}
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
          <Box key={day} p={2} textAlign="center" fontWeight="semibold" fontSize="sm" color="gray.600">
            {day}
          </Box>
        ))}
        
        {/* Calendar Days */}
        {days.map((date, index) => {
          const isCurrentMonth = date.getMonth() === month;
          const isToday = date.toDateString() === new Date().toDateString();
          const isSelected = date.toDateString() === selectedDate.toDateString();
          
          // Get plans for this day
          const dayPlans = plans.filter(plan => 
            new Date(plan.planned_date).toDateString() === date.toDateString()
          );
          
          // Get status summary
          const statusCounts = dayPlans.reduce((acc, plan) => {
            acc[plan.status] = (acc[plan.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          return (
            <Button
              key={index}
              size="sm"
              variant={isSelected ? "solid" : isToday ? "outline" : "ghost"}
              colorPalette={isSelected ? "blue" : isToday ? "blue" : undefined}
              opacity={isCurrentMonth ? 1 : 0.3}
              h="16"
              position="relative"
              flexDirection="column"
              gap={1}
              onClick={() => onDateChange(date)}
              bg={isSelected ? "blue.500" : undefined}
              color={isSelected ? "white" : undefined}
              _hover={{
                bg: isSelected ? "blue.600" : "gray.100"
              }}
            >
              <Text fontSize="sm" fontWeight={isToday ? "bold" : "normal"}>
                {date.getDate()}
              </Text>
              
              {/* Production indicators */}
              {dayPlans.length > 0 && (
                <HStack gap={1} wrap="wrap" justify="center">
                  {statusCounts.completed && (
                    <Badge size="xs" colorPalette="green" borderRadius="full">
                      {statusCounts.completed}
                    </Badge>
                  )}
                  {statusCounts.in_progress && (
                    <Badge size="xs" colorPalette="blue" borderRadius="full">
                      {statusCounts.in_progress}
                    </Badge>
                  )}
                  {statusCounts.scheduled && (
                    <Badge size="xs" colorPalette="gray" borderRadius="full">
                      {statusCounts.scheduled}
                    </Badge>
                  )}
                  {statusCounts.delayed && (
                    <Badge size="xs" colorPalette="red" borderRadius="full">
                      {statusCounts.delayed}
                    </Badge>
                  )}
                </HStack>
              )}
            </Button>
          );
        })}
      </Grid>
      
      {/* Calendar Legend */}
      <Box p={3} bg="gray.50" borderRadius="md">
        <VStack gap={2} align="start">
          <Text fontSize="sm" fontWeight="semibold">Leyenda</Text>
          <HStack gap={4} flexWrap="wrap">
            <HStack gap={1}>
              <Badge size="xs" colorPalette="gray" borderRadius="full">1</Badge>
              <Text fontSize="xs">Programado</Text>
            </HStack>
            <HStack gap={1}>
              <Badge size="xs" colorPalette="blue" borderRadius="full">1</Badge>
              <Text fontSize="xs">En Progreso</Text>
            </HStack>
            <HStack gap={1}>
              <Badge size="xs" colorPalette="green" borderRadius="full">1</Badge>
              <Text fontSize="xs">Completado</Text>
            </HStack>
            <HStack gap={1}>
              <Badge size="xs" colorPalette="red" borderRadius="full">1</Badge>
              <Text fontSize="xs">Retrasado</Text>
            </HStack>
          </HStack>
        </VStack>
      </Box>
    </VStack>
  );
}