/**
 * ScheduledProductionForm - Industrial Precision Design
 * Formulario para configurar producción programada con estética industrial moderna
 *
 * @module recipe/components
 */

import React, { useState, useMemo } from 'react'
import {
  Box,
  Stack,
  Typography,
  Grid,
  Button,
  Heading,
  SegmentGroup,
  SegmentItem,
  SchedulingCalendar,
  Badge,
  type SchedulableEvent
} from '@/shared/ui'
import { ProductionFrequency } from '../types/production'

// ============================================
// TYPES
// ============================================

/**
 * Production schedule event for calendar display
 */
interface ProductionScheduleEvent extends SchedulableEvent {
  id: string
  date: Date
  quantity?: number
  status?: 'scheduled' | 'in_progress' | 'completed'
}

interface ScheduledProductionFormProps {
  scheduledAt?: Date
  frequency?: ProductionFrequency
  fieldErrors: {
    scheduledAt?: string
    frequency?: string
  }
  onScheduledAtChange: (date: Date | undefined) => void
  onFrequencyChange: (frequency: string) => void
}

// ============================================
// CONSTANTS
// ============================================

const DAYS_OF_WEEK = [
  { value: '1', label: 'LUN', fullLabel: 'LUNES' },
  { value: '2', label: 'MAR', fullLabel: 'MARTES' },
  { value: '3', label: 'MIÉ', fullLabel: 'MIÉRCOLES' },
  { value: '4', label: 'JUE', fullLabel: 'JUEVES' },
  { value: '5', label: 'VIE', fullLabel: 'VIERNES' },
  { value: '6', label: 'SÁB', fullLabel: 'SÁBADO' },
  { value: '7', label: 'DOM', fullLabel: 'DOMINGO' }
]

// ============================================
// HELPER COMPONENTS
// ============================================

/**
 * Industrial Digital Time Picker - Estilo reloj digital industrial
 */
function IndustrialTimePicker({
  value,
  onChange
}: {
  value: string
  onChange: (time: string) => void
}) {
  const timeOptions = useMemo(() => {
    const options: string[] = []
    for (let h = 0; h < 24; h++) {
      for (let m = 0; m < 60; m += 30) {
        const hour = h.toString().padStart(2, '0')
        const minute = m.toString().padStart(2, '0')
        options.push(`${hour}:${minute}`)
      }
    }
    return options
  }, [])

  return (
    <Box position="relative">
      <Stack direction="row" gap="2" align="center">
        <Box
          position="relative"
          _before={{
            content: '""',
            position: 'absolute',
            top: '-2px',
            left: '-2px',
            right: '-2px',
            bottom: '-2px',
            bg: 'linear-gradient(135deg, var(--chakra-colors-blue-emphasized) / 0.3, var(--chakra-colors-blue-fg) / 0.1)',
            borderRadius: 'md',
            opacity: 0,
            transition: 'opacity 0.2s ease'
          }}
          _hover={{
            _before: {
              opacity: 1
            }
          }}
        >
          <Box
            as="select"
            value={value}
            onChange={(e: any) => onChange(e.target.value)}
            px="4"
            py="2.5"
            bg="bg.emphasized"
            color="colorPalette.fg"
            borderWidth="2px"
            borderColor="border.emphasized"
            borderRadius="md"
            fontSize="lg"
            fontWeight="700"
            fontFamily="monospace"
            letterSpacing="0.1em"
            cursor="pointer"
            transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
            textAlign="center"
            minW="120px"
            colorPalette="blue"
            _hover={{
              borderColor: 'colorPalette.emphasized',
              transform: 'translateY(-1px)',
              boxShadow: 'md'
            }}
            _focus={{
              outline: 'none',
              borderColor: 'colorPalette.focused',
              boxShadow: 'outline'
            }}
            _active={{
              transform: 'translateY(0px)',
              boxShadow: 'sm'
            }}
          >
            {timeOptions.map(time => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </Box>
        </Box>
        <Typography
          variant="body"
          fontSize="xs"
          color="fg.muted"
          fontFamily="monospace"
          fontWeight="600"
          letterSpacing="wider"
        >
          24H
        </Typography>
      </Stack>
    </Box>
  )
}

/**
 * Industrial Status Indicator - LED style indicator
 */
function StatusIndicator({
  status,
  label
}: {
  status: 'active' | 'inactive' | 'warning'
  label?: string
}) {
  const getStatusColor = (s: typeof status) => {
    switch (s) {
      case 'active': return 'green'
      case 'warning': return 'orange'
      default: return 'gray'
    }
  }

  const colorPalette = getStatusColor(status)

  return (
    <Stack direction="row" gap="2" align="center">
      <Box
        w="8px"
        h="8px"
        borderRadius="full"
        bg="colorPalette.solid"
        colorPalette={colorPalette}
        boxShadow={status === 'active' ? 'lg' : 'sm'}
        animation={status === 'active' ? 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' : undefined}
      />
      {label && (
        <Typography variant="body" fontSize="xs" color="fg.muted" fontWeight="600" letterSpacing="wide">
          {label}
        </Typography>
      )}
    </Stack>
  )
}

// ============================================
// COMPONENT
// ============================================

export function ScheduledProductionForm({
  scheduledAt,
  frequency,
  fieldErrors,
  onScheduledAtChange,
  onFrequencyChange
}: ScheduledProductionFormProps) {
  const [selectedDays, setSelectedDays] = useState<string[]>([])
  const [selectedTime, setSelectedTime] = useState<string>('00:00')
  const [dateError, setDateError] = useState<string>('')

  // Generar eventos recurrentes virtuales para feedback visual
  const generateRecurringEvents = useMemo(() => {
    if (!scheduledAt || !frequency || frequency === ProductionFrequency.ONCE) {
      return []
    }

    const events: ProductionScheduleEvent[] = []
    const maxEvents = 12
    const startDate = new Date(scheduledAt)

    events.push({
      id: 'scheduled-production-start',
      date: startDate,
      status: 'scheduled' as const
    })

    let currentDate = new Date(startDate)
    let eventsGenerated = 1

    switch (frequency) {
      case ProductionFrequency.DAILY:
        while (eventsGenerated < maxEvents) {
          currentDate = new Date(currentDate)
          currentDate.setDate(currentDate.getDate() + 1)
          events.push({
            id: `recurring-${eventsGenerated}`,
            date: new Date(currentDate),
            status: 'recurring' as 'scheduled'
          })
          eventsGenerated++
        }
        break

      case ProductionFrequency.WEEKLY:
        if (selectedDays.length === 0) break
        const jsFormatDays = selectedDays.map(d => Number(d) === 7 ? 0 : Number(d)).sort((a, b) => a - b)
        currentDate.setDate(currentDate.getDate() + 7 - currentDate.getDay())

        while (eventsGenerated < maxEvents) {
          for (const day of jsFormatDays) {
            if (eventsGenerated >= maxEvents) break
            const targetDate = new Date(currentDate)
            targetDate.setDate(targetDate.getDate() - targetDate.getDay() + day)
            if (targetDate > startDate) {
              events.push({
                id: `recurring-${eventsGenerated}`,
                date: new Date(targetDate),
                status: 'recurring' as 'scheduled'
              })
              eventsGenerated++
            }
          }
          currentDate.setDate(currentDate.getDate() + 7)
        }
        break

      case ProductionFrequency.MONTHLY:
        while (eventsGenerated < maxEvents) {
          currentDate = new Date(currentDate)
          currentDate.setMonth(currentDate.getMonth() + 1)
          events.push({
            id: `recurring-${eventsGenerated}`,
            date: new Date(currentDate),
            status: 'recurring' as 'scheduled'
          })
          eventsGenerated++
        }
        break
    }

    return events
  }, [scheduledAt, frequency, selectedDays])

  const calendarEvents = useMemo<ProductionScheduleEvent[]>(() => {
    if (!scheduledAt) return []
    if (frequency && frequency !== ProductionFrequency.ONCE) {
      return generateRecurringEvents
    }
    return [{
      id: 'scheduled-production',
      date: scheduledAt,
      status: 'scheduled' as const
    }]
  }, [scheduledAt, frequency, generateRecurringEvents])

  const handleDateClick = (date: Date) => {
    // Limpiar error anterior
    setDateError('')

    // Validar que la fecha no sea en el pasado
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Normalizar a medianoche para comparación justa
    const selectedDate = new Date(date)
    selectedDate.setHours(0, 0, 0, 0)

    if (selectedDate < today) {
      setDateError('No se puede programar una producción en el pasado. Por favor selecciona una fecha futura.')
      return
    }

    // Si es la misma fecha, deseleccionar
    if (scheduledAt && date.toDateString() === scheduledAt.toDateString()) {
      onScheduledAtChange(undefined)
    } else {
      const newDate = new Date(date)
      const [hours, minutes] = selectedTime.split(':').map(Number)
      newDate.setHours(hours, minutes, 0, 0)
      onScheduledAtChange(newDate)
    }
  }

  const handleTimeChange = (time: string) => {
    setSelectedTime(time)
    setDateError('')

    if (scheduledAt) {
      const [hours, minutes] = time.split(':').map(Number)
      const newDate = new Date(scheduledAt)
      newDate.setHours(hours, minutes, 0, 0)

      // Validar que no sea en el pasado
      const now = new Date()
      if (newDate < now) {
        setDateError('La hora seleccionada ya pasó. Por favor selecciona un horario futuro.')
        return
      }

      onScheduledAtChange(newDate)
    }
  }

  const handleDayToggle = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    )
  }

  const calculateNextExecution = useMemo(() => {
    if (!scheduledAt || !frequency || frequency === ProductionFrequency.ONCE) {
      return null
    }

    const next = new Date(scheduledAt)

    switch (frequency) {
      case ProductionFrequency.DAILY:
        next.setDate(next.getDate() + 1)
        break
      case ProductionFrequency.WEEKLY:
        if (selectedDays.length === 0) return null
        const currentDay = next.getDay()
        const sortedDays = selectedDays.map(Number).sort((a, b) => a - b)
        const jsFormatDays = sortedDays.map(d => d === 7 ? 0 : d)
        const nextDayIndex = jsFormatDays.find(d => d > currentDay)
        const daysToAdd = nextDayIndex !== undefined
          ? nextDayIndex - currentDay
          : 7 - currentDay + jsFormatDays[0]
        next.setDate(next.getDate() + daysToAdd)
        break
      case ProductionFrequency.MONTHLY:
        next.setMonth(next.getMonth() + 1)
        break
    }

    return next
  }, [scheduledAt, frequency, selectedDays])

  const nextExecutionText = useMemo(() => {
    if (!scheduledAt) return ''
    return new Intl.DateTimeFormat('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(scheduledAt)
  }, [scheduledAt])

  const nextExecutionDateText = useMemo(() => {
    if (!calculateNextExecution) return ''
    return new Intl.DateTimeFormat('es-AR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(calculateNextExecution)
  }, [calculateNextExecution])

  const calendarTitle = useMemo(() => {
    switch (frequency) {
      case ProductionFrequency.WEEKLY:
        return 'CONFIGURACIÓN DE CALENDARIO'
      case ProductionFrequency.DAILY:
        return 'FECHA DE INICIO'
      case ProductionFrequency.MONTHLY:
        return 'DÍA DEL MES'
      default:
        return 'SELECCIONAR FECHA'
    }
  }, [frequency])

  return (
    <Stack gap="8">
      {/* SECTION 1: FREQUENCY SELECTOR - Industrial Switch Panel */}
      <Box>
        <Stack direction="row" align="center" justify="space-between" mb="4">
          <Typography
            variant="body"
            fontSize="xs"
            fontWeight="800"
            color="fg.muted"
            letterSpacing="wider"
            textTransform="uppercase"
          >
            Modo de Ejecución
          </Typography>
          <StatusIndicator status={frequency ? 'active' : 'inactive'} label="CONFIG" />
        </Stack>

        <Box
          bg="bg.panel"
          borderWidth="2px"
          borderColor="border.emphasized"
          borderRadius="lg"
          p="2"
          boxShadow="inset 0 2px 8px rgba(0, 0, 0, 0.15)"
        >
          <SegmentGroup
            value={frequency || ''}
            onValueChange={(details) => onFrequencyChange(details.value || '')}
            colorPalette="blue"
            size="lg"
            w="full"
          >
            <SegmentItem
              value={ProductionFrequency.ONCE}
              px="6"
              py="3"
              fontWeight="700"
              fontSize="sm"
              letterSpacing="wide"
              transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
              _hover={{
                transform: 'translateY(-1px)'
              }}
              _active={{
                transform: 'translateY(0px)'
              }}
            >
              UNA VEZ
            </SegmentItem>
            <SegmentItem
              value={ProductionFrequency.DAILY}
              px="6"
              py="3"
              fontWeight="700"
              fontSize="sm"
              letterSpacing="wide"
              transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
              _hover={{
                transform: 'translateY(-1px)'
              }}
              _active={{
                transform: 'translateY(0px)'
              }}
            >
              DIARIO
            </SegmentItem>
            <SegmentItem
              value={ProductionFrequency.WEEKLY}
              px="6"
              py="3"
              fontWeight="700"
              fontSize="sm"
              letterSpacing="wide"
              transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
              _hover={{
                transform: 'translateY(-1px)'
              }}
              _active={{
                transform: 'translateY(0px)'
              }}
            >
              SEMANAL
            </SegmentItem>
            <SegmentItem
              value={ProductionFrequency.MONTHLY}
              px="6"
              py="3"
              fontWeight="700"
              fontSize="sm"
              letterSpacing="wide"
              transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
              _hover={{
                transform: 'translateY(-1px)'
              }}
              _active={{
                transform: 'translateY(0px)'
              }}
            >
              MENSUAL
            </SegmentItem>
          </SegmentGroup>
        </Box>

        {fieldErrors.frequency && (
          <Stack direction="row" align="center" gap="2" mt="3" px="2">
            <Box w="4px" h="4px" borderRadius="full" bg="colorPalette.solid" colorPalette="red" />
            <Typography variant="body" fontSize="xs" color="fg.error" fontWeight="600">
              {fieldErrors.frequency}
            </Typography>
          </Stack>
        )}
      </Box>

      {/* SECTION 2: CALENDAR + CONTROL PANEL GRID */}
      <Box>
        <Stack direction="row" align="center" gap="3" mb="5">
          <Box h="2px" flex="1" bg="border.emphasized" />
          <Typography
            variant="body"
            fontSize="sm"
            fontWeight="800"
            color="fg.default"
            letterSpacing="widest"
            textTransform="uppercase"
          >
            {calendarTitle}
          </Typography>
          <Box h="2px" flex="1" bg="border.emphasized" />
        </Stack>

        <Grid
          templateColumns={{ base: '1fr', lg: '1.5fr 1fr' }}
          gap="6"
          alignItems="stretch"
        >
          {/* LEFT: CALENDAR MODULE */}
          <Box
            bg="bg.subtle"
            borderWidth="3px"
            borderColor="border.emphasized"
            borderRadius="xl"
            p="5"
            boxShadow="lg"
            position="relative"
            _before={{
              content: '""',
              position: 'absolute',
              top: '0',
              left: '0',
              right: '0',
              h: '4px',
              bg: 'linear-gradient(90deg, var(--chakra-colors-blue-emphasized), var(--chakra-colors-blue-fg))',
              borderTopRadius: 'xl'
            }}
          >
            <Stack gap="4">
              {/* Hint informativo */}
              <Box
                bg="bg.muted"
                borderWidth="1px"
                borderColor="border.default"
                borderRadius="md"
                p="3"
              >
                <Stack direction="row" align="center" gap="2">
                  <Box
                    w="6px"
                    h="6px"
                    borderRadius="full"
                    bg="colorPalette.solid"
                    colorPalette="blue"
                  />
                  <Typography variant="body" fontSize="xs" color="fg.muted" fontWeight="600">
                    Solo se pueden seleccionar fechas futuras (desde hoy en adelante)
                  </Typography>
                </Stack>
              </Box>

              <SchedulingCalendar<ProductionScheduleEvent>
                events={calendarEvents}
                getEventDate={(event) => event.date}
                renderEvent={(event) => {
                  if (event.id === 'scheduled-production' || event.id === 'scheduled-production-start') {
                    return '●'
                  }
                  return '○'
                }}
                getEventColor={(event) => {
                  if (event.id === 'scheduled-production' || event.id === 'scheduled-production-start') {
                    return 'blue'
                  }
                  return 'gray'
                }}
                onDateClick={handleDateClick}
                config={{
                  showNavigation: true,
                  showAddButton: false,
                  allowDateClick: true,
                  compactMode: false,
                  highlightToday: true,
                  locale: 'es-ES'
                }}
              />

              {(fieldErrors.scheduledAt || dateError) && (
                <Stack direction="row" align="center" gap="2" px="2">
                  <Box w="4px" h="4px" borderRadius="full" bg="colorPalette.solid" colorPalette="red" />
                  <Typography variant="body" fontSize="xs" color="fg.error" fontWeight="600">
                    {dateError || fieldErrors.scheduledAt}
                  </Typography>
                </Stack>
              )}

              {/* Calendar Legend */}
              {frequency && frequency !== ProductionFrequency.ONCE && calendarEvents.length > 1 && (
                <Box
                  bg="bg.muted"
                  borderWidth="2px"
                  borderColor="border.default"
                  borderRadius="md"
                  p="3"
                >
                  <Stack direction="row" gap="6">
                    <Stack direction="row" gap="2" align="center">
                      <Box
                        w="10px"
                        h="10px"
                        borderRadius="full"
                        bg="colorPalette.solid"
                        colorPalette="blue"
                        boxShadow="md"
                      />
                      <Typography variant="body" fontSize="xs" fontWeight="700" color="fg.default" letterSpacing="wide">
                        INICIO
                      </Typography>
                    </Stack>
                    <Stack direction="row" gap="2" align="center">
                      <Box
                        w="10px"
                        h="10px"
                        borderRadius="full"
                        borderWidth="2px"
                        borderColor="border.emphasized"
                        bg="transparent"
                      />
                      <Typography variant="body" fontSize="xs" fontWeight="700" color="fg.default" letterSpacing="wide">
                        RECURRENTE
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
              )}
            </Stack>
          </Box>

          {/* RIGHT: CONTROL PANELS */}
          <Stack gap="4">
            {/* PANEL 1: EXECUTION CONFIG */}
            <Box
              bg="bg.panel"
              borderWidth="3px"
              borderColor="border.emphasized"
              borderRadius="xl"
              p="6"
              boxShadow="lg"
              position="relative"
              overflow="hidden"
              borderLeftWidth="4px"
              borderLeftColor={scheduledAt ? 'colorPalette.solid' : 'border.muted'}
              colorPalette={scheduledAt ? 'green' : 'gray'}
            >
              <Stack gap="5">
                <Stack direction="row" align="center" justify="space-between">
                  <Typography
                    variant="body"
                    fontSize="xs"
                    fontWeight="800"
                    color="fg.muted"
                    letterSpacing="widest"
                    textTransform="uppercase"
                  >
                    Control de Ejecución
                  </Typography>
                  <StatusIndicator
                    status={scheduledAt ? 'active' : 'inactive'}
                  />
                </Stack>

                {scheduledAt ? (
                  <>
                    {/* First Execution */}
                    <Box>
                      <Typography
                        variant="body"
                        fontSize="2xs"
                        color="fg.muted"
                        mb="2"
                        fontWeight="700"
                        letterSpacing="wider"
                        textTransform="uppercase"
                      >
                        Primera Ejecución
                      </Typography>
                      <Typography
                        variant="body"
                        fontSize="md"
                        fontWeight="700"
                        color="fg.emphasized"
                        fontFamily="monospace"
                      >
                        {nextExecutionText.split(',')[0]}
                        {nextExecutionText.includes(',') && (
                          <Box as="span" color="colorPalette.fg" colorPalette="blue" ml="2">
                            {nextExecutionText.split(',')[1]}
                          </Box>
                        )}
                      </Typography>
                    </Box>

                    {/* Time Picker */}
                    <Box>
                      <Typography
                        variant="body"
                        fontSize="2xs"
                        color="fg.muted"
                        mb="3"
                        fontWeight="700"
                        letterSpacing="wider"
                        textTransform="uppercase"
                      >
                        Hora de Inicio
                      </Typography>
                      <IndustrialTimePicker
                        value={selectedTime}
                        onChange={handleTimeChange}
                      />
                    </Box>

                    {/* Next Execution */}
                    {calculateNextExecution && (
                      <Box
                        pt="4"
                        borderTop="2px"
                        borderColor="border.subtle"
                        borderStyle="dashed"
                      >
                        <Typography
                          variant="body"
                          fontSize="2xs"
                          color="fg.muted"
                          mb="2"
                          fontWeight="700"
                          letterSpacing="wider"
                          textTransform="uppercase"
                        >
                          Próxima Repetición
                        </Typography>
                        <Stack direction="row" align="center" gap="2">
                          <Box
                            w="6px"
                            h="6px"
                            borderRadius="full"
                            bg="colorPalette.fg"
                            colorPalette="blue"
                            animation="pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
                          />
                          <Typography
                            variant="body"
                            fontSize="sm"
                            fontWeight="600"
                            color="colorPalette.fg"
                            colorPalette="blue"
                            fontFamily="monospace"
                          >
                            {nextExecutionDateText}
                          </Typography>
                        </Stack>
                      </Box>
                    )}
                  </>
                ) : (
                  <Box
                    p="6"
                    bg="bg.muted"
                    borderRadius="md"
                    borderWidth="2px"
                    borderColor="border.subtle"
                    borderStyle="dashed"
                    textAlign="center"
                  >
                    <Typography variant="body" fontSize="sm" color="fg.muted" fontWeight="600">
                      SELECCIONE FECHA EN CALENDARIO
                    </Typography>
                  </Box>
                )}
              </Stack>
            </Box>

            {/* PANEL 2: SUMMARY */}
            {frequency && (
              <Box
                bg="bg.panel"
                borderWidth="3px"
                borderColor={frequency === ProductionFrequency.ONCE ? 'border.emphasized' : 'colorPalette.emphasized'}
                colorPalette={frequency === ProductionFrequency.ONCE ? 'gray' : 'blue'}
                borderRadius="xl"
                p="6"
                boxShadow="lg"
                position="relative"
                borderLeftWidth="4px"
                borderLeftColor={frequency === ProductionFrequency.ONCE ? 'border.muted' : 'colorPalette.solid'}
              >
                <Stack gap="4">
                  <Typography
                    variant="body"
                    fontSize="xs"
                    fontWeight="800"
                    color="fg.muted"
                    letterSpacing="widest"
                    textTransform="uppercase"
                  >
                    Resumen de Programación
                  </Typography>

                  {/* UNA VEZ */}
                  {frequency === ProductionFrequency.ONCE && scheduledAt && (
                    <Typography variant="body" fontSize="sm" color="fg.default" lineHeight="tall" fontWeight="500">
                      Ejecución única programada para el{' '}
                      <Box as="span" fontWeight="700" color="fg.emphasized">
                        {nextExecutionText}
                      </Box>
                    </Typography>
                  )}

                  {/* DIARIO */}
                  {frequency === ProductionFrequency.DAILY && (
                    <Stack gap="3">
                      <Stack direction="row" align="center" gap="2">
                        <Box
                          w="8px"
                          h="8px"
                          borderRadius="full"
                          bg="colorPalette.fg"
                          colorPalette="blue"
                          animation="pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
                        />
                        <Typography variant="body" fontSize="sm" color="colorPalette.fg" colorPalette="blue" fontWeight="700">
                          REPETICIÓN DIARIA
                        </Typography>
                      </Stack>
                      {scheduledAt ? (
                        <Typography variant="body" fontSize="sm" color="fg.default" lineHeight="tall">
                          Ejecución todos los días a las{' '}
                          <Box as="span" fontFamily="monospace" fontWeight="700" color="fg.emphasized">
                            {selectedTime}h
                          </Box>
                          , iniciando el {nextExecutionText.split(',')[0]}.
                        </Typography>
                      ) : (
                        <Stack direction="row" align="center" gap="2">
                          <StatusIndicator status="warning" />
                          <Typography variant="body" fontSize="xs" color="colorPalette.fg" colorPalette="orange" fontWeight="600">
                            Selecciona fecha de inicio
                          </Typography>
                        </Stack>
                      )}
                    </Stack>
                  )}

                  {/* SEMANAL */}
                  {frequency === ProductionFrequency.WEEKLY && (
                    <Stack gap="3">
                      <Stack direction="row" align="center" gap="2">
                        <Box
                          w="8px"
                          h="8px"
                          borderRadius="full"
                          bg="colorPalette.fg"
                          colorPalette="blue"
                          animation="pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
                        />
                        <Typography variant="body" fontSize="sm" color="colorPalette.fg" colorPalette="blue" fontWeight="700">
                          REPETICIÓN SEMANAL
                        </Typography>
                      </Stack>

                      {selectedDays.length > 0 && scheduledAt ? (
                        <>
                          <Typography variant="body" fontSize="sm" color="fg.default" lineHeight="tall">
                            Ejecución semanal a las{' '}
                            <Box as="span" fontFamily="monospace" fontWeight="700" color="fg.emphasized">
                              {selectedTime}h
                            </Box>
                            :
                          </Typography>
                          <Stack direction="row" gap="2" flexWrap="wrap">
                            {selectedDays
                              .map(Number)
                              .sort((a, b) => a - b)
                              .map(day => {
                                const dayData = DAYS_OF_WEEK.find(d => Number(d.value) === day)
                                return (
                                  <Badge
                                    key={day}
                                    size="sm"
                                    colorPalette="blue"
                                    variant="solid"
                                    px="3"
                                    py="1"
                                    fontWeight="800"
                                    fontSize="xs"
                                    letterSpacing="wider"
                                  >
                                    {dayData?.label}
                                  </Badge>
                                )
                              })}
                          </Stack>
                        </>
                      ) : (
                        <Stack direction="row" align="center" gap="2">
                          <StatusIndicator status="warning" />
                          <Typography variant="body" fontSize="xs" color="colorPalette.fg" colorPalette="orange" fontWeight="600">
                            Selecciona días de la semana
                          </Typography>
                        </Stack>
                      )}
                    </Stack>
                  )}

                  {/* MENSUAL */}
                  {frequency === ProductionFrequency.MONTHLY && (
                    <Stack gap="3">
                      <Stack direction="row" align="center" gap="2">
                        <Box
                          w="8px"
                          h="8px"
                          borderRadius="full"
                          bg="colorPalette.fg"
                          colorPalette="blue"
                          animation="pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite"
                        />
                        <Typography variant="body" fontSize="sm" color="colorPalette.fg" colorPalette="blue" fontWeight="700">
                          REPETICIÓN MENSUAL
                        </Typography>
                      </Stack>
                      {scheduledAt ? (
                        <Typography variant="body" fontSize="sm" color="fg.default" lineHeight="tall">
                          Ejecución el día{' '}
                          <Box as="span" fontFamily="monospace" fontWeight="700" color="fg.emphasized">
                            {scheduledAt.getDate()}
                          </Box>
                          {' '}de cada mes a las{' '}
                          <Box as="span" fontFamily="monospace" fontWeight="700" color="fg.emphasized">
                            {selectedTime}h
                          </Box>
                          , iniciando en {nextExecutionText.split(',')[0].split(' ').slice(-2).join(' ')}.
                        </Typography>
                      ) : (
                        <Stack direction="row" align="center" gap="2">
                          <StatusIndicator status="warning" />
                          <Typography variant="body" fontSize="xs" color="colorPalette.fg" colorPalette="orange" fontWeight="600">
                            Selecciona día del mes
                          </Typography>
                        </Stack>
                      )}
                    </Stack>
                  )}
                </Stack>
              </Box>
            )}

            {/* PANEL 3: INFO (solo WEEKLY) */}
            {frequency === ProductionFrequency.WEEKLY && (
              <Box
                bg="bg.panel"
                borderWidth="2px"
                borderColor="colorPalette.emphasized"
                colorPalette="purple"
                borderRadius="lg"
                p="4"
                borderLeftWidth="4px"
                borderLeftColor="colorPalette.solid"
              >
                <Stack gap="3">
                  <Stack direction="row" align="center" gap="2">
                    <Box
                      w="6px"
                      h="6px"
                      borderRadius="full"
                      bg="colorPalette.fg"
                      colorPalette="purple"
                    />
                    <Typography variant="body" fontSize="xs" fontWeight="800" color="colorPalette.fg" colorPalette="purple" letterSpacing="wider">
                      INFORMACIÓN DEL SISTEMA
                    </Typography>
                  </Stack>
                  <Stack gap="1">
                    <Typography variant="body" fontSize="2xs" color="fg.muted" lineHeight="relaxed">
                      <Box as="span" color="colorPalette.fg" colorPalette="purple" fontWeight="700">▸</Box> Fecha de inicio: primera ejecución
                    </Typography>
                    <Typography variant="body" fontSize="2xs" color="fg.muted" lineHeight="relaxed">
                      <Box as="span" color="colorPalette.fg" colorPalette="purple" fontWeight="700">▸</Box> Días marcados: desde semana siguiente
                    </Typography>
                    <Typography variant="body" fontSize="2xs" color="fg.muted" lineHeight="relaxed">
                      <Box as="span" color="colorPalette.fg" colorPalette="purple" fontWeight="700">▸</Box> Configuraciones independientes
                    </Typography>
                  </Stack>
                </Stack>
              </Box>
            )}
          </Stack>
        </Grid>
      </Box>

      {/* SECTION 3: WEEKLY DAY SELECTOR - Industrial Toggles */}
      {frequency === ProductionFrequency.WEEKLY && (
        <Box>
          <Stack direction="row" align="center" gap="3" mb="4">
            <Box h="2px" flex="0.5" bg="border.emphasized" />
            <Typography
              variant="body"
              fontSize="xs"
              fontWeight="800"
              color="fg.muted"
              letterSpacing="widest"
              textTransform="uppercase"
            >
              Días de Ejecución
            </Typography>
            <Box h="2px" flex="1" bg="border.emphasized" />
          </Stack>

          <Box
            bg="bg.panel"
            borderWidth="3px"
            borderColor="border.emphasized"
            borderRadius="xl"
            p="5"
            boxShadow="inset 0 2px 8px rgba(0, 0, 0, 0.15)"
          >
            <Grid
              templateColumns={{ base: 'repeat(auto-fit, minmax(80px, 1fr))', lg: 'repeat(7, 1fr)' }}
              gap="3"
            >
              {DAYS_OF_WEEK.map(day => {
                const isSelected = selectedDays.includes(day.value)
                return (
                  <Button
                    key={day.value}
                    size="lg"
                    variant="solid"
                    colorPalette={isSelected ? 'blue' : 'gray'}
                    onClick={() => handleDayToggle(day.value)}
                    fontWeight="800"
                    fontSize="sm"
                    letterSpacing="wider"
                    h="60px"
                    position="relative"
                    overflow="hidden"
                    transition="all 0.2s cubic-bezier(0.4, 0, 0.2, 1)"
                    _before={{
                      content: '""',
                      position: 'absolute',
                      top: '0',
                      left: '0',
                      w: '100%',
                      h: '3px',
                      bg: isSelected ? 'colorPalette.fg' : 'border.muted',
                      transition: 'all 0.2s ease'
                    }}
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'lg'
                    }}
                    _active={{
                      transform: 'translateY(0px)',
                      boxShadow: 'md'
                    }}
                  >
                    <Stack gap="0.5">
                      <Typography
                        variant="body"
                        fontSize="xl"
                        fontWeight="800"
                        letterSpacing="wider"
                      >
                        {day.label}
                      </Typography>
                      {isSelected && (
                        <Box
                          w="20px"
                          h="2px"
                          bg="colorPalette.fg"
                          colorPalette="blue"
                          mx="auto"
                          borderRadius="full"
                        />
                      )}
                    </Stack>
                  </Button>
                )
              })}
            </Grid>
          </Box>

          {selectedDays.length === 0 && (
            <Stack direction="row" align="center" gap="2" mt="3" px="2">
              <StatusIndicator status="warning" />
              <Typography variant="body" fontSize="xs" color="colorPalette.fg" colorPalette="orange" fontWeight="600">
                Selecciona al menos un día de la semana
              </Typography>
            </Stack>
          )}
        </Box>
      )}

      {/* Add pulse animation keyframes */}
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </Stack>
  )
}

export default ScheduledProductionForm
