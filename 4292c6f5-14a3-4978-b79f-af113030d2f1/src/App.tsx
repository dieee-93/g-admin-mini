import React, { Component } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  Stack,
  SimpleGrid,
  Icon,
  Badge,
  Flex } from
'@chakra-ui/react';
export function App() {
  return (
    <Box minH="100vh" bg="gray.50" position="relative" overflow="hidden">
      {/* Decorative background elements */}
      <Box
        position="absolute"
        top="-10%"
        right="-5%"
        width="500px"
        height="500px"
        borderRadius="full"
        bg="blue.50"
        opacity="0.4"
        filter="blur(80px)"
        pointerEvents="none" />

      <Box
        position="absolute"
        bottom="-10%"
        left="-5%"
        width="400px"
        height="400px"
        borderRadius="full"
        bg="purple.50"
        opacity="0.4"
        filter="blur(80px)"
        pointerEvents="none" />


      <Box
        position="relative"
        zIndex="1"
        p={{
          base: '6',
          md: '8'
        }}>

        <Stack gap="8" maxW="1400px" mx="auto">
          {/* Header con gradiente */}
          <Box>
            <Flex align="center" gap="3" mb="3">
              <Box
                bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                p="3"
                borderRadius="xl"
                boxShadow="lg">

                <Text fontSize="2xl">✨</Text>
              </Box>
              <Box>
                <Heading
                  as="h1"
                  fontSize={{
                    base: '3xl',
                    md: '4xl'
                  }}
                  bgGradient="linear(to-r, blue.600, purple.600)"
                  bgClip="text"
                  fontWeight="extrabold"
                  letterSpacing="tight">

                  Sistema de Diseño Empresarial
                </Heading>
                <Text color="gray.600" fontSize="lg" fontWeight="medium">
                  Componentes modernos y estandarizados 🚀
                </Text>
              </Box>
            </Flex>
          </Box>

          {/* Cards de métricas con gradientes */}
          <SimpleGrid
            columns={{
              base: 1,
              md: 2,
              lg: 4
            }}
            gap="6">

            <MetricCard
              icon="💰"
              label="Ventas Totales"
              value="$125,430"
              change="+12.5%"
              gradient="linear(to-br, blue.400, blue.600)"
              changeColor="green.500" />

            <MetricCard
              icon="👥"
              label="Clientes Activos"
              value="1,234"
              change="+8.2%"
              gradient="linear(to-br, purple.400, purple.600)"
              changeColor="green.500" />

            <MetricCard
              icon="📦"
              label="Pedidos"
              value="45"
              change="-3.1%"
              gradient="linear(to-br, pink.400, pink.600)"
              changeColor="red.500" />

            <MetricCard
              icon="⭐"
              label="Satisfacción"
              value="98.5%"
              change="+2.3%"
              gradient="linear(to-br, orange.400, orange.600)"
              changeColor="green.500" />

          </SimpleGrid>

          {/* Main content cards */}
          <SimpleGrid
            columns={{
              base: 1,
              lg: 2
            }}
            gap="6">

            {/* Welcome card con gradiente */}
            <Box
              bg="white"
              p="8"
              borderRadius="2xl"
              shadow="xl"
              borderWidth="1px"
              borderColor="gray.100"
              position="relative"
              overflow="hidden"
              transition="all 0.3s"
              _hover={{
                transform: 'translateY(-4px)',
                shadow: '2xl'
              }}>

              <Box
                position="absolute"
                top="0"
                left="0"
                right="0"
                height="4px"
                bgGradient="linear(to-r, blue.400, purple.500, pink.500)" />


              <Stack gap="4">
                <Flex align="center" gap="3">
                  <Box bg="blue.50" p="3" borderRadius="xl">
                    <Text fontSize="2xl">🎨</Text>
                  </Box>
                  <Heading as="h2" size="lg" color="gray.800">
                    Bienvenido al Sistema
                  </Heading>
                </Flex>

                <Text color="gray.600" fontSize="md" lineHeight="tall">
                  Un sistema de diseño completo con componentes reutilizables,
                  hooks personalizados y patrones consistentes para construir
                  aplicaciones empresariales modernas.
                </Text>

                <Stack direction="row" gap="3" pt="2">
                  <Button
                    colorScheme="blue"
                    size="lg"
                    borderRadius="xl"
                    boxShadow="md"
                    _hover={{
                      transform: 'translateY(-2px)',
                      boxShadow: 'lg'
                    }}
                    transition="all 0.2s">

                    Comenzar 🚀
                  </Button>
                  <Button
                    variant="outline"
                    colorScheme="gray"
                    size="lg"
                    borderRadius="xl"
                    _hover={{
                      bg: 'gray.50'
                    }}>

                    Documentación
                  </Button>
                </Stack>
              </Stack>
            </Box>

            {/* Features card */}
            <Box
              bg="white"
              p="8"
              borderRadius="2xl"
              shadow="xl"
              borderWidth="1px"
              borderColor="gray.100"
              position="relative"
              overflow="hidden"
              transition="all 0.3s"
              _hover={{
                transform: 'translateY(-4px)',
                shadow: '2xl'
              }}>

              <Box
                position="absolute"
                top="0"
                left="0"
                right="0"
                height="4px"
                bgGradient="linear(to-r, green.400, teal.500, cyan.500)" />


              <Stack gap="4">
                <Flex align="center" gap="3">
                  <Box bg="green.50" p="3" borderRadius="xl">
                    <Text fontSize="2xl">⚡</Text>
                  </Box>
                  <Heading as="h2" size="lg" color="gray.800">
                    Características
                  </Heading>
                </Flex>

                <Stack gap="3">
                  <FeatureItem
                    icon="✅"
                    text="20+ componentes listos para usar" />

                  <FeatureItem
                    icon="🎣"
                    text="Hooks personalizados (validación, modals)" />

                  <FeatureItem
                    icon="🎨"
                    text="Sistema de tokens estandarizado" />

                  <FeatureItem
                    icon="📱"
                    text="Diseño responsive mobile-first" />

                  <FeatureItem icon="♿" text="Accesibilidad WCAG AA" />
                  <FeatureItem icon="⚡" text="Optimizado para performance" />
                </Stack>
              </Stack>
            </Box>
          </SimpleGrid>

          {/* Stats banner */}
          <Box
            bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
            p="8"
            borderRadius="2xl"
            shadow="2xl"
            position="relative"
            overflow="hidden">

            <Box
              position="absolute"
              top="-20%"
              right="-10%"
              width="300px"
              height="300px"
              borderRadius="full"
              bg="whiteAlpha.200"
              filter="blur(60px)" />


            <SimpleGrid
              columns={{
                base: 1,
                md: 3
              }}
              gap="8"
              position="relative">

              <StatItem icon="🧩" value="20+" label="Componentes" />
              <StatItem icon="🎣" value="3" label="Hooks Personalizados" />
              <StatItem icon="✨" value="100%" label="TypeScript" />
            </SimpleGrid>
          </Box>

          {/* Component categories */}
          <SimpleGrid
            columns={{
              base: 1,
              md: 3
            }}
            gap="6">

            <CategoryCard
              icon="📝"
              title="Formularios"
              count={6}
              color="blue"
              items={[
              'InputField',
              'SelectField',
              'TextareaField',
              'FormSection']
              } />

            <CategoryCard
              icon="📊"
              title="Visualización"
              count={5}
              color="purple"
              items={['Table', 'Tabs', 'Accordion', 'MetricCard']} />

            <CategoryCard
              icon="🔔"
              title="Feedback"
              count={4}
              color="pink"
              items={['Alert', 'Modal', 'Toast', 'LoadingState']} />

          </SimpleGrid>
        </Stack>
      </Box>
    </Box>);

}
// Helper Components
function MetricCard({
  icon,
  label,
  value,
  change,
  gradient,
  changeColor







}: {icon: string;label: string;value: string;change: string;gradient: string;changeColor: string;}) {
  return (
    <Box
      bg="white"
      p="6"
      borderRadius="2xl"
      shadow="lg"
      borderWidth="1px"
      borderColor="gray.100"
      position="relative"
      overflow="hidden"
      transition="all 0.3s"
      _hover={{
        transform: 'translateY(-4px)',
        shadow: '2xl'
      }}>

      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        height="3px"
        bgGradient={gradient} />


      <Stack gap="3">
        <Flex justify="space-between" align="center">
          <Box bg="gray.50" p="2" borderRadius="lg" fontSize="xl">
            {icon}
          </Box>
          <Badge
            colorScheme={change.startsWith('+') ? 'green' : 'red'}
            fontSize="sm"
            px="2"
            py="1"
            borderRadius="lg"
            fontWeight="bold">

            {change}
          </Badge>
        </Flex>

        <Box>
          <Text fontSize="sm" color="gray.600" fontWeight="medium" mb="1">
            {label}
          </Text>
          <Heading size="2xl" color="gray.900" fontWeight="extrabold">
            {value}
          </Heading>
        </Box>
      </Stack>
    </Box>);

}
function FeatureItem({ icon, text }: {icon: string;text: string;}) {
  return (
    <Flex align="center" gap="3">
      <Box bg="green.50" p="2" borderRadius="lg" fontSize="lg">
        {icon}
      </Box>
      <Text color="gray.700" fontSize="md" fontWeight="medium">
        {text}
      </Text>
    </Flex>);

}
function StatItem({
  icon,
  value,
  label




}: {icon: string;value: string;label: string;}) {
  return (
    <Stack align="center" textAlign="center" gap="2">
      <Text fontSize="3xl">{icon}</Text>
      <Heading size="2xl" color="white" fontWeight="extrabold">
        {value}
      </Heading>
      <Text color="whiteAlpha.900" fontSize="md" fontWeight="medium">
        {label}
      </Text>
    </Stack>);

}
function CategoryCard({
  icon,
  title,
  count,
  color,
  items






}: {icon: string;title: string;count: number;color: string;items: string[];}) {
  return (
    <Box
      bg="white"
      p="6"
      borderRadius="2xl"
      shadow="lg"
      borderWidth="1px"
      borderColor="gray.100"
      transition="all 0.3s"
      _hover={{
        transform: 'translateY(-4px)',
        shadow: '2xl'
      }}>

      <Stack gap="4">
        <Flex align="center" justify="space-between">
          <Flex align="center" gap="3">
            <Box bg={`${color}.50`} p="3" borderRadius="xl" fontSize="2xl">
              {icon}
            </Box>
            <Box>
              <Heading size="md" color="gray.800">
                {title}
              </Heading>
              <Text fontSize="sm" color="gray.500" fontWeight="medium">
                {count} componentes
              </Text>
            </Box>
          </Flex>
        </Flex>

        <Stack gap="2">
          {items.map((item, index) =>
          <Flex key={index} align="center" gap="2">
              <Box w="2" h="2" bg={`${color}.400`} borderRadius="full" />
              <Text fontSize="sm" color="gray.600">
                {item}
              </Text>
            </Flex>
          )}
        </Stack>
      </Stack>
    </Box>);

}