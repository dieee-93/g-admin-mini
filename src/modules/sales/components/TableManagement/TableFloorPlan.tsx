// src/features/sales/components/TableManagement/TableFloorPlan.tsx
// 🚀 MODERN TABLE MANAGEMENT - Visual Floor Plan Component
import { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Grid,
  Card,
  Text,
  Badge,
  Button,
  HStack,
  VStack,
  DialogRoot,
  DialogBackdrop,
  DialogPositioner,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogCloseTrigger,
  DialogBody,
  DialogFooter,
  Alert,
  Select,
  Input,
  createListCollection
} from '@chakra-ui/react';
import {
  StatusIcon,
  ActionIcon,
  Icon
} from '@/shared/ui/Icon';
import {
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { 
  Table, 
  TableStatus, 
  TableColorCode, 
  Party,
  DEFAULT_SERVICE_TIME_LIMITS
} from '../../types';

interface TableFloorPlanProps {
  tables: Table[];
  onTableSelect: (table: Table) => void;
  onSeatParty: (tableId: string, partySize: number, customerName?: string) => void;
  onUpdateTableStatus: (tableId: string, status: TableStatus) => void;
  onProcessPayment: (tableId: string) => void;
  realTimeUpdates?: boolean;
}

export function TableFloorPlan({
  tables,
  onTableSelect,
  onSeatParty,
  onUpdateTableStatus,
  onProcessPayment,
  realTimeUpdates = true
}: TableFloorPlanProps) {
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [showSeatPartyDialog, setShowSeatPartyDialog] = useState(false);
  const [partySize, setPartySize] = useState<number>(2);
  const [customerName, setCustomerName] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<TableStatus | 'all'>('all');

  // Real-time updates simulation (in production, use WebSocket/Supabase realtime)
  useEffect(() => {
    if (!realTimeUpdates) return;
    
    const interval = setInterval(() => {
      // Update service times for occupied tables
      // This would be handled by your real-time data layer
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [realTimeUpdates]);

  // Filter tables based on status
  const filteredTables = useMemo(() => {
    if (filterStatus === 'all') return tables;
    return tables.filter(table => table.status === filterStatus);
  }, [tables, filterStatus]);

  // Calculate table color based on service time
  const getTableColorCode = (table: Table): TableColorCode => {
    if (table.status !== TableStatus.OCCUPIED || !table.current_party) {
      return TableColorCode.GREEN;
    }

    const seatedTime = new Date(table.current_party.seated_at);
    const now = new Date();
    const minutesElapsed = (now.getTime() - seatedTime.getTime()) / (1000 * 60);

    if (minutesElapsed <= DEFAULT_SERVICE_TIME_LIMITS.GREEN) {
      return TableColorCode.GREEN;
    } else if (minutesElapsed <= DEFAULT_SERVICE_TIME_LIMITS.YELLOW) {
      return TableColorCode.YELLOW;
    } else {
      return TableColorCode.RED;
    }
  };

  // Get status display info
  const getTableStatusInfo = (table: Table) => {
    const colorCode = getTableColorCode(table);
    
    switch (table.status) {
      case TableStatus.AVAILABLE:
        return {
          color: 'green',
          label: 'Available',
          icon: CheckCircleIcon,
          urgency: 'none'
        };
      case TableStatus.OCCUPIED: {
        const urgencyMap = {
          [TableColorCode.GREEN]: { color: 'green', urgency: 'none' },
          [TableColorCode.YELLOW]: { color: 'yellow', urgency: 'medium' },
          [TableColorCode.RED]: { color: 'red', urgency: 'high' }
        };
        return {
          color: urgencyMap[colorCode].color,
          label: 'Occupied',
          icon: UserGroupIcon,
          urgency: urgencyMap[colorCode].urgency
        };
      }
      case TableStatus.RESERVED:
        return {
          color: 'blue',
          label: 'Reserved',
          icon: ClockIcon,
          urgency: 'none'
        };
      case TableStatus.NEEDS_CLEANING:
        return {
          color: 'orange',
          label: 'Cleaning',
          icon: ExclamationTriangleIcon,
          urgency: 'medium'
        };
      case TableStatus.READY_FOR_BILL:
        return {
          color: 'purple',
          label: 'Ready to Pay',
          icon: ClockIcon,
          urgency: 'high'
        };
      case TableStatus.OUT_OF_ORDER:
        return {
          color: 'red',
          label: 'Out of Order',
          icon: XCircleIcon,
          urgency: 'none'
        };
      default:
        return {
          color: 'gray',
          label: 'Unknown',
          icon: ExclamationTriangleIcon,
          urgency: 'none'
        };
    }
  };

  // Handle table selection
  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
    onTableSelect(table);
  };

  // Handle seating a party
  const handleSeatParty = (table: Table) => {
    setSelectedTable(table);
    setShowSeatPartyDialog(true);
  };

  // Confirm seating
  const confirmSeatParty = () => {
    if (selectedTable && partySize > 0) {
      onSeatParty(selectedTable.id, partySize, customerName || undefined);
      setShowSeatPartyDialog(false);
      setPartySize(2);
      setCustomerName('');
      setSelectedTable(null);
    }
  };

  // Status filter collection
  const statusFilterCollection = createListCollection({
    items: [
      { value: 'all', label: 'All Tables' },
      { value: TableStatus.AVAILABLE, label: 'Available' },
      { value: TableStatus.OCCUPIED, label: 'Occupied' },
      { value: TableStatus.RESERVED, label: 'Reserved' },
      { value: TableStatus.NEEDS_CLEANING, label: 'Needs Cleaning' },
      { value: TableStatus.READY_FOR_BILL, label: 'Ready for Bill' },
      { value: TableStatus.OUT_OF_ORDER, label: 'Out of Order' }
    ]
  });

  // Get service time display
  const getServiceTimeDisplay = (party: Party) => {
    const seatedTime = new Date(party.seated_at);
    const now = new Date();
    const minutesElapsed = Math.floor((now.getTime() - seatedTime.getTime()) / (1000 * 60));
    
    return `${minutesElapsed}m`;
  };

  return (
    <VStack gap="6" align="stretch">
      {/* Header & Controls */}
      <HStack justify="space-between" align="center">
        <VStack align="start" gap="1">
          <Text fontSize="xl" fontWeight="bold">Floor Plan</Text>
          <Text color="gray.600" fontSize="sm">
            {filteredTables.length} tables • Real-time updates {realTimeUpdates ? 'ON' : 'OFF'}
          </Text>
        </VStack>

        <HStack gap="3">
          <Select.Root
            collection={statusFilterCollection}
            value={[filterStatus]}
            onValueChange={(details) => setFilterStatus(details.value[0] as TableStatus | 'all')}
            size="sm"
            width="200px"
          >
            <Select.Trigger>
              <Select.ValueText placeholder="Filter by status" />
            </Select.Trigger>
            <Select.Content>
              {statusFilterCollection.items.map((item) => (
                <Select.Item key={item.value} item={item}>
                  {item.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        </HStack>
      </HStack>

      {/* Status Legend */}
      <Card.Root p="4" bg="gray.50">
        <HStack gap="6" wrap="wrap">
          <HStack gap="2">
            <Box w="3" h="3" bg="green.500" borderRadius="full" />
            <Text fontSize="sm">Available / Optimal Service (≤15m)</Text>
          </HStack>
          <HStack gap="2">
            <Box w="3" h="3" bg="yellow.500" borderRadius="full" />
            <Text fontSize="sm">Needs Attention (15-30m)</Text>
          </HStack>
          <HStack gap="2">
            <Box w="3" h="3" bg="red.500" borderRadius="full" />
            <Text fontSize="sm">Immediate Action Required (30m+)</Text>
          </HStack>
          <HStack gap="2">
            <Box w="3" h="3" bg="blue.500" borderRadius="full" />
            <Text fontSize="sm">Reserved</Text>
          </HStack>
          <HStack gap="2">
            <Box w="3" h="3" bg="purple.500" borderRadius="full" />
            <Text fontSize="sm">Ready for Bill</Text>
          </HStack>
        </HStack>
      </Card.Root>

      {/* Tables Grid with responsive design and touch-friendly sizing */}
      <Grid 
        templateColumns={{ 
          base: "repeat(1, 1fr)", // Single column on very small screens
          sm: "repeat(2, 1fr)", 
          md: "repeat(3, 1fr)", 
          lg: "repeat(4, 1fr)",
          xl: "repeat(5, 1fr)"
        }} 
        gap={{ base: "3", md: "4" }}
        role="grid"
        aria-label="Restaurant floor plan with table statuses"
      >
        {filteredTables.map((table) => {
          const statusInfo = getTableStatusInfo(table);
          const StatusIconComponent = statusInfo.icon;
          
          return (
            <Card.Root
              key={table.id}
              p={{ base: "3", md: "4" }}
              cursor="pointer"
              onClick={() => handleTableClick(table)}
              borderWidth={selectedTable?.id === table.id ? "2px" : "1px"}
              borderColor={selectedTable?.id === table.id ? "blue.500" : "gray.200"}
              _hover={{ 
                borderColor: "blue.300",
                shadow: "md",
                transform: "translateY(-2px)"
              }}
              _active={{
                transform: "scale(0.98)"
              }}
              transition="all 0.2s"
              bg={statusInfo.urgency === 'high' ? 'red.50' : 
                  statusInfo.urgency === 'medium' ? 'yellow.50' : 'white'}
              minH={{ base: "140px", md: "160px" }}
              role="gridcell"
              aria-label={`Table ${table.number}, ${statusInfo.label}, capacity ${table.capacity}`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleTableClick(table);
                }
              }}
            >
              <VStack gap="3" align="stretch">
                {/* Table Header */}
                <HStack justify="space-between" align="center">
                  <VStack align="start" gap="0">
                    <Text fontWeight="bold" fontSize="lg">
                      Table {table.number}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      Seats {table.capacity}
                    </Text>
                  </VStack>
                  
                  <Badge
                    colorPalette={statusInfo.color}
                    size="sm"
                    variant="subtle"
                  >
                    <Icon icon={StatusIconComponent} size="xs" className="mr-1" />
                    {statusInfo.label}
                  </Badge>
                </HStack>

                {/* Party Info (if occupied) */}
                {table.current_party && table.status === TableStatus.OCCUPIED && (
                  <VStack align="stretch" gap="2" p="2" bg="gray.50" borderRadius="md">
                    <HStack justify="space-between">
                      <Text fontSize="sm" fontWeight="medium">
                        Party of {table.current_party.size}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        {getServiceTimeDisplay(table.current_party)}
                      </Text>
                    </HStack>
                    
                    {table.service_stage && (
                      <Text fontSize="xs" color="gray.600">
                        Stage: {table.service_stage.replace('_', ' ')}
                      </Text>
                    )}
                    
                    <Text fontSize="sm" fontWeight="bold" color="green.600">
                      ${table.current_party.total_spent.toFixed(2)}
                    </Text>
                  </VStack>
                )}

                {/* Action Buttons */}
                <VStack gap="2" align="stretch">
                  {table.status === TableStatus.AVAILABLE && (
                    <Button
                      size="sm"
                      colorPalette="green"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSeatParty(table);
                      }}
                    >
                      <Icon icon={UserGroupIcon} size="sm" />
                      Seat Party
                    </Button>
                  )}
                  
                  {table.status === TableStatus.READY_FOR_BILL && (
                    <Button
                      size="sm"
                      colorPalette="purple"
                      onClick={(e) => {
                        e.stopPropagation();
                        onProcessPayment(table.id);
                      }}
                    >
                      Process Payment
                    </Button>
                  )}
                  
                  {table.status === TableStatus.NEEDS_CLEANING && (
                    <Button
                      size="sm"
                      colorPalette="orange"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateTableStatus(table.id, TableStatus.AVAILABLE);
                      }}
                    >
                      Mark Clean
                    </Button>
                  )}
                </VStack>
              </VStack>
            </Card.Root>
          );
        })}
      </Grid>

      {/* Empty State */}
      {filteredTables.length === 0 && (
        <Card.Root p="8" textAlign="center">
          <VStack gap="3">
            <Icon icon={ExclamationTriangleIcon} size="2xl" color="gray.400" />
            <Text color="gray.600">
              No tables found matching the current filter
            </Text>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setFilterStatus('all')}
            >
              Show All Tables
            </Button>
          </VStack>
        </Card.Root>
      )}

      {/* Seat Party Dialog */}
      <DialogRoot 
        open={showSeatPartyDialog} 
        onOpenChange={(details) => setShowSeatPartyDialog(details.open)}
      >
        <DialogBackdrop />
        <DialogPositioner>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Seat Party - Table {selectedTable?.number}
              </DialogTitle>
              <DialogCloseTrigger />
            </DialogHeader>

            <DialogBody>
              <VStack gap="4" align="stretch">
                <Alert.Root status="info">
                  <StatusIcon name="info" color="blue.500" />
                  <Alert.Title>Seating New Party</Alert.Title>
                  <Alert.Description>
                    Table capacity: {selectedTable?.capacity} people
                  </Alert.Description>
                </Alert.Root>

                <Box>
                  <Text mb="2" fontWeight="medium">Party Size *</Text>
                  <Input
                    type="number"
                    min="1"
                    max={selectedTable?.capacity || 8}
                    value={partySize}
                    onChange={(e) => setPartySize(parseInt(e.target.value) || 1)}
                    placeholder="Number of guests"
                  />
                </Box>

                <Box>
                  <Text mb="2" fontWeight="medium">Customer Name (Optional)</Text>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Customer or party name"
                  />
                </Box>
              </VStack>
            </DialogBody>

            <DialogFooter>
              <HStack gap="3" justify="space-between" w="full">
                <Button 
                  variant="outline" 
                  onClick={() => setShowSeatPartyDialog(false)}
                >
                  Cancel
                </Button>
                <Button 
                  colorPalette="green"
                  onClick={confirmSeatParty}
                  disabled={partySize < 1 || partySize > (selectedTable?.capacity || 8)}
                >
                  <ActionIcon name="add" size="sm" />
                  Seat Party
                </Button>
              </HStack>
            </DialogFooter>
          </DialogContent>
        </DialogPositioner>
      </DialogRoot>
    </VStack>
  );
}