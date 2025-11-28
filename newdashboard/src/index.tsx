import React from 'react';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { render } from 'react-dom';
import { App } from './App';
import './index.css';
const theme = extendTheme({
  styles: {
    global: {
      body: {
        bg: '#0a1929',
        color: 'white'
      }
    }
  },
  fonts: {
    body: 'Inter, system-ui, sans-serif',
    heading: 'Inter, system-ui, sans-serif'
  },
  colors: {
    brand: {
      50: '#e3f2fd',
      100: '#bbdefb',
      200: '#90caf9',
      300: '#64b5f6',
      400: '#42a5f5',
      500: '#2196f3',
      600: '#1e88e5',
      700: '#1976d2',
      800: '#1565c0',
      900: '#0d47a1'
    }
  }
});
render(<ChakraProvider theme={theme}>
    <App />
  </ChakraProvider>, document.getElementById('root'));