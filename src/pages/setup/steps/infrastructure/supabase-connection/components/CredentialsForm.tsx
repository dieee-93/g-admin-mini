import React from 'react';
import { VStack, Box, Code } from '@chakra-ui/react';
import { FormSection, InputField } from '@/shared/ui';
import { SUPABASE_CONNECTION_CONFIG } from '../config/constants';

interface CredentialsFormProps {
  supabaseUrl: string;
  supabaseAnonKey: string;
  onUrlChange: (value: string) => void;
  onKeyChange: (value: string) => void;
  isConnecting: boolean;
}

export function CredentialsForm({
  supabaseUrl,
  supabaseAnonKey,
  onUrlChange,
  onKeyChange,
  isConnecting
}: CredentialsFormProps) {
  const { form } = SUPABASE_CONNECTION_CONFIG.TEXTS;

  return (
    <FormSection title={form.title}>
      <VStack gap="lg" align="stretch">
        <Box
          opacity={isConnecting ? 0.6 : 1}
          transform={isConnecting ? 'translateY(2px)' : 'translateY(0)'}
          transition="all 0.2s ease"
        >
          <InputField
            label={form.urlLabel}
            placeholder={form.urlPlaceholder}
            value={supabaseUrl}
            onChange={(e) => onUrlChange(e.target.value)}
            disabled={isConnecting}
            helperText={<>
              Ejemplo: <Code fontSize="xs" bg="gray.100" px={1} py={0.5} borderRadius="sm">{form.urlExample}</Code>
            </>}
          />
        </Box>

        <Box
          opacity={isConnecting ? 0.6 : 1}
          transform={isConnecting ? 'translateY(2px)' : 'translateY(0)'}
          transition="all 0.2s ease 0.1s"
        >
          <InputField
            label={form.keyLabel}
            type="password"
            placeholder={form.keyPlaceholder}
            value={supabaseAnonKey}
            onChange={(e) => onKeyChange(e.target.value)}
            disabled={isConnecting}
            helperText={form.keyHelperText}
          />
        </Box>
      </VStack>
    </FormSection>
  );
}