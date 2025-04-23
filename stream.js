const https = require('https');
require('dotenv').config();

const deepseekApiKey = process.env.DEEPSEEK_API_KEY;
const deepseekApiUrl = 'api.deepseek.com';

async function streamDeepSeekResponse(chatId, bot, messages, model = 'deepseek-chat') {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      model,
      messages,
      max_tokens: 1000,
      temperature: 0.7,
      stream: true,
    });

    const options = {
      hostname: deepseekApiUrl,
      path: '/chat/completions',
      method: 'POST',
      headers: {
        Authorization: `Bearer ${deepseekApiKey}`,
        'Content-Type': 'application/json',
        'Content-Length': data.length,
      },
    };

    let message = '';
    let sentMessageId = null;

    const req = https.request(options, (res) => {
      res.on('data', (chunk) => {
        const lines = chunk.toString().split('\n').filter((line) => line.startsWith('data: '));
        for (const line of lines) {
          if (line === 'data: [DONE]') {
            if (message) {
              if (!sentMessageId) {
                bot.sendMessage(chatId, message).then((sentMsg) => {
                  resolve(sentMsg.message_id);
                });
              } else {
                bot.editMessageText(message, { chat_id: chatId, message_id: sentMessageId }).then(() => {
                  resolve(sentMessageId);
                });
              }
            }
            return;
          }
          try {
            const parsed = JSON.parse(line.replace('data: ', ''));
            const content = parsed.choices[0].delta.content || '';
            message += content;

            // Update message every 500ms to avoid Telegram rate limits
            if (message.length > 0 && !sentMessageId) {
              bot.sendMessage(chatId, message).then((sentMsg) => {
                sentMessageId = sentMsg.message_id;
              });
            } else if (sentMessageId && message.length > 0) {
              setTimeout(() => {
                bot.editMessageText(message, { chat_id: chatId, message_id: sentMessageId }).catch(() => {});
              }, 500);
            }
          } catch (e) {
            console.error('Stream parse error:', e);
          }
        }
      });

      res.on('end', () => {
        if (!message) resolve(null);
      });
    });

    req.on('error', (e) => {
      console.error('Stream error:', e);
      reject(new Error('Failed to stream response from DeepSeek.'));
    });

    req.write(data);
    req.end();
  });
}

module.exports = { streamDeepSeekResponse };