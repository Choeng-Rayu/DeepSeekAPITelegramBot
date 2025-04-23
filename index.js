require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');

// Load API keys
const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
const deepseekApiUrl = 'https://api.deepseek.com/v1/chat/completions';

// Initialize Telegram bot
const bot = new TelegramBot(telegramToken, { polling: true });

// Store conversation history
const conversations = new Map();

// Call DeepSeek API
async function callDeepSeek(chatId, messages, model = 'deepseek-chat') {
    try {
        const response = await axios.post(
            deepseekApiUrl,
            {
                model,
                messages,
                temperature: 0.7,
                max_tokens: 1000,
            },
            {
                headers: {
                    'Authorization': `Bearer ${deepseekApiKey}`,
                    'Content-Type': 'application/json',
                },
            }
        );
        return response.data.choices[0].message.content;
    } catch (error) {
        console.error("DeepSeek API Error:", error.response?.data || error.message);
        throw new Error("Failed to get response from DeepSeek.");
    }
}

// Handle /start command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, "🤖 **Hello! I'm made by Rayu and I'm an AI assistant.**\n\nSend me a message, and I'll respond!");
});

// Handle text messages
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    // Ignore commands and non-text messages
    if (!text || text.startsWith('/')) return;

    // Initialize conversation history if new chat
    if (!conversations.has(chatId)) {
        conversations.set(chatId, { history: [] });
    }
    const { history } = conversations.get(chatId);

    // Add user message to history
    history.push({ role: 'user', content: text });

    try {
        await bot.sendChatAction(chatId, 'typing'); // Show "typing..." status

        // Call DeepSeek API
        const response = await callDeepSeek(chatId, history);
        
        // Add AI response to history and send to user
        history.push({ role: 'assistant', content: response });
        bot.sendMessage(chatId, response);

        // Limit history to avoid excessive tokens
        if (history.length > 10) history.shift();
    } catch (error) {
        console.error("Error:", error);
        bot.sendMessage(chatId, "❌ Sorry, something went wrong. Please try again later.");
    }
});

console.log("🤖 Bot is running...");