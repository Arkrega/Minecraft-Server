const mineflayer = require('mineflayer');

const options = {
  host: 'mother-elsewhere.gl.joinmc.link',        // Ganti dengan IP server
  port: 25565,              // Port server (default 25565)
  username: 'BiarGkMatiServernya',       // Nama bot
  version: false,           // Biarkan false agar otomatis mendeteksi versi, atau isi versi misal '1.20.1'
  viewDistance: 'tiny',     // Kurangi beban dengan view distance kecil
  chatLengthLimit: 256,     // Batasi panjang chat
};

let bot;

function createBot() {
  bot = mineflayer.createBot(options);

  bot.once('spawn', () => {
    console.log(`Bot ${bot.username} telah join server!`);
  });
  
  bot.on('error', (err) => {
    console.log('Error:', err);
  });
  
  bot.on('end', (reason) => {
    console.log('Bot disconnected:', reason);
    setTimeout(createBot, 5000);
  });

  setInterval(() => {
    if (bot.entity) {
      bot.look(Math.random() * Math.PI * 2, 0);
    }
  }, 60000);
}

createBot();