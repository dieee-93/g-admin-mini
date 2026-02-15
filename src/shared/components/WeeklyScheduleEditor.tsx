import React, { useState, useMemo } from 'react';
import { 
  Box, 
  Stack, 
  Input, 
  Separator, 
  Badge as ChakraTag,
  Typography, 
  Icon, 
  Button, 
  IconButton 
} from '@/shared/ui';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { Schedule, DailyRule, TimeBlock } from '@/types/schedule';

const dayNames = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const dayMap: DailyRule['dayOfWeek'][] = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

// 🚀 PERFORMANCE FIX: Stable empty array to prevent re-renders
// React.dev: "Calculate during rendering" - avoid creating new [] each render
const EMPTY_RULES: DailyRule[] = [];

interface WeeklyScheduleEditorProps {
  schedule: Partial<Schedule>;
  onChange: (newSchedule: Partial<Schedule>) => void;
}

export function WeeklyScheduleEditor({ schedule, onChange }: WeeklyScheduleEditorProps) {
  const [selectedDays, setSelectedDays] = useState<Set<DailyRule['dayOfWeek']>>(new Set());

  // ✅ Use stable constant instead of creating new array
  const weeklyRules = useMemo(
    () => schedule.weeklyRules || EMPTY_RULES, 
    [schedule.weeklyRules]
  );

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
    <Box borderWidth="1px" borderRadius="lg" p="4" bg="gray.50">
      <Stack direction="column" gap="4" align="stretch">
        <Stack direction="column" align="stretch">
            <Typography variant="body" fontWeight="medium">Nombre del Horario:</Typography>
            <Input
                placeholder="Ej: Horario de Tienda Principal"
                value={schedule.name || ''}
                onChange={handleNameChange}
                bg="white"
            />
        </Stack>

        <Separator />

        <Typography variant="body" fontWeight="medium">Selecciona los días para editar el horario:</Typography>
        <Stack direction="row" gap="2">
          {dayMap.map((day, index) => {
            const isSelected = selectedDays.has(day);
            return (
              <Button
                key={day}
                onClick={() => handleDayClick(day)}
                size="sm"
                variant={isSelected ? 'solid' : 'outline'}
                colorPalette={isSelected ? 'blue' : 'gray'}
              >
                {dayNames[index]}
              </Button>
            );
          })}
        </Stack>

        <Separator />

        <Box>
          <Stack direction="row" mb="2" justify="space-between">
            <Typography variant="body" fontWeight="medium">Bloques de Horario:</Typography>
            <Button size="xs" variant="solid" colorPalette="blue" onClick={handleAddTimeBlock} disabled={selectedDays.size === 0}>
              <Icon icon={PlusIcon} size="sm" />
              Añadir Bloque
            </Button>
          </Stack>
          <Typography variant="body" fontSize="xs" color="gray.500" mb="3">
            {selectedDays.size > 0
                ? `Editando para: ${Array.from(selectedDays).join(', ')}`
                : "Selecciona uno o más días para añadir bloques de horario."}
          </Typography>

          <Stack direction="column" gap="4" align="stretch">
            {dayMap.map(day => {
              const blocks = getBlocksForDay(day);
              return (
                <Stack direction="row" key={day} gap="3" align="center">
                  <ChakraTag.Root colorPalette={blocks.length > 0 ? 'green' : 'gray'} width="90px" justifyContent="center">
                    <ChakraTag.Label>{day.substring(0, 3)}</ChakraTag.Label>
                  </ChakraTag.Root>
                  <Stack direction="column" align="stretch" width="100%">
                    {blocks.length > 0 ? blocks.map((block, index) => (
                       <Stack direction="row" key={index} gap="2">
                         <Input type="time" value={block.startTime} onChange={(e) => handleTimeChange(day, index, 'startTime', e.target.value)} bg="white"/>
                         <Typography variant="body">-</Typography>
                         <Input type="time" value={block.endTime} onChange={(e) => handleTimeChange(day, index, 'endTime', e.target.value)} bg="white"/>
                         <IconButton
                           aria-label="Remove time block"
                           size="sm"
                           variant="ghost"
                           onClick={() => handleRemoveTimeBlock(day, index)}
                         >
                           <Icon icon={TrashIcon} size="sm" />
                         </IconButton>
                       </Stack>
                    )) : <Typography variant="body" fontSize="sm" color="gray.400">Cerrado</Typography>}
                  </Stack>
                </Stack>
              )
            })}
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
