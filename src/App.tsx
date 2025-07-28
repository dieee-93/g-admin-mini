import { Box, Heading, Text } from "@chakra-ui/react";
import { Toaster } from "./components/ui/toaster";

function App() {
  return (
    <Box p={4}>
      <Toaster />
      <Heading size="lg">G-Mini</Heading>
      <Text mt={2}>Control simple de stock y recetas</Text>
    </Box>
  );
}

export default App;
