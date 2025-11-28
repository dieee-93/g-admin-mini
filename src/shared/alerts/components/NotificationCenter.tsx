// src/shared/alerts/components/NotificationCenter.tsx
// 🔔 NOTIFICATION CENTER - Historial de Alertas con Timeline
// Drawer lateral con búsqueda, filtros, timeline agrupado

import React, { memo, useMemo, useCallback, useState } from 'react';
import {
  Drawer,
  VStack,
  HStack,
  Box,
  Text,
  Input,
  Badge,
  Button,
  Tabs,
  Separator,
} from '@/shared/ui';
import { useAlertsState, useAlertsActions } from '../AlertsProvider';
import { AlertDisplay } from './AlertDisplay';
import type { Alert } from '../types';
import { logger } from '@/lib/logging';

// Wrapper component that connects to provider state
export const NotificationCenter = memo(function NotificationCenter() {
  const { isNotificationCenterOpen } = useAlertsState();
  const { closeNotificationCenter } = useAlertsActions();
  
  // Debug log
  console.log('[NotificationCenter] isOpen:', isNotificationCenterOpen);
  
  return (
    <NotificationCenterDrawer 
      isOpen={isNotificationCenterOpen}
      onClose={closeNotificationCenter}
    />
  );
});

interface NotificationCenterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type FilterType = 'all' | 'unread' | 'critical' | 'acknowledged';

const NotificationCenterDrawer = memo(function NotificationCenterDrawer({
  isOpen,
  onClose
}: NotificationCenterDrawerProps) {
  const { alerts, stats } = useAlertsState();
  const actions = useAlertsActions();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  
  // 🎯 OPTIMIZADO: Filter + search con useMemo
  const filteredAlerts = useMemo(() => {
    let filtered = alerts;
    
    // Filter by tab
    switch (activeFilter) {
      case 'unread':
        filtered = filtered.filter(a => !a.readAt);
        break;
      case 'critical':
        filtered = filtered.filter(a => a.severity === 'critical');
        break;
      case 'acknowledged':
        filtered = filtered.filter(a => a.status === 'acknowledged');
        break;
      // 'all' - no filter
    }
    
    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(term) ||
        a.description?.toLowerCase().includes(term)
      );
    }
    
    // Exclude archived
    filtered = filtered.filter(a => !a.archivedAt);
    
    // Exclude snoozed
    filtered = filtered.filter(a => a.status !== 'snoozed');
    
    // Sort by createdAt desc (newest first)
    filtered.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    return filtered;
  }, [alerts, activeFilter, searchTerm]);
  
  // 🎯 OPTIMIZADO: Group by timeline
  const timelineGroups = useMemo(() => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
    const weekStart = new Date(todayStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return {
      today: filteredAlerts.filter(a => a.createdAt >= todayStart),
      yesterday: filteredAlerts.filter(a => 
        a.createdAt >= yesterdayStart && a.createdAt < todayStart
      ),
      thisWeek: filteredAlerts.filter(a => 
        a.createdAt >= weekStart && a.createdAt < yesterdayStart
      ),
      older: filteredAlerts.filter(a => a.createdAt < weekStart)
    };
  }, [filteredAlerts]);
  
  // 🎯 OPTIMIZADO: Callbacks estables
  const handleMarkAllRead = useCallback(() => {
    const unreadIds = filteredAlerts
      .filter(a => !a.readAt)
      .map(a => a.id);
    
    unreadIds.forEach(id => actions.markAsRead(id));
    logger.info('SmartAlertsEngine', `Marked ${unreadIds.length} alerts as read`);
  }, [filteredAlerts, actions]);
  
  const handleClearAll = useCallback(() => {
    const ids = filteredAlerts.map(a => a.id);
    ids.forEach(id => actions.archive(id));
    logger.info('SmartAlertsEngine', `Archived ${ids.length} alerts`);
  }, [filteredAlerts, actions]);
  
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  }, []);
  
  const handleFilterChange = useCallback((details: { value: string | null }) => {
    if (details.value) {
      setActiveFilter(details.value as FilterType);
    }
  }, []);
  
  const handleAlertClick = useCallback((alertId: string) => {
    // Mark as read when clicked
    const alert = alerts.find(a => a.id === alertId);
    if (alert && !alert.readAt) {
      actions.markAsRead(alertId);
    }
  }, [alerts, actions]);
  
  return (
    <Drawer.Root 
      open={isOpen} 
      onOpenChange={({ open }) => !open && onClose()} 
      placement="end" 
      size="md"
    >
      <Drawer.Backdrop />
      <Drawer.Positioner>
        <Drawer.Content>
          <Drawer.Header>
            <HStack justify="space-between" w="full">
              <Drawer.Title>Notificaciones</Drawer.Title>
              {stats.unread > 0 && (
                <Badge colorPalette="red" size="sm">
                  {stats.unread > 99 ? '99+' : stats.unread}
                </Badge>
              )}
            </HStack>
            <Drawer.CloseTrigger />
          </Drawer.Header>
        
        <Drawer.Body>
          <VStack align="stretch" gap="4">
            {/* Search */}
            <Input
              placeholder="Buscar notificaciones..."
              value={searchTerm}
              onChange={handleSearchChange}
              size="sm"
            />
            
            {/* Tabs */}
            <Tabs.Root 
              value={activeFilter} 
              onValueChange={handleFilterChange}
              size="sm"
              variant="enclosed"
            >
              <Tabs.List>
                <Tabs.Trigger value="all">
                  Todas
                  {activeFilter === 'all' && filteredAlerts.length > 0 && (
                    <Box marginStart="2"><Badge size="xs">{filteredAlerts.length}</Badge></Box>
                  )}
                </Tabs.Trigger>
                <Tabs.Trigger value="unread">
                  No leídas
                  {stats.unread > 0 && (
                    <Box marginStart="2"><Badge colorPalette="red" size="xs">{stats.unread}</Badge></Box>
                  )}
                </Tabs.Trigger>
                <Tabs.Trigger value="critical">
                  Críticas
                  {stats.bySeverity.critical > 0 && (
                    <Box marginStart="2"><Badge colorPalette="red" size="xs">{stats.bySeverity.critical}</Badge></Box>
                  )}
                </Tabs.Trigger>
                <Tabs.Trigger value="acknowledged">
                  Reconocidas
                </Tabs.Trigger>
              </Tabs.List>
            </Tabs.Root>
            
            {/* Empty State */}
            {filteredAlerts.length === 0 && (
              <VStack paddingY="8" gap="2">
                <Text fontSize="sm" color="gray.500" textAlign="center">
                  {searchTerm 
                    ? 'No se encontraron notificaciones'
                    : activeFilter === 'unread'
                    ? 'No tienes notificaciones sin leer'
                    : activeFilter === 'critical'
                    ? 'No hay alertas críticas'
                    : activeFilter === 'acknowledged'
                    ? 'No hay alertas reconocidas'
                    : 'No hay notificaciones'
                  }
                </Text>
              </VStack>
            )}
            
            {/* Timeline Groups */}
            {filteredAlerts.length > 0 && (
              <VStack gap="4" align="stretch">
                {timelineGroups.today.length > 0 && (
                  <TimelineGroup 
                    label="Hoy" 
                    alerts={timelineGroups.today}
                    onAlertClick={handleAlertClick}
                  />
                )}
                {timelineGroups.yesterday.length > 0 && (
                  <TimelineGroup 
                    label="Ayer" 
                    alerts={timelineGroups.yesterday}
                    onAlertClick={handleAlertClick}
                  />
                )}
                {timelineGroups.thisWeek.length > 0 && (
                  <TimelineGroup 
                    label="Esta semana" 
                    alerts={timelineGroups.thisWeek}
                    onAlertClick={handleAlertClick}
                  />
                )}
                {timelineGroups.older.length > 0 && (
                  <TimelineGroup 
                    label="Anterior" 
                    alerts={timelineGroups.older}
                    onAlertClick={handleAlertClick}
                  />
                )}
              </VStack>
            )}
          </VStack>
        </Drawer.Body>
        
        <Drawer.Footer>
          <HStack justify="space-between" w="full">
            <Button 
              size="sm" 
              onClick={handleMarkAllRead}
              disabled={stats.unread === 0}
              variant="outline"
            >
              Marcar todo como leído
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={handleClearAll}
              disabled={filteredAlerts.length === 0}
            >
              Limpiar todo
            </Button>
          </HStack>
        </Drawer.Footer>
      </Drawer.Content>
      </Drawer.Positioner>
    </Drawer.Root>
  );
});

// Helper component: Timeline Group
interface TimelineGroupProps {
  label: string;
  alerts: Alert[];
  onAlertClick: (id: string) => void;
}

const TimelineGroup = memo(function TimelineGroup({ 
  label, 
  alerts,
  onAlertClick
}: TimelineGroupProps) {
  const actions = useAlertsActions();
  
  // 🎯 OPTIMIZADO: Callbacks estables por grupo
  const handleAcknowledge = useCallback((id: string) => {
    actions.acknowledge(id);
  }, [actions]);
  
  const handleResolve = useCallback((id: string) => {
    actions.resolve(id);
  }, [actions]);
  
  const handleDismiss = useCallback((id: string) => {
    actions.dismiss(id);
  }, [actions]);
  
  return (
    <VStack align="stretch" gap="2">
      {/* Group Header */}
      <HStack gap="2" align="center">
        <Text 
          fontSize="xs" 
          fontWeight="bold" 
          color="gray.500" 
          textTransform="uppercase"
          letterSpacing="wider"
        >
          {label}
        </Text>
        <Separator flex="1" />
      </HStack>
      
      {/* Alerts in Group */}
      <VStack align="stretch" gap="2">
        {alerts.map(alert => (
          <div 
            key={alert.id}
            onClick={() => onAlertClick(alert.id)}
            style={{ cursor: 'pointer' }}
          >
            <AlertDisplay
              alert={alert}
              variant="inline"
              size="sm"
              showActions={true}
              showMetadata={false}
              onAcknowledge={handleAcknowledge}
              onResolve={handleResolve}
              onDismiss={handleDismiss}
            />
          </div>
        ))}
      </VStack>
    </VStack>
  );
});
