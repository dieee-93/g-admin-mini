import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Flex, Stack, Text, Button } from '@chakra-ui/react';
import { BusinessModelStep } from './steps/business-setup/business-model/BusinessModelStep';
import { DatabaseSetupStep } from './components/DatabaseSetupStep';
import { SupabaseConnectionStep } from './steps/infrastructure/supabase-connection';
import { WelcomeScreen } from './components/WelcomeScreen';
import { AdminUserCreationStep } from './steps/system-setup/admin-user-creation';
import { SystemVerification } from './components/SystemVerification';
import { BasicSystemConfig } from './components/BasicSystemConfig';
import { SetupSummary } from './components/SetupSummary';
import { SetupHeader } from './components/layout/SetupHeader';
import { SetupSidebar } from './components/layout/SetupSidebar';
import { SetupProgressBar } from './components/layout/SetupProgressBar';
import { useSetupState } from './hooks/useSetupState';
import { useSetupNavigation } from './hooks/useSetupNavigation';
import { useSetupHealth } from './hooks/useSetupHealth';
import { createSetupSteps } from './config/setupSteps';
import '../../styles/setup-animations.css';

export function SetupWizard() {
  // Connection state
  const [isConnecting] = useState(false);

  // Custom hooks
  const setupState = useSetupState();
  const systemHealth = useSetupHealth(
    setupState.userName,
    setupState.supabaseCredentials,
    setupState.adminUserData
  );
  const navigation = useSetupNavigation(
    setupState.currentGroup,
    setupState.currentSubStep,
    setupState.setCurrentGroup,
    setupState.setCurrentSubStep,
    setupState.saveProgress,
    setupState.supabaseCredentials,
    setupState.userName,
    setupState.adminUserData
  );

  // Create setup steps for UI
  const setupSteps = createSetupSteps(setupState.currentGroup);


  // Step components
  const getStepComponent = () => {
    const component = navigation.getCurrentComponent();
    console.log('🎯 Current component:', component, { currentGroup: setupState.currentGroup, currentSubStep: setupState.currentSubStep });
    
    switch (component) {
      case 'welcome':
        return <WelcomeScreen onComplete={(name: string) => {
          console.log('👋 Welcome screen completed with name:', name);
          setupState.setUserName(name);
          console.log('📝 Username saved, navigating...');
          navigation.nextSubStep();
        }} />;
      
      case 'admin-user':
        return <AdminUserCreationStep 
          onComplete={(userData) => {
            setupState.setAdminUserData(userData);
            navigation.nextSubStep();
          }}
          onBack={navigation.prevSubStep}
        />;
      
      case 'supabase':
        return <SupabaseConnectionStep 
          onConnectionSuccess={(url: string, anonKey: string) => {
            console.log('🎉 Supabase connection success callback triggered!', { url, anonKey: anonKey.substring(0, 20) + '...' });
            const credentials = { url, anonKey };
            setupState.setSupabaseCredentials(credentials);
            console.log('💾 Credentials saved, navigating to next step...');
            navigation.nextSubStep();
          }}
          isConnecting={isConnecting}
        />;
      
      case 'database':
        return <DatabaseSetupStep onNext={navigation.nextSubStep} />;
      
      case 'verification':
        return <SystemVerification 
          onNext={navigation.nextSubStep} 
          onBack={navigation.prevSubStep} 
          onSkip={navigation.skipCurrentStep}
        />;
      
      case 'business-model':
        return <BusinessModelStep 
          onComplete={navigation.nextSubStep}
          onBack={navigation.prevSubStep}
        />;
      
      case 'basic-config':
        return <BasicSystemConfig 
          onComplete={navigation.nextSubStep}
          onBack={navigation.prevSubStep}
          onSkip={navigation.skipCurrentStep}
        />;
      
      case 'summary':
        return <SetupSummary 
          userName={setupState.userName}
          adminUser={setupState.adminUserData}
          onComplete={navigation.nextSubStep}
          onBack={navigation.prevSubStep}
        />;
      
      case 'finish':
        return (
          <Box textAlign="center" p={8}>
            <Stack gap={6} align="center">
              <Text fontSize="3xl" color="gray.700">
                ¡Todo listo! 🎉
              </Text>
              <Text fontSize="md" color="gray.600">
                {setupState.userName ? `${setupState.userName}, tu negocio` : 'Tu negocio'} ha sido configurado exitosamente. Ya podés empezar a operar.
              </Text>
              <Button 
                size="lg"
                bg="gray.800"
                color="gray.50"
                _hover={{ bg: 'gray.900' }}
                onClick={() => window.location.href = '/admin'}
                className="setup-interactive"
              >
                Ir al Dashboard →
              </Button>
            </Stack>
          </Box>
        );
      default:
        return null;
    }
  };

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
            currentGroup={setupState.currentGroup}
            currentSubStep={setupState.currentSubStep}
            systemHealth={systemHealth}
            onStepClick={navigation.jumpToGroup}
            onFillTestData={setupState.fillTestData}
            onResetAll={setupState.resetState}
            onJumpToGroup={navigation.jumpToGroup}
            onJumpToSubStep={navigation.jumpToSubStep}
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
                progressPercentage={navigation.getProgressPercentage()}
                currentStep={setupState.currentGroup + 1}
                totalSteps={setupSteps.length}
              />

              {/* Current Step Content */}
              <Box>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${setupState.currentGroup}-${setupState.currentSubStep}`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ 
                      duration: 0.3,
                      ease: "easeInOut"
                    }}
                  >
                    {getStepComponent()}
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