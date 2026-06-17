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

export default async (req) => {
  try {
    const update = await req.json();
    await bot.handleUpdate(update);
    return new Response("OK", { status: 200 });
  } catch (err) {
    return new Response("Bad Request", { status: 400 });
  }
};