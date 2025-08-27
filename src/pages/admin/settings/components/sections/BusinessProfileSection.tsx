// Business Profile Section - Company info, location, hours
import React from "react";
import {
  Stack, Typography, CardWrapper, Button, Badge, Grid
} from "@/shared/ui";
import { 
  BuildingOfficeIcon, 
  PencilIcon,
  ClockIcon,
  MapPinIcon
} from "@heroicons/react/24/outline";
import { Icon, HeaderIcon } from "@/shared/ui/Icon";

export function BusinessProfileSection() {
  const businessData = {
    name: "Panadería El Buen Pan",
    type: "Panadería",
    address: "Calle Mayor 123, Madrid, España",
    phone: "+34 91 123 4567",
    email: "info@elbuenpan.com",
    website: "www.elbuenpan.com"
  };

  const operatingHours = [
    { day: "Lunes", hours: "06:00 - 20:00", isOpen: true },
    { day: "Martes", hours: "06:00 - 20:00", isOpen: true },
    { day: "Miércoles", hours: "06:00 - 20:00", isOpen: true },
    { day: "Jueves", hours: "06:00 - 20:00", isOpen: true },
    { day: "Viernes", hours: "06:00 - 20:00", isOpen: true },
    { day: "Sábado", hours: "07:00 - 15:00", isOpen: true },
    { day: "Domingo", hours: "Cerrado", isOpen: false }
  ];

  return (
    <CardWrapper variant="elevated" >
      <CardWrapper>
        <Stack direction="row" justify="space-between" align="center">
          <Stack direction="row" align="center" gap="sm">
            <HeaderIcon icon={BuildingOfficeIcon}  />
            <Typography variant="heading" level={3}>Perfil Empresarial</Typography>
          </Stack>
          <Button  size="sm">
            <Icon icon={PencilIcon} size="sm" />
            Editar Información
          </Button>
        </Stack>
      </CardWrapper>
      <CardWrapper>
        <Grid columns={{ base: 1, md: 2 }} gap="lg">
          {/* Business Information */}
          <CardWrapper variant="outline" >
            <CardWrapper>
              <Stack direction="row" align="center" gap="sm">
                <HeaderIcon icon={BuildingOfficeIcon}  />
                <Typography variant="heading" level={4}>Información del Negocio</Typography>
              </Stack>
            </CardWrapper>
            <CardWrapper>
              <Stack direction="column" gap="md">
                <div>
                  <Typography variant="caption" color="secondary">Nombre del Negocio</Typography>
                  <Typography variant="body" weight="bold">{businessData.name}</Typography>
                </div>
                
                <div>
                  <Typography variant="caption" color="secondary">Tipo de Negocio</Typography>
                  <Badge variant="subtle" colorPalette="brand">{businessData.type}</Badge>
                </div>
                
                <div>
                  <Typography variant="caption" color="secondary">Dirección</Typography>
                  <Stack direction="row" align="center" gap="sm">
                    <Icon icon={MapPinIcon} size="sm" color="text.muted" />
                    <Typography variant="body">{businessData.address}</Typography>
                  </Stack>
                </div>
                
                <Grid templateColumns="repeat(2, 1fr)" gap="md">
                  <div>
                    <Typography variant="caption" color="secondary">Teléfono</Typography>
                    <Typography variant="body">{businessData.phone}</Typography>
                  </div>
                  <div>
                    <Typography variant="caption" color="secondary">Email</Typography>
                    <Typography variant="body">{businessData.email}</Typography>
                  </div>
                </Grid>
                
                <div>
                  <Typography variant="caption" color="secondary">Sitio Web</Typography>
                  <Typography variant="body" color="accent">{businessData.website}</Typography>
                </div>
              </Stack>
            </CardWrapper>
          </CardWrapper>

          {/* Operating Hours */}
          <CardWrapper variant="outline" >
            <CardWrapper>
              <Stack direction="row" align="center" gap="sm">
                <HeaderIcon icon={ClockIcon}  />
                <Typography variant="heading" level={4}>Horarios de Operación</Typography>
              </Stack>
            </CardWrapper>
            <CardWrapper>
              <Stack direction="column" gap="sm">
                {operatingHours.map((schedule) => (
                  <Stack key={schedule.day} direction="row" justify="space-between" align="center">
                    <Typography variant="body" weight="medium">{schedule.day}</Typography>
                    <Stack direction="row" align="center" gap="sm">
                      <Typography 
                        variant="caption" 
                        color={schedule.isOpen ? "primary" : "muted"}
                      >
                        {schedule.hours}
                      </Typography>
                      <Badge 
                        variant="subtle" 
                        colorPalette={schedule.isOpen ? "success" : "gray"}
                        size="sm"
                      >
                        {schedule.isOpen ? "Abierto" : "Cerrado"}
                      </Badge>
                    </Stack>
                  </Stack>
                ))}
              </Stack>
            </CardWrapper>
          </CardWrapper>
        </Grid>
      </CardWrapper>
    </CardWrapper>
  );
}
