// Tables Section - Wrapper for existing TableManagementPage
import React from "react";
import { Box, Text, Alert, Button, HStack } from "@chakra-ui/react";
import { Icon } from "@/components/ui/Icon";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

export function TablesSection() {
  return (
    <Box>
      <Alert.Root status="info" mb={4}>
        <Alert.Indicator />
        <Box>
          <Alert.Title>Gestión de Mesas Integrada</Alert.Title>
          <Alert.Description>
            La funcionalidad completa de gestión de mesas se está integrando. 
            Mientras tanto, usa el enlace directo.
          </Alert.Description>
        </Box>
      </Alert.Root>

      <HStack justify="center" p={8}>
        <Button 
          as="a" 
          href="/sales/tables" 
          target="_blank"
          colorPalette="blue"
          size="lg"
        >
          <Icon icon={ArrowTopRightOnSquareIcon} size="sm" />
          Abrir Gestión de Mesas Completa
        </Button>
      </HStack>

      {/* TODO: Integrar TableManagementPage completa aquí */}
      <Text fontSize="sm" color="gray.500" textAlign="center" mt={4}>
        Próximamente: Vista integrada completa de gestión de mesas en este espacio
      </Text>
    </Box>
  );
}
