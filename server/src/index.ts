import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// 配置Deepseek API
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';

// AI分析端点
app.post('/api/analyze', async (req, res) => {
  try {
    const { board, currentMove, currentPlayer } = req.body;

    // 构建棋局描述
    const moveDescription = `${currentMove.color === 'black' ? '黑棋' : '白棋'}在${currentMove.x + 1}路${currentMove.y + 1}列落子`;

    const response = await axios.post(DEEPSEEK_API_URL, {
      model: "deepseek-chat",
      messages: [
        {
          role: "system",
          content: `你是一位专业的围棋解说员，要用生动、形象的语言解说棋局。每次解说要包含：
1. 当前落子的分析
2. 这手棋的战略意图
3. 对局势的影响
请用简洁、生动的语言，描述不要超过100字。`
        },
        {
          role: "user",
          content: `${moveDescription}。棋盘状态：${JSON.stringify(board)}。请分析这手棋的意图和影响。`
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({ analysis: response.data.choices[0].message.content });
  } catch (error) {
    console.error('AI分析错误:', error);
    res.status(500).json({ error: '分析请求失败' });
  }
});

// 教程内容端点
app.get('/api/tutorials', (req, res) => {
  // 这里可以从数据库获取教程内容
  const tutorials = [
    {
      id: 1,
      title: '围棋基础规则',
      content: '详细的围棋规则说明...'
    },
    // 更多教程...
  ];
  
  res.json(tutorials);
});

app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
});
