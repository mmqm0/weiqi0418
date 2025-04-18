import React from 'react';
import { Box, Flex, Button, Heading } from '@chakra-ui/react';
import { Link as RouterLink } from 'react-router-dom';

const Navbar: React.FC = () => {
  return (
    <Box bg="teal.500" px={4} color="white">
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <Heading size="md">AI围棋学习平台</Heading>
        <Flex alignItems="center" gap={4}>
          <Button as={RouterLink} to="/" variant="ghost" colorScheme="whiteAlpha">
            对弈
          </Button>
          <Button as={RouterLink} to="/analysis" variant="ghost" colorScheme="whiteAlpha">
            AI分析
          </Button>
          <Button as={RouterLink} to="/tutorials" variant="ghost" colorScheme="whiteAlpha">
            教程
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Navbar;
