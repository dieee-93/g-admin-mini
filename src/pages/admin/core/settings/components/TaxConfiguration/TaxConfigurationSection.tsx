// Tax Configuration Section - Tax settings and fiscal configuration
import React from "react";
import { Switch } from "@/shared/ui/Switch";
import { 
  CurrencyDollarIcon, 
  DocumentTextIcon,
  CalculatorIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  BanknotesIcon,
  ChartBarIcon,
  DocumentCheckIcon,
  CogIcon
} from "@heroicons/react/24/outline";
import { Icon, Typography, CardWrapper, Section, Stack, SimpleGrid, Button, Badge, MetricCard, Alert } from "@/shared/ui";

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
    <Section variant="elevated" title="Configuración Fiscal">
      <Stack direction={{ base: "column", sm: "row" }} justify="space-between" align={{ base: "stretch", sm: "center" }} gap="md" mb="xl">
        <div />
          <Button colorPalette="green" size="sm">
          <Icon icon={DocumentTextIcon} size="sm" />
          Generar Reporte Fiscal
        </Button>
      </Stack>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="xl">
        {/* Tax Configuration */}
        <CardWrapper>
          <CardWrapper.Header>
            <Stack direction="row" justify="space-between" align="center">
              <CardWrapper.Title>Configuración de Impuestos</CardWrapper.Title>
              <Badge variant="solid" colorPalette="blue">
                <Icon icon={CheckCircleIcon} size="xs" />
                Configurado
              </Badge>
            </Stack>
          </CardWrapper.Header>
          <CardWrapper.Body>
            <Stack gap="lg">
              {/* Main Tax Rate - Featured */}
              <MetricCard
                title="IVA Principal"
                value={`${taxSettings.mainTaxRate}%`}
                subtitle="Tasa aplicada por defecto"
                icon={CurrencyDollarIcon}
                colorPalette="green"
                badge={{
                  value: "Activo",
                  colorPalette: "green"
                }}
              />
              
              {/* Tax Details */}
              <Stack direction="column" gap="md">
                <Typography variant="subtitle" weight="semibold" color="text.muted">Detalles Fiscales</Typography>
                
                <Stack direction="column" gap="sm">
                  {/* Tax ID */}
                  <Stack direction="row" align="center" gap="sm" p="sm" bg="blue.50" borderRadius="md">
                    <Icon icon={DocumentCheckIcon} size="md" color="blue.500" />
                    <Stack gap="xs">
                      <Typography variant="caption" color="text.secondary">Número de Identificación Fiscal</Typography>
                      <Typography variant="body" weight="medium">{taxSettings.taxNumber}</Typography>
                    </Stack>
                  </Stack>

                  {/* Currency */}
                  <Stack direction="row" align="center" gap="sm" p="sm" bg="purple.50" borderRadius="md">
                    <Icon icon={BanknotesIcon} size="md" color="purple.500" />
                    <Stack gap="xs" flex="1">
                      <Typography variant="caption" color="text.secondary">Moneda Base</Typography>
                      <Stack direction="row" align="center" gap="sm">
                        <Typography variant="body" weight="medium">{taxSettings.currency}</Typography>
                        <Badge colorPalette="purple" variant="outline">{taxSettings.currencySymbol}</Badge>
                      </Stack>
                    </Stack>
                  </Stack>

                  {/* Tax Inclusion Setting */}
                  <Stack direction="row" align="center" gap="sm" p="sm" bg="bg.surface" borderRadius="md">
                    <Icon icon={CogIcon} size="md" color="text.secondary" />
                    <Stack gap="xs" flex="1">
                      <Typography variant="body" size="sm" weight="medium">Incluir Impuestos en Precios</Typography>
                      <Typography variant="body" size="xs" color="text.secondary">
                        Los precios mostrados incluyen impuestos
                      </Typography>
                    </Stack>
                    <Switch 
                      checked={taxSettings.includeTaxInPrices}
                      colorPalette={taxSettings.includeTaxInPrices ? "green" : "gray"}
                    />
                  </Stack>
                </Stack>
              </Stack>
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>

        {/* Tax Categories */}
        <CardWrapper>
          <CardWrapper.Header>
            <Stack direction="row" justify="space-between" align="center">
              <CardWrapper.Title>Categorías Fiscales</CardWrapper.Title>
              <Badge variant="subtle" colorPalette="orange">
                <Icon icon={ChartBarIcon} size="xs" />
                {taxCategories.length} tipos
              </Badge>
            </Stack>
          </CardWrapper.Header>
          <CardWrapper.Body>
            <Stack gap="md">
              {/* Categories Stats */}
              <SimpleGrid columns={2} gap="sm">
                <MetricCard
                  title="Productos Total"
                  value={taxCategories.reduce((sum, cat) => sum + cat.items, 0)}
                  subtitle="en todas las categorías"
                  icon={ChartBarIcon}
                  colorPalette="blue"
                />
                <MetricCard
                  title="Tasa Promedio"
                  value={`${Math.round(taxCategories.reduce((sum, cat) => sum + cat.rate, 0) / taxCategories.length)}%`}
                  subtitle="impuesto aplicado"
                  icon={CalculatorIcon}
                  colorPalette="purple"
                />
              </SimpleGrid>
              
              {/* Category List */}
              <Stack direction="column" gap="xs">
                <Typography variant="subtitle" weight="semibold" color="text.muted">Detalle por Categoría</Typography>
                {taxCategories.map((category, index) => (
                  <Stack 
                    key={index}
                    direction="row" 
                    justify="space-between" 
                    align="center"
                    p="sm"
                    bg={category.rate === 21 ? "red.50" : "green.50"}
                    borderRadius="md"
                    borderLeft="4px solid"
                    borderColor={category.rate === 21 ? "red.400" : "green.400"}
                  >
                    <Stack direction="row" align="center" gap="sm">
                      <Icon 
                        icon={category.rate === 21 ? ExclamationTriangleIcon : CheckCircleIcon} 
                        size="sm" 
                        color={category.rate === 21 ? "red.500" : "green.500"}
                      />
                      <Stack gap="xs">
                        <Typography variant="body" size="sm" fontWeight="medium">
                          {category.name}
                        </Typography>
                        <Typography variant="body" size="xs" color="text.secondary">
                          {category.items} productos
                        </Typography>
                      </Stack>
                    </Stack>
                    <Stack direction="row" align="center" gap="sm">
                      <Typography 
                        variant="body" 
                        weight="bold"
                        color={category.rate === 21 ? "red.700" : "green.700"}
                      >
                        {category.rate}%
                      </Typography>
                      <Badge 
                        variant="solid"
                        colorPalette={category.rate === 21 ? "red" : "green"}
                        size="sm"
                      >
                        {category.rate === 21 ? "Alto" : "Reducido"}
                      </Badge>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
              
              {/* Quick Actions */}
              <Stack direction="row" gap="sm" mt="sm">
                <Button size="sm" colorPalette="blue" variant="outline">
                  <Icon icon={CalculatorIcon} size="xs" />
                  Agregar Categoría
                </Button>
                <Button size="sm" colorPalette="gray" variant="ghost">
                  <Icon icon={DocumentTextIcon} size="xs" />
                  Ver Productos
                </Button>
              </Stack>
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>
      </SimpleGrid>

      {/* Fiscal Compliance Status */}
      <CardWrapper>
        <CardWrapper.Header>
          <Stack direction="row" justify="space-between" align="center">
            <CardWrapper.Title>Estado de Cumplimiento Fiscal</CardWrapper.Title>
            <Badge variant="subtle" colorPalette="orange">
              <Icon icon={ExclamationTriangleIcon} size="xs" />
              1 Pendiente
            </Badge>
          </Stack>
        </CardWrapper.Header>
        <CardWrapper.Body>
          <Stack gap="lg">
            {/* Overall Status Alert */}
            <Alert status="warning" variant="subtle">
              <Icon icon={ExclamationTriangleIcon} />
              <Stack gap="xs">
                <Typography variant="body" weight="semibold">Acción requerida</Typography>
                <Typography variant="body" size="sm">
                  Tienes reportes fiscales pendientes de envío
                </Typography>
              </Stack>
            </Alert>
            
            {/* Compliance Metrics */}
            <SimpleGrid columns={{ base: 2, md: 4 }} gap="md">
              <MetricCard
                title="IVA"
                value="✓"
                subtitle="Configurado"
                icon={CheckCircleIcon}
                colorPalette="green"
                badge={{
                  value: "OK",
                  colorPalette: "green"
                }}
              />
              
              <MetricCard
                title="Fiscal"
                value="✓"
                subtitle="Número válido"
                icon={DocumentCheckIcon}
                colorPalette="green"
                badge={{
                  value: "OK",
                  colorPalette: "green"
                }}
              />
              
              <MetricCard
                title="Reportes"
                value="⚠"
                subtitle="Pendientes"
                icon={ExclamationTriangleIcon}
                colorPalette="orange"
                badge={{
                  value: "2",
                  colorPalette: "orange"
                }}
              />
              
              <MetricCard
                title="Categorías"
                value="✓"
                subtitle="Completas"
                icon={ChartBarIcon}
                colorPalette="blue"
                badge={{
                  value: `${taxCategories.length}`,
                  colorPalette: "blue"
                }}
              />
            </SimpleGrid>
            
            {/* Quick Actions for Compliance */}
            <Stack direction="row" gap="sm">
              <Button size="sm" colorPalette="orange">
                <Icon icon={DocumentTextIcon} size="xs" />
                Enviar Reportes Pendientes
              </Button>
              <Button size="sm" colorPalette="green" variant="outline">
                <Icon icon={CheckCircleIcon} size="xs" />
                Verificar Configuración
              </Button>
              <Button size="sm" colorPalette="gray" variant="ghost">
                <Icon icon={ShieldCheckIcon} size="xs" />
                Historial de Cumplimiento
              </Button>
            </Stack>
          </Stack>
        </CardWrapper.Body>
      </CardWrapper>
    </Section>
  );
}