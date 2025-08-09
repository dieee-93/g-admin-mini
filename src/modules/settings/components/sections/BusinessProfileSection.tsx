// Business Profile Section - Company info, location, hours
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
  Input,
  Select,
} from "@chakra-ui/react";
import { 
  BuildingOfficeIcon, 
  PencilIcon,
  ClockIcon,
  MapPinIcon
} from "@heroicons/react/24/outline";
import { Icon } from "@/shared/ui/Icon";

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
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading size="md">Perfil Empresarial</Heading>
        <Button colorPalette="blue" size="sm">
          <Icon icon={PencilIcon} size="sm" />
          Editar Información
        </Button>
      </HStack>

      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={6}>
        {/* Business Information */}
        <Card.Root>
          <Card.Header>
            <HStack gap={2}>
              <Icon icon={BuildingOfficeIcon} size="md" />
              <Heading size="sm">Información del Negocio</Heading>
            </HStack>
          </Card.Header>
          <Card.Body>
            <VStack gap={4} align="stretch">
              <Box>
                <Text fontSize="sm" color="gray.600" mb={1}>Nombre del Negocio</Text>
                <Text fontWeight="bold">{businessData.name}</Text>
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.600" mb={1}>Tipo de Negocio</Text>
                <Badge colorPalette="blue">{businessData.type}</Badge>
              </Box>
              <Box>
                <Text fontSize="sm" color="gray.600" mb={1}>Dirección</Text>
                <HStack gap={2}>
                  <Icon icon={MapPinIcon} size="sm" />
                  <Text>{businessData.address}</Text>
                </HStack>
              </Box>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1}>Teléfono</Text>
                  <Text>{businessData.phone}</Text>
                </Box>
                <Box>
                  <Text fontSize="sm" color="gray.600" mb={1}>Email</Text>
                  <Text>{businessData.email}</Text>
                </Box>
              </Grid>
              <Box>
                <Text fontSize="sm" color="gray.600" mb={1}>Sitio Web</Text>
                <Text color="blue.500">{businessData.website}</Text>
              </Box>
            </VStack>
          </Card.Body>
        </Card.Root>

        {/* Operating Hours */}
        <Card.Root>
          <Card.Header>
            <HStack gap={2}>
              <Icon icon={ClockIcon} size="md" />
              <Heading size="sm">Horarios de Operación</Heading>
            </HStack>
          </Card.Header>
          <Card.Body>
            <VStack gap={3} align="stretch">
              {operatingHours.map((schedule) => (
                <HStack key={schedule.day} justify="space-between">
                  <Text fontSize="sm" fontWeight="medium">
                    {schedule.day}
                  </Text>
                  <Badge 
                    colorPalette={schedule.isOpen ? "green" : "gray"}
                    size="sm"
                  >
                    {schedule.hours}
                  </Badge>
                </HStack>
              ))}
            </VStack>
          </Card.Body>
        </Card.Root>
      </Grid>
    </Box>
  );
}
