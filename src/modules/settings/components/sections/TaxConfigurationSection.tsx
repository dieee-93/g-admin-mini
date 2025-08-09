// Tax Configuration Section - Tax settings and fiscal configuration
import React from "react";
import {
  Box,
  Card,
  Grid,
  Heading,
  Text,
  Badge,
  Button,
  HStack,
  VStack,
  Switch
} from "@chakra-ui/react";
import { 
  CurrencyDollarIcon, 
  DocumentTextIcon,
  CalculatorIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";
import { Icon } from "@/shared/ui/Icon";

export function TaxConfigurationSection() {
  const taxSettings = {
    mainTaxRate: 21,
    taxName: "IVA",
    includeTaxInPrices: true,
    taxNumber: "ES-B12345678",
    currency: "EUR",
    currencySymbol: "€",
    currencyPosition: "after"
  };

  const taxCategories = [
    { name: "Productos de panadería", rate: 10, items: 24 },
    { name: "Bebidas", rate: 21, items: 8 },
    { name: "Productos preparados", rate: 21, items: 15 },
    { name: "Servicios", rate: 21, items: 3 }
  ];

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading size="md">Configuración Fiscal</Heading>
        <Button colorPalette="green" size="sm">
          <Icon icon={DocumentTextIcon} size="sm" />
          Generar Reporte Fiscal
        </Button>
      </HStack>

      <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
        {/* Tax Configuration */}
        <Card.Root>
          <Card.Header>
            <HStack gap={2}>
              <Icon icon={CurrencyDollarIcon} size="md" />
              <Heading size="sm">Configuración de Impuestos</Heading>
            </HStack>
          </Card.Header>
          <Card.Body>
            <VStack gap={4} align="stretch">
              <HStack justify="space-between">
                <Text fontSize="sm">Tipo de Impuesto Principal</Text>
                <Badge colorPalette="blue" size="lg">
                  {taxSettings.taxName} {taxSettings.mainTaxRate}%
                </Badge>
              </HStack>
              
              <HStack justify="space-between">
                <Text fontSize="sm">Número de Identificación Fiscal</Text>
                <Text fontWeight="medium">{taxSettings.taxNumber}</Text>
              </HStack>

              <HStack justify="space-between">
                <Text fontSize="sm">Moneda Base</Text>
                <HStack gap={2}>
                  <Text fontWeight="medium">{taxSettings.currency}</Text>
                  <Badge colorPalette="gray">{taxSettings.currencySymbol}</Badge>
                </HStack>
              </HStack>

              <HStack justify="space-between">
                <VStack align="start" gap={0}>
                  <Text fontSize="sm">Incluir Impuestos en Precios</Text>
                  <Text fontSize="xs" color="gray.500">
                    Los precios mostrados incluyen impuestos
                  </Text>
                </VStack>
                <Switch.Root defaultChecked={taxSettings.includeTaxInPrices}>
                  <Switch.HiddenInput />
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                </Switch.Root>
              </HStack>
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* Tax Categories */}
        <Card.Root>
          <Card.Header>
            <HStack gap={2}>
              <Icon icon={CalculatorIcon} size="md" />
              <Heading size="sm">Categorías Fiscales</Heading>
            </HStack>
          </Card.Header>
          <Card.Body>
            <VStack gap={3} align="stretch">
              {taxCategories.map((category, index) => (
                <Card.Root key={index} size="sm" variant="outline">
                  <Card.Body>
                    <HStack justify="space-between">
                      <VStack align="start" gap={0}>
                        <Text fontSize="sm" fontWeight="medium">
                          {category.name}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {category.items} productos
                        </Text>
                      </VStack>
                      <Badge 
                        colorPalette={category.rate === 21 ? "red" : "green"}
                        size="sm"
                      >
                        {category.rate}%
                      </Badge>
                    </HStack>
                  </Card.Body>
                </Card.Root>
              ))}
            </VStack>
          </Card.Body>
        </Card.Root>
      </Grid>

      {/* Fiscal Compliance Status */}
      <Card.Root mt={6}>
        <Card.Header>
          <HStack gap={2}>
            <Icon icon={ShieldCheckIcon} size="md" />
            <Heading size="sm">Estado de Cumplimiento Fiscal</Heading>
          </HStack>
        </Card.Header>
        <Card.Body>
          <Grid templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={4}>
            <Box textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="green.500">✓</Text>
              <Text fontSize="sm" color="gray.600">Configuración IVA</Text>
            </Box>
            <Box textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="green.500">✓</Text>
              <Text fontSize="sm" color="gray.600">Número Fiscal</Text>
            </Box>
            <Box textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="orange.500">⚠</Text>
              <Text fontSize="sm" color="gray.600">Reportes Pendientes</Text>
            </Box>
            <Box textAlign="center">
              <Text fontSize="2xl" fontWeight="bold" color="green.500">✓</Text>
              <Text fontSize="sm" color="gray.600">Categorías</Text>
            </Box>
          </Grid>
        </Card.Body>
      </Card.Root>
    </Box>
  );
}
