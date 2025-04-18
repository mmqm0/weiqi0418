export const config = {
  port: process.env.PORT || 3000,
  deepseekApiKey: process.env.DEEPSEEK_API_KEY || 'sk-a35cc92f8fc64fa1a113493507d515ad',
  corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3001', 'https://weiqi0418.vercel.app']
};
