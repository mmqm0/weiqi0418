import React from 'react';
import { Box, VStack, Text, Button, Textarea } from '@chakra-ui/react';

const AIAnalysis: React.FC = () => {
  const [analysis, setAnalysis] = React.useState('');

  const requestAnalysis = async () => {
    // TODO: 集成实际的AI分析API
    setAnalysis('正在分析当前局面...');
  };

  return (
    <VStack spacing={4} align="stretch" w="100%" maxW="800px">
      <Text fontSize="2xl">AI局面分析</Text>
      <Box>
        <Button colorScheme="teal" onClick={requestAnalysis}>
          请求AI分析
        </Button>
      </Box>
      <Textarea
        value={analysis}
        readOnly
        placeholder="AI分析结果将显示在这里"
        size="lg"
        minH="200px"
      />
    </VStack>
  );
};

export default AIAnalysis;
