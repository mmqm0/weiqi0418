import React from 'react';
import { VStack, Box, Heading, Text, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon } from '@chakra-ui/react';

const tutorials = [
  {
    title: '围棋基础规则',
    content: '围棋是在19×19的棋盘上进行的两人对弈游戏。黑白双方轮流在棋盘的交叉点上放置棋子...'
  },
  {
    title: '基本战术',
    content: '提子：当一个棋子或一组棋子被对方的棋子完全包围，没有气时就会被提走...'
  },
  {
    title: '常见定式',
    content: '定式是围棋中常见的固定下法。掌握基本定式可以提高对弈水平...'
  },
  {
    title: 'AI辅助学习方法',
    content: '利用AI分析功能，可以帮助我们发现对局中的关键点和可能的失误...'
  }
];

const Tutorials: React.FC = () => {
  return (
    <VStack spacing={6} align="stretch" w="100%" maxW="800px">
      <Heading size="xl">围棋教程</Heading>
      <Text>选择以下任一主题开始学习：</Text>
      
      <Accordion allowMultiple>
        {tutorials.map((tutorial, index) => (
          <AccordionItem key={index}>
            <h2>
              <AccordionButton>
                <Box flex="1" textAlign="left">
                  {tutorial.title}
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel pb={4}>
              {tutorial.content}
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </VStack>
  );
};

export default Tutorials;
