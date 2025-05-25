require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const axios = require('axios');

// Load config
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const PORT = process.env.PORT || 3000;
const WEBHOOK_URL = 'https://deepseekapitelegrambot.onrender.com'; // 👈 Change this later!

// Initialize bot (disable polling)
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: false });

// Initialize Express server
const app = express();
app.use(express.json()); // Parse JSON requests

// ===== (1) Set up Webhook =====
async function setupWebhook() {
  try {
    await bot.setWebHook(`${WEBHOOK_URL}/bot${TELEGRAM_TOKEN}`);
    console.log('✅ Webhook set successfully:', `${WEBHOOK_URL}/bot${TELEGRAM_TOKEN}`);
  } catch (error) {
    console.error('❌ Failed to set webhook:', error.message);
  }
}

// ===== (2) Handle Telegram Messages =====
app.post(`/bot${TELEGRAM_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body); // Let the bot handle the update
  res.sendStatus(200); // Respond to Telegram
});

//Handle /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "🤖 **Hello! I'm created by Rayu power by DeepSeek as an AI assistant for you.\nVisit my website: https://rayuchoeng-profolio-website.netlify.app/\n\n**I may respond slowly as I’m currently rendering on a small server. Thank you for your understanding—I truly appreciate your patience.");
});

// ===== (3) Bot Message Handling =====
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  if (!text || text.startsWith('/')) return bot.sendMessage(chatId, 'Sorry I can not respond to commands or non-text messages.');

  

  try {
    await bot.sendChatAction(chatId, 'typing');
    const response = await callDeepSeek(chatId, [{ role: 'user', content: text }]);
    bot.sendMessage(chatId, response);
  } catch (error) {
    bot.sendMessage(chatId, '❌ Error: ' + error.message);
  }
});

// ===== (4) Start Server =====
app.listen(PORT, '0.0.0.0', async () => {  // 👈 Bind to '0.0.0.0' (required for Render)
  console.log(`🚀 Bot server running on port ${PORT}`);
  await setupWebhook();
});

// ===== DeepSeek API Call =====
async function callDeepSeek(chatId, messages) {
  try {
    const response = await axios.post(
      'https://api.deepseek.com/v1/chat/completions',
      {
        model: 'deepseek-chat',
        messages,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('DeepSeek API Error:', error.response?.data || error.message);
    throw new Error('Failed to get AI response.');
  }
}
bot.getMe().then((me)=>{
  console.log(`Bot ${me.username} is running`);
});
