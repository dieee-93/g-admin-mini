import React from 'react';
import { motion } from 'framer-motion';
import {
  Box,
  Stack,
  Flex,
  Text,
  Separator,
} from '@chakra-ui/react';
import { Icon } from '@/shared/ui';
import {
  CheckIcon,
  InformationCircleIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';
import { useSetupStore } from '../../../store/setupStore';
import { type SetupStep } from '../config/setupSteps'; 
import { DeveloperControls } from '../dev/DeveloperControls';

interface SetupSidebarProps {
  setupSteps: SetupStep[];
  currentGroup: number;
  currentSubStep: number;
  onStepClick: (stepIndex: number) => void;
  onFillTestData: () => void;
  onResetAll: () => void;
  onJumpToGroup: (groupIndex: number) => void;
  onJumpToSubStep: (subStepIndex: number) => void;
}

export function SetupSidebar({
  setupSteps,
  currentGroup,
  currentSubStep,
  onStepClick,
  onFillTestData,
  onResetAll,
  onJumpToGroup,
  onJumpToSubStep,
}: SetupSidebarProps) {
  const { supabaseCredentials, adminUserData } = useSetupStore();

  const systemHealth = {
    isSupabaseConnected: !!supabaseCredentials,
    isAdminUserCreated: !!adminUserData,
  };

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Box
        w={{
          base: '60px',
          md: '240px',
        }}
        bg="gray.50"
        borderRightWidth="1px"
        borderColor="gray.200"
        py="6"
        px={{
          base: 2,
          md: 4,
        }}
        display={{
          base: 'none',
          sm: 'block',
        }}
        position="fixed"
        height="calc(100vh - 64px)"
        overflowY="auto"
      >
        <Stack gap="2">
          <Text
            fontSize="xs"
            fontWeight="medium"
            color="gray.500"
            px="2"
            mb="1"
            display={{
              base: 'none',
              md: 'block',
            }}
          >
            CONFIGURACIÓN INICIAL
          </Text>
          
          {setupSteps.map((step, idx) => (
            <Flex
              key={step.id}
              py="2"
              px="3"
              borderRadius="md"
              alignItems="center"
              bg={step.current ? 'gray.100' : 'transparent'}
              color={
                step.current
                  ? 'gray.700'
                  : step.disabled
                    ? 'gray.400'
                    : 'gray.600'
              }
              fontWeight={step.current ? 'medium' : 'normal'}
              opacity={step.disabled ? 0.6 : 1}
              cursor={step.disabled ? 'not-allowed' : 'pointer'}
              _hover={
                !step.disabled
                  ? {
                      bg: step.current ? 'gray.100' : 'gray.100',
                    }
                  : {}
              }
              onClick={() => !step.disabled && onStepClick(idx)}
            >
              <Box
                w="20px"
                h="20px"
                borderRadius="full"
                bg={
                  step.completed
                    ? 'gray.700'
                    : step.current
                      ? 'gray.600'
                      : 'gray.200'
                }
                color="gray.50"
                display="flex"
                alignItems="center"
                justifyContent="center"
                fontSize="xs"
                mr="3"
              >
                {step.completed ? <Icon icon={CheckIcon} size="xs" /> : idx + 1}
              </Box>
              <Text
                fontSize="sm"
                display={{
                  base: 'none',
                  md: 'block',
                }}
              >
                {step.title}
              </Text>
            </Flex>
          ))}
          
          <Separator
            my="4"
            display={{
              base: 'none',
              md: 'block',
            }}
          />
          
          <Text
            fontSize="xs"
            fontWeight="medium"
            color="gray.500"
            px="2"
            mb="1"
            display={{
              base: 'none',
              md: 'block',
            }}
          >
            RECURSOS
          </Text>
          
          <Flex
            py="2"
            px="3"
            borderRadius="md"
            alignItems="center"
            _hover={{
              bg: 'gray.100',
            }}
            cursor="pointer"
          >
            <Icon icon={InformationCircleIcon} size="md" style={{ marginRight: '12px' }} />
            <Text
              fontSize="sm"
              display={{
                base: 'none',
                md: 'block',
              }}
            >
              Centro de ayuda
            </Text>
          </Flex>
          
          <Flex
            py="2"
            px="3"
            borderRadius="md"
            alignItems="center"
            _hover={{
              bg: 'gray.100',
            }}
            cursor="pointer"
          >
            <Icon icon={Cog6ToothIcon} size="md" style={{ marginRight: '12px' }} />
            <Text
              fontSize="sm"
              display={{
                base: 'none',
                md: 'block',
              }}
            >
              Configuración
            </Text>
          </Flex>

          {/* Developer Controls */}
          <DeveloperControls
            currentGroup={currentGroup}
            currentSubStep={currentSubStep}
            systemHealth={systemHealth}
            onFillTestData={onFillTestData}
            onResetAll={onResetAll}
            onJumpToGroup={onJumpToGroup}
            onJumpToSubStep={onJumpToSubStep}
          />
        </Stack>
      </Box>
    </motion.div>
  );
}