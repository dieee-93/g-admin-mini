import React from 'react';
import { Box, Flex } from '@chakra-ui/react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
interface LayoutProps {
  children: React.ReactNode;
}
export const Layout: React.FC<LayoutProps> = ({
  children
}) => {
  return <Flex width="100%" height="100vh">
      <Sidebar />
      <Box flex="1" overflowY="auto">
        <Header />
        <Box p={4} overflowY="auto">
          {children}
        </Box>
      </Box>
    </Flex>;
};