import React from 'react';
import { VStack, Box } from '@chakra-ui/react';
import { Section } from '@/shared/ui';
import { useSupabaseConnection } from './hooks/useSupabaseConnection';
import { InstructionsSection } from './components/InstructionsSection';
import { CredentialsForm } from './components/CredentialsForm';
import { ErrorDisplay } from './components/ErrorDisplay';
import { ActionButtons } from './components/ActionButtons';
import { WhatHappensNext } from './components/WhatHappensNext';
import { SUPABASE_CONNECTION_CONFIG } from './config/constants';

import { logger } from '@/lib/logging';
interface SupabaseConnectionStepProps {
  onConnectionSuccess: (url: string, anonKey: string) => void;
  isConnecting: boolean;
}

export function SupabaseConnectionStep({ 
  onConnectionSuccess, 
  isConnecting 
}: SupabaseConnectionStepProps) {
  const connection = useSupabaseConnection({
    onConnectionSuccess,
    isConnecting
  });

  const handleDebugSkip = () => {
    logger.debug('App', '🚀 Debug: Skipping Supabase setup');
    onConnectionSuccess('https://debug.supabase.co', 'debug-key-' + Date.now());
  };

  return (
    <Box w="full" p="4">
      <VStack 
        gap="lg" 
        align="stretch"
        opacity={isConnecting ? 0.7 : 1}
        transform={isConnecting ? "scale(0.98)" : "scale(1)"}
        transition="all 0.3s ease"
      >
        <Section 
          variant="elevated" 
          title={SUPABASE_CONNECTION_CONFIG.TEXTS.title}
          subtitle={SUPABASE_CONNECTION_CONFIG.TEXTS.subtitle}
        >
          <VStack gap="lg" align="stretch">
            {/* Instructions */}
            <InstructionsSection />

            {/* Credentials Form */}
            <CredentialsForm
              supabaseUrl={connection.supabaseUrl}
              supabaseAnonKey={connection.supabaseAnonKey}
              onUrlChange={connection.setSupabaseUrl}
              onKeyChange={connection.setSupabaseAnonKey}
              isConnecting={connection.isConnecting}
            />

            {/* Error Display */}
            <ErrorDisplay error={connection.error} />

            {/* Action Buttons */}
            <ActionButtons
              canConnect={connection.canConnect}
              isConnecting={connection.isConnecting}
              onConnect={connection.handleConnect}
              onUseDemo={connection.handleUseDemo}
              onDebugSkip={handleDebugSkip}
            />
          </VStack>
        </Section>

        {/* What Happens Next */}
        <WhatHappensNext />
      </VStack>
    </Box>
  );
}