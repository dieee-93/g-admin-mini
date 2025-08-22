import React from 'react';
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  Input,
  IconButton,
  Button,
  Badge,
  useBreakpointValue
} from '@chakra-ui/react';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/solid';
import { FunnelIcon } from '@heroicons/react/24/outline';
import { useMaterials } from '@/store/materialsStore';

interface Props {
  onAddItem?: () => void;
  onShowAnalytics?: () => void;
  onOpenFilters?: () => void;
}

export default function StockLabHeader({ onAddItem = () => {}, onShowAnalytics, onOpenFilters }: Props) {
  const { stats } = useMaterials();
  const showFullStats = useBreakpointValue({ base: false, md: true });

  return (
    <Box py={6} px={{ base: 4, md: 6 }} borderBottomWidth={1} borderColor="gray.100" bg="transparent">
      <Flex align="center" justify="space-between" gap={4}>
        <VStack align="start" gap={1} flex={1} minW={0}>
          <Text fontSize={{ base: 'xl', md: '2xl' }} fontWeight="bold" color="gray.800">
            StockLab
          </Text>
          <Text fontSize="sm" color="gray.500">
            Inventario y control de insumos — vista mejorada
          </Text>

          <HStack gap={3} mt={2} display={showFullStats ? 'flex' : 'none'}>
            <Badge colorScheme="green">{stats?.totalItems ?? 0} items</Badge>
            <Box as="span" color="gray.600" fontSize="sm">Valor: ${stats?.totalValue?.toLocaleString() ?? 0}</Box>
            <Box as="span" color="orange.600" fontSize="sm">Bajo: {stats?.lowStockItems ?? 0}</Box>
          </HStack>
        </VStack>

        <HStack gap={3} align="center" flexShrink={0}>
          {/* Mobile filters button */}
          <IconButton
            aria-label="Abrir filtros"
            display={{ base: 'inline-flex', md: 'none' }}
            onClick={onOpenFilters}
            variant="ghost"
            size="md"
            _focus={{ boxShadow: '0 0 0 4px rgba(14,165,255,0.12)', outline: 'none' }}
          >
            <FunnelIcon className="w-5 h-5" />
          </IconButton>

          <HStack w={{ base: '140px', md: '320px' }} display={{ base: 'none', md: 'flex' }} bg="surface.100" p={2} borderRadius="md" gap={2}>
            <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
            <Input
              variant="subtle"
              placeholder="Buscar material, categoría..."
              size="md"
              aria-label="Buscar materiales"
              bg="transparent"
              color="gray.800"
              _placeholder={{ color: 'gray.400' }}
            />
          </HStack>

          <Button
            bg="brand.500"
            color="white"
            size="md"
            onClick={onAddItem}
            minW="120px"
            _hover={{ bg: 'brand.600' }}
            _focus={{ boxShadow: '0 0 0 4px rgba(14,165,255,0.16)', outline: 'none' }}
          >
            <PlusIcon className="w-4 h-4 mr-2" />
            Nuevo
          </Button>

          <IconButton
            aria-label="Ver analíticas"
            size="md"
            onClick={onShowAnalytics}
            variant="ghost"
            _focus={{ boxShadow: '0 0 0 4px rgba(14,165,255,0.12)', outline: 'none' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 12h18" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </IconButton>
        </HStack>
      </Flex>
    </Box>
  );
}
