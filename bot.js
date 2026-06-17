import { Bot, InlineKeyboard } from "grammy";

const bot = new Bot(process.env.BOT_TOKEN);

bot.command("start", (ctx) => {
  const text = `🎮 Welcome to Juicy Tic Tac Toe!

Challenge the AI on Easy, Medium, or Hard.

✨ Features:
• Adaptive AI
• English & Persian
• Beautiful themes
• Leaderboards coming soon

👇 Tap below to play`;

  const keyboard = new InlineKeyboard().webApp(
    "🎮 Play Now",
    "https://online-tictactoe.netlify.app"
  );

  ctx.reply(text, { reply_markup: keyboard });
});

bot.start();
