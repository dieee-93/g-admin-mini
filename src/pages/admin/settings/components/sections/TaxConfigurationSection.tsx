// Tax Configuration Section - Tax settings and fiscal configuration
import React from "react";
import { Switch } from "@/shared/ui/Switch";
import { 
  CurrencyDollarIcon, 
  DocumentTextIcon,
  CalculatorIcon,
  ShieldCheckIcon
} from "@heroicons/react/24/outline";
import { Icon } from "@/shared/ui/Icon";
import { Typography } from "@/shared/ui/Typography";
import { CardWrapper } from "@/shared/ui/CardWrapper";
import { Stack } from "@/shared/ui/Stack";
import { SimpleGrid } from "@/shared/ui/Grid";
import { Button } from "@/shared/ui/Button";
import { Badge } from "@/shared/ui/Badge";

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
    <Stack gap="xl">
      <Stack direction={{ base: "column", sm: "row" }} justify="space-between" align={{ base: "stretch", sm: "center" }} gap="md">
        <Typography variant="heading" size="lg">Configuración Fiscal</Typography>
        <Button colorPalette="success" size="sm">
          <Icon icon={DocumentTextIcon} size="sm" />
          Generar Reporte Fiscal
        </Button>
      </Stack>

      <SimpleGrid columns={{ base: 1, lg: 2 }} gap="xl">
        {/* Tax Configuration */}
        <CardWrapper>
          <CardWrapper.Header>
            <Stack direction="row" align="center" gap="sm">
              <Icon icon={CurrencyDollarIcon} size="md" />
              <Typography variant="heading" size="md">Configuración de Impuestos</Typography>
            </Stack>
          </CardWrapper.Header>
          <CardWrapper.Body>
            <Stack gap="md">
            
            <Stack gap="md">
              <Stack direction="row" justify="space-between" align="center">
                <Typography variant="body" size="sm">Tipo de Impuesto Principal</Typography>
                <Badge colorPalette="info" size="lg">
                  {taxSettings.taxName} {taxSettings.mainTaxRate}%
                </Badge>
              </Stack>
              
              <Stack direction="row" justify="space-between" align="center">
                <Typography variant="body" size="sm">Número de Identificación Fiscal</Typography>
                <Typography variant="body" size="sm" fontWeight="medium">{taxSettings.taxNumber}</Typography>
              </Stack>

              <Stack direction="row" justify="space-between" align="center">
                <Typography variant="body" size="sm">Moneda Base</Typography>
                <Stack direction="row" align="center" gap="sm">
                  <Typography variant="body" size="sm" fontWeight="medium">{taxSettings.currency}</Typography>
                  <Badge colorPalette="gray">{taxSettings.currencySymbol}</Badge>
                </Stack>
              </Stack>

              <Stack direction="row" justify="space-between" align="center">
                <Stack gap="none">
                  <Typography variant="body" size="sm">Incluir Impuestos en Precios</Typography>
                  <Typography variant="body" size="xs" color="secondary">
                    Los precios mostrados incluyen impuestos
                  </Typography>
                </Stack>
                <Switch 
                  checked={taxSettings.includeTaxInPrices}
                  
                />
              </Stack>
            </Stack>
          </CardWrapper.Body>
        </CardWrapper>

        {/* Tax Categories */}
        <CardWrapper>
          <CardWrapper.Header>
            <Stack direction="row" align="center" gap="sm">
              <Icon icon={CalculatorIcon} size="md" />
              <Typography variant="heading" size="md">Categorías Fiscales</Typography>
            </Stack>
          </CardWrapper.Header>
          <CardWrapper.Body>
            <Stack gap="md">
            
            <Stack gap="sm">
              {taxCategories.map((category, index) => (
                <CardWrapper key={index} variant="subtle" size="sm" >
                  <Stack direction="row" justify="space-between" align="center">
                    <Stack gap="none">
                      <Typography variant="body" size="sm" fontWeight="medium">
                        {category.name}
                      </Typography>
                      <Typography variant="body" size="xs" color="secondary">
                        {category.items} productos
                      </Typography>
                    </Stack>
                    <Badge 
                      colorPalette={category.rate === 21 ? "error" : "success"}
                      size="sm"
                    >
                      {category.rate}%
                    </Badge>
                  </Stack>
                </CardWrapper>
              ))}
            </Stack>
          </Stack>
        </CardWrapper>
      </SimpleGrid>

      {/* Fiscal Compliance Status */}
      <CardWrapper>
        <Stack gap="md">
          <Stack direction="row" align="center" gap="sm">
            <Icon icon={ShieldCheckIcon} size="md" />
            <Typography variant="heading" size="md">Estado de Cumplimiento Fiscal</Typography>
          </Stack>
          
          <SimpleGrid columns={{ base: 2, md: 4 }} gap="md">
            <Stack align="center" gap="xs">
              <Typography variant="body" size="2xl" fontWeight="bold" >✓</Typography>
              <Typography variant="body" size="sm" color="secondary">Configuración IVA</Typography>
            </Stack>
            <Stack align="center" gap="xs">
              <Typography variant="body" size="2xl" fontWeight="bold" >✓</Typography>
              <Typography variant="body" size="sm" color="secondary">Número Fiscal</Typography>
            </Stack>
            <Stack align="center" gap="xs">
              <Typography variant="body" size="2xl" fontWeight="bold" >⚠</Typography>
              <Typography variant="body" size="sm" color="secondary">Reportes Pendientes</Typography>
            </Stack>
            <Stack align="center" gap="xs">
              <Typography variant="body" size="2xl" fontWeight="bold" >✓</Typography>
              <Typography variant="body" size="sm" color="secondary">Categorías</Typography