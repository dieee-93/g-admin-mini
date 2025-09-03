import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Flex, Alert, AlertIcon, AlertTitle, AlertDescription, CloseButton, useToast } from '@chakra-ui/react';
import { SetupHeader } from './layout/SetupHeader';
import { SetupSidebar } from './layout/SetupSidebar';
import { SetupProgressBar } from './layout/SetupProgressBar';
import { useSetupStore } from '../../store/setupStore';
import { createSetupSteps, STEP_GROUPS } from './config/setupSteps';
import { STEP_COMPONENTS } from './config/stepComponents';
import '../../styles/setup-animations.css';

export function SetupWizard() {
  const {
    currentGroup,
    currentSubStep,
    userName,
    adminUserData,
    error,
    setError,
    setUserName,
    setAdminUserData,
    setSupabaseCredentials,
    nextStep,
    prevStep,
    jumpToStep,
    reset,
    fillWithTestData
  } = useSetupStore();

  const toast = useToast();

  useEffect(() => {
    if (error) {
      toast({
        title: "Acción no permitida",
        description: error,
        status: "warning",
        duration: 5000,
        isClosable: true,
        onCloseComplete: () => setError(null),
      });
    }
  }, [error, toast, setError]);

  // Connection state
  const [isConnecting] = useState(false);

  // Memoize setup steps UI data
  const setupSteps = React.useMemo(() => createSetupSteps(currentGroup), [currentGroup]);

  const handleStepComplete = (componentId: string, data: any) => {
    switch (componentId) {
      case 'welcome':
        setUserName(data as string);
        break;
      case 'admin-user':
        setAdminUserData(data as any); // Replace 'any' with the actual type
        break;
      case 'supabase-connection':
        setSupabaseCredentials(data as { url: string; anonKey: string });
        break;
      default:
        console.warn(`No action defined for componentId: ${componentId}`);
    }
    nextStep();
  };

  // Derive current component from state and render it
  const renderStepComponent = () => {
    const group = STEP_GROUPS[currentGroup];
    const componentId = group?.subSteps[currentSubStep]?.component || 'welcome';
    const Component = STEP_COMPONENTS[componentId];

    if (!Component) {
      return <Box>Error: Componente no encontrado</Box>;
    }

    const props = {
      onStepComplete: (data: any) => handleStepComplete(componentId, data),
      onNext: nextStep,
      onBack: prevStep,
      onSkip: nextStep,
      isConnecting,
      userName,
      adminUser: adminUserData,
    };

    return <Component {...props} />;
  };
  const progressPercentage = (currentGroup / (STEP_GROUPS.length -1)) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Box minH="100vh" bg="gray.50">
        {/* Header */}
        <SetupHeader setupSteps={setupSteps} />

        {/* Main Content with Sidebar */}
        <Flex pt="64px" height="calc(100vh - 64px)">
          {/* Sidebar */}
          <SetupSidebar
            setupSteps={setupSteps}
            currentGroup={currentGroup}
            currentSubStep={currentSubStep}
            onStepClick={(group, subStep) => jumpToStep(group, subStep)}
            onFillTestData={fillWithTestData}
            onResetAll={reset}
            onJumpToGroup={(group) => jumpToStep(group)}
            onJumpToSubStep={(subStep) => jumpToStep(currentGroup, subStep)}
          />

          {/* Main Content Area */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            style={{ flex: 1 }}
          >
            <Box
              flex="1"
              ml={{
                base: 0,
                sm: '60px',
                md: '240px',
              }}
              p={{
                base: 4,
                md: 6,
              }}
              overflowY="auto"
            >
              {/* Mobile Progress Bar */}
              <SetupProgressBar
                progressPercentage={progressPercentage}
                currentStep={currentGroup + 1}
                totalSteps={setupSteps.length}
              />

              {/* Current Step Content */}
              <Box>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${currentGroup}-${currentSubStep}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{
                      duration: 0.3,
                      ease: "easeInOut"
                    }}
                  >
                    {renderStepComponent()}
                  </motion.div>
                </AnimatePresence>
              </Box>
            </Box>
          </motion.div>
        </Flex>
      </Box>
    </motion.div>
  );
}

export default SetupWizard;