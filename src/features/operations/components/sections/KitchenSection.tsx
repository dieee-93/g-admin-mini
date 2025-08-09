// Kitchen Section - Wrapper for existing KitchenPage
import React from "react";
import { Box, Text, Alert, Button, HStack } from "@chakra-ui/react";
import { Icon } from "@/components/ui/Icon";
import { ArrowTopRightOnSquareIcon } from "@heroicons/react/24/outline";

export function KitchenSection() {
  return (
    <Box>
      <Alert.Root status="info" mb={4}>
        <Alert.Indicator />
        <Box>
          <Alert.Title>Vista de Cocina Integrada</Alert.Title>
          <Alert.Description>
            La funcionalidad completa de cocina se está integrando. 
            Mientras tanto, usa el enlace directo.
          </Alert.Description>
        </Box>
      </Alert.Root>

      <HStack justify="center" p={8}>
        <Button 
          as="a" 
          href="/production/kitchen" 
          target="_blank"
          colorPalette="blue"
          size="lg"
        >
          <Icon icon={ArrowTopRightOnSquareIcon} size="sm" />
          Abrir Vista de Cocina Completa
        </Button>
      </HStack>

      {/* TODO: Integrar KitchenPage completa aquí */}
      <Text fontSize="sm" color="gray.500" textAlign="center" mt={4}>
        Próximamente: Vista integrada completa de cocina en este espacio
      </Text>
    </Box>
  );
}
