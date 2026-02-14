import React, { useState } from 'react';
import {
  Box,
  Container,
  Center,
} from '@/shared/ui';
import { LoginForm } from './LoginForm';
import { RegisterForm } from './RegisterForm';
import { ResetPasswordForm } from './ResetPasswordForm';

type AuthMode = 'login' | 'register' | 'reset';

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');

  const renderAuthForm = () => {
    switch (mode) {
      case 'register':
        return (
          <RegisterForm
            onSwitchToLogin={() => setMode('login')}
          />
        );
      case 'reset':
        return (
          <ResetPasswordForm
            onSwitchToLogin={() => setMode('login')}
          />
        );
      default:
        return (
          <LoginForm
            onSwitchToRegister={() => setMode('register')}
            onSwitchToReset={() => setMode('reset')}
          />
        );
    }
  };

  return (
    <Box
      minH="100vh"
      bg="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
      py="8"
    >
      <Container maxW="lg">
        <Center>
          <Box w="full">
            {renderAuthForm()}
          </Box>
        </Center>
      </Container>
    </Box>
  );
}