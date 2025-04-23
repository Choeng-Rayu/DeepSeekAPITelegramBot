require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const { streamDeepSeekResponse } = require('./stream');

// Load environment variables
const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
const deepseekApiUrl = 'https://api.deepseek.com/chat/completions';

// Validate environment variables
if (!telegramToken || !deepseekApiKey) {
  console.error('Error: TELEGRAM_BOT_TOKEN and DEEPSEEK_API_KEY must be set in .env');
  process.exit(1);
}

// Initialize Telegram bot with polling
const bot = new TelegramBot(telegramToken, { polling: true });

// Store conversation history and settings
const conversations = new Map();

// Helper function for DeepSeek API call with retries
async function callDeepSeek(chatId, messages, model = 'deepseek-chat', retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.post(
        deepseekApiUrl,
        {
          model,
          messages,
          max_tokens: 1000,
          temperature: 0.7,
          stream: false,
        },
        {
          headers: {
            Authorization: `Bearer ${deepseekApiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data.choices[0].message.content;
    } catch (error) {
      if (error.response?.status === 429 && i < retries - 1) {
        console.warn(`Rate limit hit, retrying in ${2 ** i} seconds...`);
        await new Promise((resolve) => setTimeout(resolve, 2 ** i * 1000));
        continue;
      }
      console.error('DeepSeek API error:', error.response ? error.response.data : error.message);
      throw new Error('Failed to fetch response from DeepSeek.');
    }
  }
}

// Handle /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    'Welcome to your DeepSeek-powered bot! Ask me anything.\nCommands:\n/start - Start the bot\n/help - Show commands\n/model <chat|coder|reasoner> - Set model\n/stream - Enable streaming\n/stop - Disable streaming'
  );
});

// Handle /help command
bot.onText(/\/help/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    'Commands:\n/start - Start the bot\n/help - Show this help\n/model <chat|coder|reasoner> - Set DeepSeek model\n/stream - Enable streaming responses\n/stop - Disable streaming'
  );
});

// Handle /model command
bot.onText(/\/model (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const model = match[1].toLowerCase();
  const validModels = ['chat', 'coder', 'reasoner'];
  if (!validModels.includes(model)) {
    return bot.sendMessage(chatId, 'Invalid model. Use: /model chat, /model coder, or /model reasoner');
  }
  conversations.set(chatId, { ...conversations.get(chatId), model: `deepseek-${model}` });
  bot.sendMessage(chatId, `Model set to deepseek-${model}`);
});

// Handle /stream command
bot.onText(/\/stream/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Streaming mode enabled. Send a message to get a streamed response. Use /stop to disable.');
  conversations.set(chatId, { ...conversations.get(chatId), streaming: true });
});

// Handle /stop command
bot.onText(/\/stop/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, 'Streaming mode disabled.');
  conversations.set(chatId, { ...conversations.get(chatId), streaming: false });
});

// Handle text messages
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Ignore commands
  if (text.startsWith('/')) return;

  // Initialize conversation history
  if (!conversations.has(chatId)) {
    conversations.set(chatId, { history: [], model: 'deepseek-chat', streaming: false });
  }
  const { history, model, streaming } = conversations.get(chatId);

  // Add user message to history
  history.push({ role: 'user', content: text });

  try {
    await bot.sendChatAction(chatId, 'typing');

    const systemPrompt = { role: 'system', content: 'You are a helpful AI assistant.' };
    const messages = [systemPrompt, ...history.slice(-10)];

    if (streaming) {
      // Stream response
      await streamDeepSeekResponse(chatId, bot, messages, model);
    } else {
      // Non-streaming response
      const response = await callDeepSeek(chatId, messages, model);
      history.push({ role: 'assistant', content: response });
      await bot.sendMessage(chatId, response);
    }

    // Clean up history
    if (history.length > 20) {
      history.splice(0, history.length - 10);
    }
  } catch (error) {
    await bot.sendMessage(chatId, 'Sorry, something went wrong. Try again later!');
  }
});

// Handle polling errors
bot.on('polling_error', (error) => {
  console.error('Polling error:', error);
});

console.log('Bot is running...');