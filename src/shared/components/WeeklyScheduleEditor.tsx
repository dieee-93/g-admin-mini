import React, { useState, useMemo } from 'react';
import { Box, HStack, VStack, Button, Input, Text, IconButton, Divider, Tag } from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import type { Schedule, DailyRule, TimeBlock } from '@/types/schedule';

const dayNames = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const dayMap: DailyRule['dayOfWeek'][] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

interface WeeklyScheduleEditorProps {
  schedule: Partial<Schedule>;
  onChange: (newSchedule: Partial<Schedule>) => void;
}

export function WeeklyScheduleEditor({ schedule, onChange }: WeeklyScheduleEditorProps) {
  const [selectedDays, setSelectedDays] = useState<Set<DailyRule['dayOfWeek']>>(new Set());

  const weeklyRules = useMemo(() => schedule.weeklyRules || [], [schedule.weeklyRules]);

  const handleDayClick = (day: DailyRule['dayOfWeek']) => {
    const newSelectedDays = new Set(selectedDays);
    newSelectedDays.has(day) ? newSelectedDays.delete(day) : newSelectedDays.add(day);
    setSelectedDays(newSelectedDays);
  };

  const updateRule = (day: DailyRule['dayOfWeek'], newTimeBlocks: TimeBlock[]) => {
    const newRules = [...weeklyRules];
    const ruleIndex = newRules.findIndex(r => r.dayOfWeek === day);

    if (ruleIndex > -1) {
      newRules[ruleIndex] = { ...newRules[ruleIndex], timeBlocks: newTimeBlocks };
    } else {
      newRules.push({ dayOfWeek: day, timeBlocks: newTimeBlocks });
    }
    onChange({ ...schedule, weeklyRules: newRules });
  };

  const handleAddTimeBlock = () => {
    if (selectedDays.size === 0) return;
    const newRules = [...weeklyRules];

    selectedDays.forEach(day => {
        const ruleIndex = newRules.findIndex(r => r.dayOfWeek === day);
        const newBlock: TimeBlock = { startTime: '09:00', endTime: '17:00' };
        if (ruleIndex > -1) {
            newRules[ruleIndex].timeBlocks.push(newBlock);
        } else {
            newRules.push({ dayOfWeek: day, timeBlocks: [newBlock] });
        }
    });
    onChange({ ...schedule, weeklyRules: newRules });
  };

  const handleRemoveTimeBlock = (day: DailyRule['dayOfWeek'], blockIndex: number) => {
    const rule = weeklyRules.find(r => r.dayOfWeek === day);
    if (!rule) return;
    const newTimeBlocks = rule.timeBlocks.filter((_, i) => i !== blockIndex);
    updateRule(day, newTimeBlocks);
  };

  const handleTimeChange = (day: DailyRule['dayOfWeek'], blockIndex: number, field: 'startTime' | 'endTime', value: string) => {
    const rule = weeklyRules.find(r => r.dayOfWeek === day);
    if (!rule) return;
    const newTimeBlocks = [...rule.timeBlocks];
    newTimeBlocks[blockIndex] = { ...newTimeBlocks[blockIndex], [field]: value };
    updateRule(day, newTimeBlocks);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...schedule, name: e.target.value });
  };

  const getBlocksForDay = (day: DailyRule['dayOfWeek']) => weeklyRules.find(r => r.dayOfWeek === day)?.timeBlocks || [];

  return (
    <Box borderWidth="1px" borderRadius="lg" p={4} bg="gray.50">
      <VStack spacing={4} align="stretch">
        <VStack align="stretch">
            <Text fontWeight="medium">Nombre del Horario:</Text>
            <Input
                placeholder="Ej: Horario de Tienda Principal"
                value={schedule.name || ''}
                onChange={handleNameChange}
                bg="white"
            />
        </VStack>

        <Divider />

        <Text fontWeight="medium">Selecciona los días para editar el horario:</Text>
        <HStack spacing={2}>
          {dayMap.map((day, index) => (
            <Button
              key={day}
              onClick={() => handleDayClick(day)}
              isActive={selectedDays.has(day)}
              size="sm"
              variant="outline"
              colorScheme={selectedDays.has(day) ? 'blue' : 'gray'}
              bg={selectedDays.has(day) ? 'blue.50' : 'white'}
            >
              {dayNames[index]}
            </Button>
          ))}
        </HStack>

        <Divider />

        <Box>
          <HStack mb={2} justifyContent="space-between">
            <Text fontWeight="medium">Bloques de Horario:</Text>
            <Button leftIcon={<AddIcon />} size="xs" variant="solid" colorScheme="blue" onClick={handleAddTimeBlock} isDisabled={selectedDays.size === 0}>
              Añadir Bloque
            </Button>
          </HStack>
          <Text fontSize="xs" color="gray.500" mb={3}>
            {selectedDays.size > 0
                ? `Editando para: ${Array.from(selectedDays).join(', ')}`
                : "Selecciona uno o más días para añadir bloques de horario."}
          </Text>

          <VStack spacing={4} align="stretch">
            {dayMap.map(day => {
              const blocks = getBlocksForDay(day);
              return (
                <HStack key={day} spacing={3} align="center">
                  <Tag colorScheme={blocks.length > 0 ? 'green' : 'gray'} width="90px" justifyContent="center">{day.substring(0, 3)}</Tag>
                  <VStack align="stretch" width="100%">
                    {blocks.length > 0 ? blocks.map((block, index) => (
                       <HStack key={index} spacing={2}>
                         <Input type="time" value={block.startTime} onChange={(e) => handleTimeChange(day, index, 'startTime', e.target.value)} bg="white"/>
                         <Text>-</Text>
                         <Input type="time" value={block.endTime} onChange={(e) => handleTimeChange(day, index, 'endTime', e.target.value)} bg="white"/>
                         <IconButton
                           aria-label="Remove time block"
                           icon={<DeleteIcon />}
                           size="sm"
                           variant="ghost"
                           onClick={() => handleRemoveTimeBlock(day, index)}
                         />
                       </HStack>
                    )) : <Text fontSize="sm" color="gray.400">Cerrado</Text>}
                  </VStack>
                </HStack>
              )
            })}
          </VStack>
        </Box>
      </VStack>
    </Box>
  );
}
