// require('dotenv').config();
// const TelegramBot = require('node-telegram-bot-api');
// const express = require('express');
// const axios = require('axios');

// // Load config
// const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
// const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
// const PORT = process.env.PORT || 3000;
// const WEBHOOK_URL = 'https://deepseekapitelegrambot.onrender.com'; // 👈 Change this later!

// // Initialize bot (disable polling)
// const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: false });

// // Initialize Express server
// const app = express();
// app.use(express.json()); // Parse JSON requests

// // ===== (1) Set up Webhook =====
// async function setupWebhook() {
//   try {
//     await bot.setWebHook(`${WEBHOOK_URL}/bot${TELEGRAM_TOKEN}`);
//     console.log('✅ Webhook set successfully:', `${WEBHOOK_URL}/bot${TELEGRAM_TOKEN}`);
//   } catch (error) {
//     console.error('❌ Failed to set webhook:', error.message);
//   }
// }

// // ===== (2) Handle Telegram Messages =====
// app.post(`/bot${TELEGRAM_TOKEN}`, (req, res) => {
//   bot.processUpdate(req.body); // Let the bot handle the update
//   res.sendStatus(200); // Respond to Telegram
// });

// //Handle /start command
// bot.onText(/\/start/, (msg) => {
//   const chatId = msg.chat.id;
//   bot.sendMessage(chatId, "🤖 **Hello! I'm created by Rayu power by DeepSeek as an AI assistant for you.\nVisit my website: https://rayuchoeng-profolio-website.netlify.app/\n\n**I may respond slowly as I’m currently rendering on a small server. Thank you for your understanding—I truly appreciate your patience.");
// });

// // ===== (3) Bot Message Handling =====
// bot.on('message', async (msg) => {
//   const chatId = msg.chat.id;
//   const text = msg.text;

//   if (!text || text.startsWith('/')) return bot.sendMessage(chatId, 'Sorry I can not respond to commands or non-text messages.');

  

//   try {
//     await bot.sendChatAction(chatId, 'typing');
//     const response = await callDeepSeek(chatId, [{ role: 'user', content: text }]);
//     bot.sendMessage(chatId, response);
//   } catch (error) {
//     bot.sendMessage(chatId, '❌ Error: ' + error.message);
//   }
// });

// // ===== (4) Start Server =====
// app.listen(PORT, '0.0.0.0', async () => {  // 👈 Bind to '0.0.0.0' (required for Render)
//   console.log(`🚀 Bot server running on port ${PORT}`);
//   await setupWebhook();
// });

// // ===== DeepSeek API Call =====
// async function callDeepSeek(chatId, messages) {
//   try {
//     const response = await axios.post(
//       'https://api.deepseek.com/v1/chat/completions',
//       {
//         model: 'deepseek-chat',
//         messages,
//         temperature: 0.7,
//       },
//       {
//         headers: {
//           'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
//           'Content-Type': 'application/json',
//         },
//       }
//     );
//     return response.data.choices[0].message.content;
//   } catch (error) {
//     console.error('DeepSeek API Error:', error.response?.data || error.message);
//     throw new Error('Failed to get AI response.');
//   }
// }
// bot.getMe().then((me)=>{
//   console.log(`Bot ${me.username} is running`);
// });

// require('dotenv').config();
// const TelegramBot = require('node-telegram-bot-api');
// const axios = require('axios');
// const { streamDeepSeekResponse } = require('./stream');



// async function testAPIs() {
//     try {
//       await axios.get(`https://api.telegram.org/bot${telegramToken}/getMe`);
//       console.log("Telegram connection OK");
      
//       await axios.post(deepseekApiUrl, 
//         { model: "deepseek-chat", messages: [{role:"user",content:"test"}] },
//         { headers: { Authorization: `Bearer ${deepseekApiKey}` } }
//       );
//       console.log("DeepSeek connection OK");
//     } catch (e) {
//       console.error("API test failed:", e.response?.data || e.message);
//       process.exit(1);
//     }
//   }
//   testAPIs();


// // Load environment variables
// const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
// const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
// const deepseekApiUrl = 'https://api.deepseek.com/chat/completions';

// // Validate environment variables
// if (!telegramToken || !deepseekApiKey) {
//   console.error('Error: TELEGRAM_BOT_TOKEN and DEEPSEEK_API_KEY must be set in .env');
//   process.exit(1);
// }

// // Initialize Telegram bot with polling
// const bot = new TelegramBot(telegramToken, { polling: true });

// // Store conversation history and settings
// const conversations = new Map();

// // Helper function for DeepSeek API call with retries
// async function callDeepSeek(chatId, messages, model = 'deepseek-chat', retries = 3) {
//   for (let i = 0; i < retries; i++) {
//     try {
//       const response = await axios.post(
//         deepseekApiUrl,
//         {
//           model,
//           messages,
//           max_tokens: 1000,
//           temperature: 0.7,
//           stream: false,
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${deepseekApiKey}`,
//             'Content-Type': 'application/json',
//           },
//         }
//       );
//       return response.data.choices[0].message.content;
//     } catch (error) {
//       if (error.response?.status === 429 && i < retries - 1) {
//         console.warn(`Rate limit hit, retrying in ${2 ** i} seconds...`);
//         await new Promise((resolve) => setTimeout(resolve, 2 ** i * 1000));
//         continue;
//       }
//       console.error('DeepSeek API error:', error.response ? error.response.data : error.message);
//       throw new Error('Failed to fetch response from DeepSeek.');
//     }
//   }
// }

// // Handle /start command
// bot.onText(/\/start/, (msg) => {
//   const chatId = msg.chat.id;
//   bot.sendMessage(
//     chatId,
//     'Welcome to your DeepSeek-powered bot! Ask me anything.\nCommands:\n/start - Start the bot\n/help - Show commands\n/model <chat|coder|reasoner> - Set model\n/stream - Enable streaming\n/stop - Disable streaming'
//   );
// });

// // Handle /help command
// bot.onText(/\/help/, (msg) => {
//   const chatId = msg.chat.id;
//   bot.sendMessage(
//     chatId,
//     'Commands:\n/start - Start the bot\n/help - Show this help\n/model <chat|coder|reasoner> - Set DeepSeek model\n/stream - Enable streaming responses\n/stop - Disable streaming'
//   );
// });

// // Handle /model command
// bot.onText(/\/model (.+)/, (msg, match) => {
//   const chatId = msg.chat.id;
//   const model = match[1].toLowerCase();
//   const validModels = ['chat', 'coder', 'reasoner'];
//   if (!validModels.includes(model)) {
//     return bot.sendMessage(chatId, 'Invalid model. Use: /model chat, /model coder, or /model reasoner');
//   }
//   conversations.set(chatId, { ...conversations.get(chatId), model: `deepseek-${model}` });
//   bot.sendMessage(chatId, `Model set to deepseek-${model}`);
// });

// // Handle /stream command
// bot.onText(/\/stream/, (msg) => {
//   const chatId = msg.chat.id;
//   bot.sendMessage(chatId, 'Streaming mode enabled. Send a message to get a streamed response. Use /stop to disable.');
//   conversations.set(chatId, { ...conversations.get(chatId), streaming: true });
// });

// // Handle /stop command
// bot.onText(/\/stop/, (msg) => {
//   const chatId = msg.chat.id;
//   bot.sendMessage(chatId, 'Streaming mode disabled.');
//   conversations.set(chatId, { ...conversations.get(chatId), streaming: false });
// });

// // Handle text messages
// bot.on('message', async (msg) => {
//   const chatId = msg.chat.id;
//   const text = msg.text;

//   // Ignore commands
//   if (text.startsWith('/')) return;

//   // Initialize conversation history
//   if (!conversations.has(chatId)) {
//     conversations.set(chatId, { history: [], model: 'deepseek-chat', streaming: false });
//   }
//   const { history, model, streaming } = conversations.get(chatId);

//   // Add user message to history
//   history.push({ role: 'user', content: text });

//   try {
//     await bot.sendChatAction(chatId, 'typing');

//     const systemPrompt = { role: 'system', content: 'You are a helpful AI assistant.' };
//     const messages = [systemPrompt, ...history.slice(-10)];

//     if (streaming) {
//       // Stream response
//       await streamDeepSeekResponse(chatId, bot, messages, model);
//     } else {
//       // Non-streaming response
//       const response = await callDeepSeek(chatId, messages, model);
//       history.push({ role: 'assistant', content: response });
//       await bot.sendMessage(chatId, response);
//     }

//     // Clean up history
//     if (history.length > 20) {
//       history.splice(0, history.length - 10);
//     }
//   } catch (error) {
//     console.error("Full error:", error);
//     console.error("Response data:", error.response?.data);
//     await bot.sendMessage(chatId, `Error: ${error.message}`);
//   }
// });

// // Handle polling errors
// bot.on('polling_error', (error) => {
//   console.error('Polling error:', error);
// });

// console.log('Bot is running...');


const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const axios = require('axios');

// Load config from environment variables
const TELEGRAM_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const PORT = process.env.PORT || 3000;
const WEBHOOK_URL = process.env.WEBHOOK_URL || 'https://deepseekapitelegrambot.onrender.com';

// Initialize bot (disable polling since we're using webhooks)
const bot = new TelegramBot(TELEGRAM_TOKEN, { polling: false });

// Initialize Express server
const app = express();
app.use(express.json()); // Parse JSON requests

// ===== Set up Webhook =====
async function setupWebhook() {
  try {
    await bot.setWebHook(`${WEBHOOK_URL}/bot${TELEGRAM_TOKEN}`);
    console.log('✅ Webhook set successfully:', `${WEBHOOK_URL}/bot${TELEGRAM_TOKEN}`);
  } catch (error) {
    console.error('❌ Failed to set webhook:', error.message);
  }
}

// ===== Handle Telegram Updates =====
app.post(`/bot${TELEGRAM_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body); // Process incoming updates
  res.sendStatus(200); // Acknowledge Telegram
});

// Handle /start command
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(chatId, "🤖 **Hello! I'm created by Rayu powered by DeepSeek as an AI assistant for you.\nVisit my website: https://rayuchoeng-profolio-website.netlify.app/\n\n**I may respond slowly as I’m currently rendering on a small server. Thank you for your understanding—I truly appreciate your patience.");
});

// ===== Handle Incoming Messages =====
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Ignore commands or empty messages
  if (!text || text.startsWith('/')) {
    return bot.sendMessage(chatId, 'Sorry, I cannot respond to commands or non-text messages.');
  }

  try {
    await bot.sendChatAction(chatId, 'typing'); // Show typing indicator
    const response = await callDeepSeek(chatId, [{ role: 'user', content: text }]);
    bot.sendMessage(chatId, response);
  } catch (error) {
    bot.sendMessage(chatId, '❌ Error: ' + error.message);
  }
});

// ===== Start Server =====
app.listen(PORT, '0.0.0.0', async () => { // Bind to '0.0.0.0' for Render compatibility
  console.log(`🚀 Bot server running on port ${PORT}`);
  await setupWebhook();
});

// ===== DeepSeek API Integration =====
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

// Log bot status
bot.getMe().then((me) => {
  console.log(`Bot ${me.username} is running`);
});