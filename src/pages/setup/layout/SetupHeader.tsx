import React from 'react';
import { motion } from 'framer-motion';
import {
  Flex,
  HStack,
  VStack,
  Text,
  Box,
  Avatar,
  Menu,
  IconButton,
  Portal,
  Separator,
} from '@chakra-ui/react';
import {
  CheckIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  Cog6ToothIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline';
import { SetupStep } from '../config/setupSteps';

interface SetupHeaderProps {
  setupSteps: SetupStep[];
}

export function SetupHeader({ setupSteps }: SetupHeaderProps) {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.1 }}
    >
      <Flex
        as="header"
        position="fixed"
        w="full"
        bg="gray.50"
        borderBottomWidth="1px"
        borderColor="gray.200"
        py="2"
        px="4"
        alignItems="center"
        justifyContent="space-between"
        zIndex={10}
      >
        {/* Logo and App Name */}
        <HStack gap="3">
          <Box
            bg="gray.800"
            color="gray.50"
            fontSize="xl"
            fontWeight="bold"
            p="2"
            borderRadius="md"
            width="40px"
            height="40px"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            G
          </Box>
          <Text fontWeight="bold" fontSize="lg" color="gray.700">
            G-Admin Setup
          </Text>
        </HStack>

        {/* Center - Progress */}
        <HStack
          gap="4"
          display={{
            base: 'none',
            md: 'flex',
          }}
        >
          {setupSteps.map((step, idx) => {
            return (
              <HStack key={step.id} gap="1">
                <Box
                  w="24px"
                  h="24px"
                  borderRadius="full"
                  bg={
                    step.completed
                      ? 'gray.700'
                      : step.current
                        ? 'gray.600'
                        : 'gray.200'
                  }
                  color={step.completed || step.current ? 'gray.50' : 'gray.500'}
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="xs"
                  position="relative"
                >
                  {step.completed ? <CheckIcon width={14} height={14} /> : idx + 1}
                </Box>
                <VStack gap="0" align="start">
                  <Text
                    fontSize="sm"
                    fontWeight={step.current ? 'medium' : 'normal'}
                    color={
                      step.current
                        ? 'gray.700'
                        : step.completed
                          ? 'gray.600'
                          : 'gray.500'
                    }
                    display={{
                      base: 'none',
                      md: 'block',
                    }}
                  >
                    {step.title}
                  </Text>
                </VStack>
              </HStack>
            );
          })}
        </HStack>

        {/* User Menu */}
        <Menu.Root>
          <Menu.Trigger asChild>
            <IconButton
              variant="ghost"
              aria-label="User menu"
              _hover={{
                bg: 'transparent',
              }}
            >
              <Avatar.Root size="sm" bg="gray.700">
                <Avatar.Fallback>
                  <UserIcon width={18} height={18} />
                </Avatar.Fallback>
              </Avatar.Root>
            </IconButton>
          </Menu.Trigger>
          <Portal>
            <Menu.Positioner>
              <Menu.Content>
                <Menu.Item value="profile">
                  <HStack>
                    <UserIcon width={16} height={16} />
                    <Text>Perfil</Text>
                  </HStack>
                </Menu.Item>
                <Menu.Item value="settings">
                  <HStack>
                    <Cog6ToothIcon width={16} height={16} />
                    <Text>Configuración</Text>
                  </HStack>
                </Menu.Item>
                <Menu.Item value="help">
                  <HStack>
                    <InformationCircleIcon width={16} height={16} />
                    <Text>Ayuda</Text>
                  </HStack>
                </Menu.Item>
                <Separator />
                <Menu.Item value="logout">
                  <HStack>
                    <ArrowRightOnRectangleIcon width={16} height={16} />
                    <Text>Cerrar sesión</Text>
                  </HStack>
                </Menu.Item>
              </Menu.Content>
            </Menu.Positioner>
          </Portal>
        </Menu.Root>
      </Flex>
    </motion.div>
  );
}