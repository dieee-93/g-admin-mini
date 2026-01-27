/**
 * Table Showcase - Data table components
 * 
 * Components: Table with all its parts
 */

import { Box, Text, Flex } from '@chakra-ui/react';
import { Table, Badge, Avatar } from '@/shared/ui';

// Showcase section wrapper (reused pattern)
function ShowcaseSection({
    title,
    description,
    children
}: {
    title: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <Box
            p="5"
            bg="bg.subtle"
            borderRadius="xl"
            border="1px solid"
            borderColor="border.subtle"
        >
            <Flex justify="space-between" align="flex-start" mb="4">
                <Box>
                    <Text fontSize="md" fontWeight="bold" color="text.primary">
                        {title}
                    </Text>
                    {description && (
                        <Text fontSize="sm" color="text.muted" mt="1">
                            {description}
                        </Text>
                    )}
                </Box>
            </Flex>
            {children}
        </Box>
    );
}

// Sample data
const products = [
    { id: 1, name: 'Hamburguesa Clásica', price: 12.99, stock: 50, status: 'active' },
    { id: 2, name: 'Pizza Margarita', price: 15.50, stock: 30, status: 'active' },
    { id: 3, name: 'Ensalada César', price: 9.99, stock: 0, status: 'inactive' },
    { id: 4, name: 'Pasta Carbonara', price: 14.00, stock: 25, status: 'active' },
    { id: 5, name: 'Tacos al Pastor', price: 11.50, stock: 5, status: 'low' },
];

const employees = [
    { id: 1, name: 'Ana García', role: 'Manager', email: 'ana@example.com' },
    { id: 2, name: 'Carlos López', role: 'Chef', email: 'carlos@example.com' },
    { id: 3, name: 'María Rodríguez', role: 'Waiter', email: 'maria@example.com' },
];

export function TableShowcase() {
    return (
        <ShowcaseSection
            title="Table"
            description="Data tables with headers, body, and various cell types"
        >
            <Box spaceY="6">
                {/* Basic Table */}
                <Box>
                    <Text fontSize="sm" fontWeight="medium" color="text.secondary" mb="3">
                        Products Table
                    </Text>
                    <Table.Root size="sm" variant="outline">
                        <Table.Header>
                            <Table.Row>
                                <Table.ColumnHeader>Producto</Table.ColumnHeader>
                                <Table.ColumnHeader>Precio</Table.ColumnHeader>
                                <Table.ColumnHeader>Stock</Table.ColumnHeader>
                                <Table.ColumnHeader>Estado</Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {products.map((product) => (
                                <Table.Row key={product.id}>
                                    <Table.Cell>
                                        <Text fontWeight="medium">{product.name}</Text>
                                    </Table.Cell>
                                    <Table.Cell>${product.price.toFixed(2)}</Table.Cell>
                                    <Table.Cell>{product.stock} uds</Table.Cell>
                                    <Table.Cell>
                                        <Badge
                                            colorPalette={
                                                product.status === 'active' ? 'green' :
                                                    product.status === 'low' ? 'orange' : 'red'
                                            }
                                            size="sm"
                                        >
                                            {product.status === 'active' ? 'Activo' :
                                                product.status === 'low' ? 'Stock bajo' : 'Inactivo'}
                                        </Badge>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table.Root>
                </Box>

                {/* Table with Avatars */}
                <Box>
                    <Text fontSize="sm" fontWeight="medium" color="text.secondary" mb="3">
                        Employees Table (with avatars)
                    </Text>
                    <Table.Root size="md">
                        <Table.Header>
                            <Table.Row>
                                <Table.ColumnHeader>Empleado</Table.ColumnHeader>
                                <Table.ColumnHeader>Rol</Table.ColumnHeader>
                                <Table.ColumnHeader>Email</Table.ColumnHeader>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {employees.map((emp) => (
                                <Table.Row key={emp.id}>
                                    <Table.Cell>
                                        <Flex align="center" gap="2">
                                            <Avatar size="xs" name={emp.name} />
                                            <Text fontWeight="medium">{emp.name}</Text>
                                        </Flex>
                                    </Table.Cell>
                                    <Table.Cell>{emp.role}</Table.Cell>
                                    <Table.Cell color="text.muted">{emp.email}</Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table.Root>
                </Box>
            </Box>
        </ShowcaseSection>
    );
}
