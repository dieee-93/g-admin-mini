// 🔍 COMPONENTE DE BÚSQUEDA DE CONFIGURACIONES G-ADMIN v2.1
// Búsqueda inteligente con autocompletado y navegación
import React, { useRef, useEffect } from 'react';
import {
  Box,
  HStack,
  VStack,
  Icon,
  Badge,
  Button,
  Separator,
  Text,
  Input,
  Kbd,
  Portal
} from '@/shared/ui';
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  CommandLineIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useSettingsSearch } from '../hooks/useSettingsSearch';

interface SettingsSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsSearch({ isOpen, onClose }: SettingsSearchProps) {
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const {
    searchQuery,
    isSearching,
    searchResults,
    searchStats,
    handleSearch,
    handleSelectResult,
    clearSearch,
    popularSearches
  } = useSettingsSearch();

  // 🎯 Focus automático cuando se abre
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // ⌨️ Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
      if (e.key === 'Enter' && searchResults.length > 0) {
        handleSelectResult(searchResults[0]);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose, searchResults, handleSelectResult]);

  if (!isOpen) return null;

  // 🎨 Color mapping por sección
  const getSectionColor = (section: string) => {
    const colors = {
      perfil: 'blue',
      fiscal: 'green', 
      usuarios: 'purple',
      sistema: 'orange'
    };
    return colors[section as keyof typeof colors] || 'gray';
  };

  const getSectionLabel = (section: string) => {
    const labels = {
      perfil: 'Perfil',
      fiscal: 'Fiscal',
      usuarios: 'Usuarios',
      sistema: 'Sistema'
    };
    return labels[section as keyof typeof labels] || section;
  };

  return (
    <Portal>
      {/* 🌚 Backdrop */}
      <Box
        position="fixed"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bg="blackAlpha.600"
        zIndex={1000}
        onClick={onClose}
      />
      
      {/* 🔍 Search Modal */}
      <Box
        position="fixed"
        top="20%"
        left="50%"
        transform="translateX(-50%)"
        width={{ base: '90%', md: '600px' }}
        maxWidth="600px"
        bg="bg.surface"
        borderRadius="xl"
        shadow="2xl"
        border="1px"
        borderColor="border.muted"
        zIndex={1001}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 📱 Header */}
        <Box p="4" borderBottomWidth="1px" borderColor="border.muted">
          <HStack gap="3">
            <Icon icon={MagnifyingGlassIcon} size="md" color="text.muted" />
            
            <Box flex={1} position="relative">
              <Input
                ref={searchInputRef}
                placeholder="Buscar configuraciones..."
                value={searchQuery}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearch(e.target.value)}
                border="none"
                _focus={{ boxShadow: 'none' }}
                fontSize="md"
                pr={searchQuery ? "10" : "4"}
              />
              
              {searchQuery && (
                <Box position="absolute" right="2" top="50%" transform="translateY(-50%)">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearSearch}
                  >
                    <Icon icon={XMarkIcon} size="sm" />
                  </Button>
                </Box>
              )}
            </Box>
            
            <Kbd>Esc</Kbd>
          </HStack>
        </Box>

        {/* 📋 Content */}
        <Box maxH="400px" overflowY="auto">
          {/* 🔍 Resultados de búsqueda */}
          {isSearching && searchResults.length > 0 && (
            <VStack gap="0" align="stretch">
              <Box p="3" bg="bg.muted">
                <Text fontSize="sm" color="text.muted">
                  {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''} encontrado{searchResults.length !== 1 ? 's' : ''}
                </Text>
              </Box>
              
              {searchResults.map((item, index) => {
                const IconComponent = item.icon;
                
                return (
                  <Box
                    key={item.id}
                    p="4"
                    borderBottomWidth={index < searchResults.length - 1 ? "1px" : "0"}
                    borderColor="border.muted"
                    cursor="pointer"
                    _hover={{ bg: 'bg.muted' }}
                    onClick={() => {
                      handleSelectResult(item);
                      onClose();
                    }}
                  >
                    <HStack gap="3" align="start">
                      <Box
                        p="2"
                        borderRadius="md"
                        bg={`${getSectionColor(item.section)}.50`}
                      >
                        <Icon 
                          icon={IconComponent} 
                          size="md" 
                          color={`${getSectionColor(item.section)}.500`}
                        />
                      </Box>
                      
                      <VStack gap="1" align="start" flex={1}>
                        <HStack gap="2">
                          <Text fontWeight="medium" fontSize="sm">
                            {item.title}
                          </Text>
                          <Badge 
                            size="sm"
                          >
                            {getSectionLabel(item.section)}
                          </Badge>
                        </HStack>
                        
                        <Text fontSize="xs" color="text.muted" lineHeight="short">
                          {item.description}
                        </Text>
                      </VStack>
                    </HStack>
                  </Box>
                );
              })}
            </VStack>
          )}

          {/* ❌ Sin resultados */}
          {isSearching && searchResults.length === 0 && (
            <Box p="8" textAlign="center">
              <Icon icon={MagnifyingGlassIcon} size="xl" color="text.muted" mb="3" />
              <Text fontSize="md" fontWeight="medium" mb="1">
                Sin resultados
              </Text>
              <Text fontSize="sm" color="text.muted">
                No encontramos configuraciones que coincidan con "{searchQuery}"
              </Text>
            </Box>
          )}

          {/* 🎯 Estado inicial - Búsquedas populares */}
          {!isSearching && (
            <VStack gap="4" p="6" align="stretch">
              <HStack gap="2">
                <Icon icon={ClockIcon} size="sm" color="text.muted" />
                <Text fontSize="sm" fontWeight="medium" color="text.muted">
                  Búsquedas populares
                </Text>
              </HStack>
              
              <HStack gap="2" flexWrap="wrap">
                {popularSearches.map((search) => (
                  <Button
                    key={search}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSearch(search)}
                  >
                    <Text fontSize="xs">
                      {search}
                    </Text>
                  </Button>
                ))}
              </HStack>
              
              <Separator />
              
              {/* 📊 Stats rápidas */}
              <HStack gap="4" fontSize="xs" color="text.muted">
                <Text>📋 {searchStats.totalItems} configuraciones</Text>
                <Text>🏢 {searchStats.sectionsCount.perfil} perfil</Text>
                <Text>💰 {searchStats.sectionsCount.fiscal} fiscal</Text>
                <Text>👥 {searchStats.sectionsCount.usuarios} usuarios</Text>
                <Text>⚙️ {searchStats.sectionsCount.sistema} sistema</Text>
              </HStack>
            </VStack>
          )}
        </Box>

        {/* 🔧 Footer con shortcuts */}
        <Box 
          p="3" 
          borderTopWidth="1px" 
          borderColor="border.muted"
          bg="bg.muted"
          borderBottomRadius="xl"
        >
          <HStack gap="4" fontSize="xs" color="text.muted">
            <HStack gap="1">
              <Kbd>⏎</Kbd>
              <Text>seleccionar</Text>
            </HStack>
            <HStack gap="1">
              <Kbd>Esc</Kbd>
              <Text>cerrar</Text>
            </HStack>
            <HStack gap="1">
              <Icon icon={CommandLineIcon} size="xs" />
              <Text>Búsqueda inteligente activa</Text>
            </HStack>
          </HStack>
        </Box>
      </Box>
    </Portal>
  );
}