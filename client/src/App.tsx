import React from 'react';
import { ChakraProvider, Box, VStack } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import GoBoard from './components/GoBoard';
import AIAnalysis from './components/AIAnalysis';
import Tutorials from './components/Tutorials';

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Box minH="100vh">
          <Navbar />
          <VStack spacing={8} p={8}>
            <Routes>
              <Route path="/" element={<GoBoard />} />
              <Route path="/analysis" element={<AIAnalysis />} />
              <Route path="/tutorials" element={<Tutorials />} />
            </Routes>
          </VStack>
        </Box>
      </Router>
    </ChakraProvider>
  );
}

export default App;
