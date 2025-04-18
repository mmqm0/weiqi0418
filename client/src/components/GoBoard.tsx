import React, { useState, useEffect, useRef } from 'react';
import { Box, Button, HStack, Text, useToast, VStack, Flex, IconButton } from '@chakra-ui/react';
import axios from 'axios';

interface Stone {
  x: number;
  y: number;
  color: 'black' | 'white';
}

interface Position {
  x: number;
  y: number;
}

const BOARD_SIZE = 19;
const CELL_SIZE = 30;

const GoBoard: React.FC = () => {
  // 获取某个位置的棋子
  const getStone = (x: number, y: number): Stone | undefined => {
    return stones.find(stone => stone.x === x && stone.y === y);
  };

  // 获取某个位置的气
  const getLiberties = (x: number, y: number, checkedPositions: Set<string> = new Set()): number => {
    const key = `${x},${y}`;
    if (checkedPositions.has(key)) return 0;
    checkedPositions.add(key);

    const stone = getStone(x, y);
    if (!stone) return 0;

    const directions = [
      { x: -1, y: 0 }, // 左
      { x: 1, y: 0 },  // 右
      { x: 0, y: -1 }, // 上
      { x: 0, y: 1 }   // 下
    ];

    let liberties = 0;
    for (const dir of directions) {
      const newX = x + dir.x;
      const newY = y + dir.y;

      // 检查是否超出棋盘
      if (newX < 0 || newX >= BOARD_SIZE || newY < 0 || newY >= BOARD_SIZE) continue;

      const neighborStone = getStone(newX, newY);
      if (!neighborStone) {
        // 空位就是一口气
        liberties++;
      } else if (neighborStone.color === stone.color) {
        // 同色棋子，递归检查其气
        liberties += getLiberties(newX, newY, checkedPositions);
      }
    }

    return liberties;
  };

  // 获取一组相连的同色棋子
  const getGroup = (x: number, y: number, color: string, group: Position[] = [], checked: Set<string> = new Set()): Position[] => {
    const key = `${x},${y}`;
    if (checked.has(key)) return group;
    checked.add(key);

    const stone = getStone(x, y);
    if (!stone || stone.color !== color) return group;

    group.push({ x, y });

    const directions = [
      { x: -1, y: 0 },
      { x: 1, y: 0 },
      { x: 0, y: -1 },
      { x: 0, y: 1 }
    ];

    for (const dir of directions) {
      const newX = x + dir.x;
      const newY = y + dir.y;

      if (newX < 0 || newX >= BOARD_SIZE || newY < 0 || newY >= BOARD_SIZE) continue;

      getGroup(newX, newY, color, group, checked);
    }

    return group;
  };

  // 检查并提取死子
  const removeDeadStones = (color: 'black' | 'white'): Stone[] => {
    const deadStones: Position[] = [];
    const checked = new Set<string>();

    // 检查所有对方棋子
    stones
      .filter(stone => stone.color !== color)
      .forEach(stone => {
        const key = `${stone.x},${stone.y}`;
        if (!checked.has(key)) {
          const group = getGroup(stone.x, stone.y, stone.color);
          let hasLiberty = false;

          // 检查整个群的气
          for (const pos of group) {
            if (getLiberties(pos.x, pos.y) > 0) {
              hasLiberty = true;
              break;
            }
          }

          if (!hasLiberty) {
            deadStones.push(...group);
          }

          // 标记已检查的位置
          group.forEach(pos => checked.add(`${pos.x},${pos.y}`));
        }
      });

    // 移除死子
    if (deadStones.length > 0) {
      setStones(stones.filter(stone =>
        !deadStones.some(dead => dead.x === stone.x && dead.y === stone.y)
      ));
    }

    return stones;
  };

  const [stones, setStones] = useState<Stone[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<'black' | 'white'>('black');
  const [commentary, setCommentary] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);
  const toast = useToast();

  useEffect(() => {
    drawBoard();
  }, [stones]);

  const drawBoard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw board background
    ctx.fillStyle = '#DEB887';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw grid lines
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;

    for (let i = 0; i < BOARD_SIZE; i++) {
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo((i + 1) * CELL_SIZE, CELL_SIZE);
      ctx.lineTo((i + 1) * CELL_SIZE, CELL_SIZE * BOARD_SIZE);
      ctx.stroke();

      // Horizontal lines
      ctx.beginPath();
      ctx.moveTo(CELL_SIZE, (i + 1) * CELL_SIZE);
      ctx.lineTo(CELL_SIZE * BOARD_SIZE, (i + 1) * CELL_SIZE);
      ctx.stroke();
    }

    // Draw stones
    stones.forEach(stone => {
      ctx.beginPath();
      ctx.fillStyle = stone.color;
      ctx.arc(
        (stone.x + 1) * CELL_SIZE,
        (stone.y + 1) * CELL_SIZE,
        CELL_SIZE / 2 - 2,
        0,
        2 * Math.PI
      );
      ctx.fill();
    });
  };

  const getAICommentary = async (moveData: { x: number; y: number; color: string }) => {
    try {
      const response = await axios.post('http://localhost:3000/api/analyze', {
        board: stones,
        currentMove: moveData,
        currentPlayer
      });
      setCommentary(response.data.analysis);
      playCommentary(response.data.analysis);
    } catch (error) {
      console.error('获取AI解说失败:', error);
      toast({
        title: "获取解说失败",
        status: "error",
        duration: 2000,
      });
    }
  };

  const playCommentary = (text: string) => {
    if ('speechSynthesis' in window) {
      // 停止之前的语音
      if (speechSynthesisRef.current) {
        window.speechSynthesis.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      speechSynthesisRef.current = utterance;

      if (isPlaying) {
        window.speechSynthesis.speak(utterance);
      }
    }
  };

  const toggleSpeech = () => {
    setIsPlaying(!isPlaying);
    if (!isPlaying && commentary && speechSynthesisRef.current) {
      window.speechSynthesis.speak(speechSynthesisRef.current);
    } else {
      window.speechSynthesis.cancel();
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = Math.round((event.clientX - rect.left - CELL_SIZE) / CELL_SIZE);
    const y = Math.round((event.clientY - rect.top - CELL_SIZE) / CELL_SIZE);

    if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) return;

    // Check if position is already occupied
    if (stones.some(stone => stone.x === x && stone.y === y)) {
      toast({
        title: "Invalid move",
        description: "This position is already occupied",
        status: "error",
        duration: 2000,
      });
      return;
    }

    const newStone = { x, y, color: currentPlayer };
    const newStones = [...stones, newStone];
    setStones(newStones);

    // 先放置新子，然后检查提子
    setTimeout(() => {
      removeDeadStones(currentPlayer);
      setCurrentPlayer(currentPlayer === 'black' ? 'white' : 'black');
      getAICommentary(newStone);
    }, 100);
  };

  const resetGame = () => {
    setStones([]);
    setCurrentPlayer('black');
  };

  return (
    <Flex>
      <VStack spacing={4}>
        <Text fontSize="xl">当前玩家: {currentPlayer}</Text>
        <Box border="2px solid" borderColor="gray.300" borderRadius="md">
        <canvas
          ref={canvasRef}
          width={CELL_SIZE * (BOARD_SIZE + 1)}
          height={CELL_SIZE * (BOARD_SIZE + 1)}
          onClick={handleClick}
          style={{ cursor: 'pointer' }}
        />
        </Box>
        <HStack mt={4}>
          <Button colorScheme="red" onClick={resetGame}>重新开始</Button>
        </HStack>
      </VStack>

      <VStack ml={8} align="stretch" w="300px">
        <Text fontSize="xl">AI实时解说</Text>
        <Box
          border="1px solid"
          borderColor="gray.200"
          borderRadius="md"
          p={4}
          minH="200px"
          bg="gray.50"
        >
          {commentary || '等待落子...'}
        </Box>
        <HStack>
          <IconButton
            aria-label="播放语音"
            icon={isPlaying ? '🔊' : '🔈'}
            onClick={toggleSpeech}
            colorScheme={isPlaying ? 'green' : 'gray'}
          />
          <Text fontSize="sm">{isPlaying ? '点击停止语音' : '点击播放语音'}</Text>
        </HStack>
      </VStack>
    </Flex>
  );
};

export default GoBoard;
