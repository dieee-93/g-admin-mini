/**
 * CustomerSelector - Reusable component for searching and selecting customers
 * 
 * Features:
 * - Search by name, phone, email
 * - Shows customer info in dropdown
 * - Option to create new customer
 * - Debounced search for performance
 * 
 * @example
 * <CustomerSelector
 *   selectedCustomer={customer}
 *   onSelect={(c) => setCustomer(c)}
 *   onCreateNew={() => openNewCustomerModal()}
 * />
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
    Box,
    Stack,
    Flex,
    Text,
    Badge,
    Spinner,
    CardWrapper,
    InputField,
    Button
} from '@/shared/ui';
import { useCustomers } from '@/modules/customers/hooks';
import type { Customer } from '@/pages/admin/core/crm/customers/types/customer';

export interface CustomerSelectorProps {
    /** Currently selected customer */
    selectedCustomer: Customer | null;
    /** Callback when customer is selected */
    onSelect: (customer: Customer | null) => void;
    /** Callback to open create new customer flow */
    onCreateNew?: () => void;
    /** Placeholder text */
    placeholder?: string;
    /** Disable selector */
    disabled?: boolean;
    /** Show selected customer card */
    showSelectedCard?: boolean;
}

export const CustomerSelector: React.FC<CustomerSelectorProps> = ({
    selectedCustomer,
    onSelect,
    onCreateNew,
    placeholder = "Buscar cliente por nombre, teléfono...",
    disabled = false,
    showSelectedCard = true
}) => {
    const { customers, loading } = useCustomers();
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);

    const debouncedQuery = useDebounce(query, 300);

    // Filter customers by search query
    const filteredCustomers = useMemo(() => {
        if (!debouncedQuery.trim()) return [];

        const searchQuery = debouncedQuery.toLowerCase();
        return customers
            .filter(customer => {
                const nameMatch = customer.name?.toLowerCase().includes(searchQuery);
                const phoneMatch = customer.phone?.toLowerCase().includes(searchQuery);
                const emailMatch = customer.email?.toLowerCase().includes(searchQuery);
                return nameMatch || phoneMatch || emailMatch;
            })
            .slice(0, 8); // Limit results
    }, [debouncedQuery, customers]);

    const handleSelect = useCallback((customer: Customer) => {
        setQuery('');
        setIsOpen(false);
        onSelect(customer);
    }, [onSelect]);

    const handleClear = useCallback(() => {
        onSelect(null);
        setQuery('');
    }, [onSelect]);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);
        setIsOpen(value.trim().length > 0);
    }, []);

    // If customer is selected, show their info card
    if (selectedCustomer && showSelectedCard) {
        return (
            <CardWrapper variant="outline" borderColor="blue.200" bg="blue.50" _dark={{ bg: 'blue.950', borderColor: 'blue.800' }}>
                <CardWrapper.Body p="3">
                    <Flex justify="space-between" align="center">
                        <Stack direction="row" gap="3" align="center">
                            <Box
                                p="2"
                                bg="blue.100"
                                borderRadius="full"
                                _dark={{ bg: 'blue.900' }}
                            >
                                <UserIcon style={{ width: '20px', height: '20px', color: 'var(--chakra-colors-blue-600)' }} />
                            </Box>
                            <Stack gap="0">
                                <Text fontWeight="semibold">{selectedCustomer.name}</Text>
                                <Stack direction="row" gap="3" fontSize="sm" color="gray.600">
                                    {selectedCustomer.phone && (
                                        <Stack direction="row" gap="1" align="center">
                                            <PhoneIcon style={{ width: '12px', height: '12px' }} />
                                            <Text>{selectedCustomer.phone}</Text>
                                        </Stack>
                                    )}
                                    {selectedCustomer.email && (
                                        <Stack direction="row" gap="1" align="center">
                                            <EnvelopeIcon style={{ width: '12px', height: '12px' }} />
                                            <Text>{selectedCustomer.email}</Text>
                                        </Stack>
                                    )}
                                </Stack>
                            </Stack>
                        </Stack>
                        <Button
                            variant="ghost"
                            size="sm"
                            colorPalette="red"
                            onClick={handleClear}
                        >
                            Cambiar
                        </Button>
                    </Flex>
                </CardWrapper.Body>
            </CardWrapper>
        );
    }

    return (
        <Box position="relative" w="full">
            {/* Search Input */}
            <Box position="relative">
                <InputField
                    value={query}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    disabled={disabled || loading}
                    pr="10"
                    onFocus={() => query && setIsOpen(filteredCustomers.length > 0 || query.length > 0)}
                    onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                />

                <Box
                    position="absolute"
                    right="3"
                    top="50%"
                    transform="translateY(-50%)"
                    pointerEvents="none"
                >
                    {loading ? (
                        <Spinner size="sm" />
                    ) : (
                        <MagnifyingGlassIcon
                            style={{
                                width: '16px',
                                height: '16px',
                                color: 'var(--chakra-colors-gray-400)'
                            }}
                        />
                    )}
                </Box>
            </Box>

            {/* Results Dropdown */}
            {isOpen && (
                <CardWrapper
                    position="absolute"
                    top="100%"
                    left="0"
                    right="0"
                    zIndex="dropdown"
                    mt="1"
                    maxH="350px"
                    overflowY="auto"
                    variant="elevated"
                >
                    <CardWrapper.Body p="2">
                        <Stack gap="1">
                            {/* Customer Results */}
                            {filteredCustomers.map((customer) => (
                                <Flex
                                    key={customer.id}
                                    p="3"
                                    borderRadius="md"
                                    cursor="pointer"
                                    _hover={{ bg: "gray.50", _dark: { bg: 'gray.800' } }}
                                    onClick={() => handleSelect(customer)}
                                    align="center"
                                    gap="3"
                                >
                                    <Box
                                        p="2"
                                        bg="gray.100"
                                        borderRadius="full"
                                        _dark={{ bg: 'gray.800' }}
                                    >
                                        <UserIcon style={{ width: '16px', height: '16px' }} />
                                    </Box>

                                    <Stack gap="0" flex="1" minW="0">
                                        <Text fontWeight="medium" truncate>
                                            {customer.name}
                                        </Text>
                                        <Stack direction="row" gap="2" fontSize="xs" color="gray.500">
                                            {customer.phone && <Text>{customer.phone}</Text>}
                                            {customer.email && <Text>• {customer.email}</Text>}
                                        </Stack>
                                    </Stack>

                                    {customer.status === 'vip' && (
                                        <Badge colorPalette="purple" size="sm">VIP</Badge>
                                    )}
                                    {customer.loyalty_tier && customer.loyalty_tier !== 'bronze' && (
                                        <Badge
                                            colorPalette={
                                                customer.loyalty_tier === 'platinum' ? 'purple' :
                                                    customer.loyalty_tier === 'gold' ? 'yellow' : 'gray'
                                            }
                                            size="sm"
                                        >
                                            {customer.loyalty_tier}
                                        </Badge>
                                    )}
                                </Flex>
                            ))}

                            {/* No Results Message */}
                            {filteredCustomers.length === 0 && debouncedQuery.trim() && (
                                <Box p="3" textAlign="center">
                                    <Text fontSize="sm" color="gray.500">
                                        No se encontraron clientes
                                    </Text>
                                </Box>
                            )}

                            {/* Create New Option */}
                            {onCreateNew && (
                                <>
                                    <Box borderTopWidth="1px" my="1" />
                                    <Flex
                                        p="3"
                                        borderRadius="md"
                                        cursor="pointer"
                                        _hover={{ bg: "blue.50", _dark: { bg: 'blue.950' } }}
                                        onClick={onCreateNew}
                                        align="center"
                                        gap="3"
                                        color="blue.600"
                                    >
                                        <PlusIcon style={{ width: '16px', height: '16px' }} />
                                        <Text fontWeight="medium">Crear nuevo cliente</Text>
                                    </Flex>
                                </>
                            )}
                        </Stack>
                    </CardWrapper.Body>
                </CardWrapper>
            )}
        </Box>
    );
};

export default CustomerSelector;
