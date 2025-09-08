import React, { useState } from 'react';
import {
  Grid,
  GridItem,
  Box,
  Stack,
  Heading,
  Text,
  Button,
  Flex,
} from '@chakra-ui/react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { BusinessPreviewPanel } from './components/BusinessPreviewPanel';
import { useBusinessCapabilities } from './hooks/useBusinessCapabilities';
import { BusinessModelData } from './config/businessCapabilities';
import { CapabilitiesStep } from './components/CapabilitiesStep';
import { StepProfile } from './components/StepProfile';

interface BusinessModelStepProps {
  onComplete: (data: BusinessModelData) => void;
  onBack: () => void;
}

export function BusinessModelStep({
  onComplete,
  onBack,
}: BusinessModelStepProps) {
  const businessModel = useBusinessCapabilities();
  const [selectedCompetencies, setSelectedCompetencies] = useState({
    products: false,
    services: false,
    events: false,
    recurrence: false,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      onBack();
    }
  };

  const handleCompetencyChange = (competency: keyof typeof selectedCompetencies) => {
    const isSelected = !selectedCompetencies[competency];
    setSelectedCompetencies(prev => ({ ...prev, [competency]: isSelected }));

    const competencyToCapabilityMap: Record<keyof typeof selectedCompetencies, keyof import('./config/businessCapabilities').BusinessCapabilities> = {
      products: 'sells_products',
      services: 'sells_services',
      events: 'manages_events',
      recurrence: 'manages_recurrence',
    };

    const mainCapability = competencyToCapabilityMap[competency];

    if (businessModel.capabilities[mainCapability] !== isSelected) {
      businessModel.toggleMainCapability(mainCapability);
    }
  };

  const handleSubmit = () => {
    if (!businessModel.canSubmit) {
      console.log('❌ Cannot submit - validation failed');
      return;
    }
    
    const finalData = businessModel.getBusinessModelData();
    onComplete(finalData);
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CapabilitiesStep
            businessModel={businessModel}
            selectedCompetencies={selectedCompetencies}
            handleCompetencyChange={handleCompetencyChange}
          />
        );
      case 2:
        return <StepProfile businessModel={businessModel} />;
      default:
        return null;
    }
  };

  return (
    <Grid
      templateColumns={{
        base: '1fr',
        lg: '3fr 1.2fr',
      }}
      gap={{
        base: 6,
        lg: 8,
      }}
      width="100%"
    >
      {/* LEFT COLUMN: INTERACTIVE CONFIGURATION */}
      <GridItem>
        <Box bg="gray.50" borderRadius="xl" boxShadow="md" overflow="hidden">
          {/* Header Section */}
          <Box
            p={6}
            borderBottom="1px solid"
            borderColor="gray.100"
          >
            <Stack gap={1}>
              <Heading size="md" fontWeight="semibold">
                Modelo de Negocio
              </Heading>
              <Text color="gray.600" fontSize="sm">
                Paso {currentStep} de {totalSteps}: Define las capacidades de tu negocio.
              </Text>
            </Stack>
          </Box>

          {/* Main Form Section */}
          <Box p={6}>
            <Stack gap={8}>
              {renderStep()}
            </Stack>
          </Box>

          {/* Footer with Navigation */}
          <Box
            p={6}
            borderTop="1px solid"
            borderColor="gray.100"
          >
            <Flex justify="space-between" align="center">
              <Button
                variant="outline"
                onClick={handleBack}
                leftIcon={<ChevronUpIcon width={16} height={16}/>}
              >
                {currentStep === 1 ? 'Volver al Wizard' : 'Volver'}
              </Button>
              <Button
                bg={businessModel.canSubmit ? 'gray.800' : 'gray.400'}
                color="white"
                _hover={{
                  bg: businessModel.canSubmit ? 'gray.900' : 'gray.400',
                }}
                onClick={handleNext}
                disabled={!businessModel.canSubmit}
                cursor={businessModel.canSubmit ? 'pointer' : 'not-allowed'}
                rightIcon={<ChevronDownIcon width={16} height={16} />}
              >
                {currentStep === totalSteps ? 'Finalizar y Guardar' : 'Continuar'}
              </Button>
            </Flex>
          </Box>
        </Box>
      </GridItem>

      {/* RIGHT COLUMN: PREVIEW & INSIGHTS */}
      <GridItem>
        <BusinessPreviewPanel
          archetypes={businessModel.archetypes}
          operationalProfile={businessModel.operationalProfile}
          insightMessage={businessModel.insightMessage}
          completedMilestones={[]}
        />
      </GridItem>
    </Grid>
  );
}