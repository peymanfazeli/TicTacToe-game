const token = process.env.BOT_TOKEN;
const url = `https://online-tictactoe.netlify.app/.netlify/functions/bot`;

const res = await fetch(
  `https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(url)}`
);

const data = await res.json();
console.log(data);