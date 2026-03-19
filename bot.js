const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const DURATION_MS = 70_000;
const FRAME_INTERVAL_MS = 2_000;

/**
 * All commands return an array of frames made with letters, symbols, and emojis.
 */
const animations = {
  '.heart': () => [
    '  💖     💖  \n 💖💖   💖💖 \n💖💖💖 💖💖💖\n 💖💖💖💖💖 \n  💖💖💖💖  \n   💖💖💖   \n    💖💖    \n     💖     ',
    '  ❤️     ❤️  \n ❤️❤️   ❤️❤️ \n❤️❤️❤️ ❤️❤️❤️\n ❤️❤️❤️❤️❤️ \n  ❤️❤️❤️❤️  \n   ❤️❤️❤️   \n    ❤️❤️    \n     ❤️     ',
    '  💘     💘  \n 💘💘   💘💘 \n💘💘💘 💘💘💘\n 💘💘💘💘💘 \n  💘💘💘💘  \n   💘💘💘   \n    💘💘    \n     💘     ',
    '   ♥️   ♥️   \n  ♥️♥️ ♥️♥️  \n ♥️♥️♥️♥️♥️ \n  ♥️♥️♥️♥️  \n   ♥️♥️♥️   \n    ♥️♥️    \n     ♥️     '
  ],
  '.star': () => [
    '     ✨     \n   ✨⭐✨   \n ✨⭐🌟⭐✨ \n   ✨⭐✨   \n     ✨     ',
    '     ⭐     \n   ⭐🌟⭐   \n ⭐🌟💫🌟⭐ \n   ⭐🌟⭐   \n     ⭐     ',
    '     💫     \n   💫⭐💫   \n 💫⭐✨⭐💫 \n   💫⭐💫   \n     💫     ',
    '     🌟     \n   🌟✨🌟   \n 🌟✨⭐✨🌟 \n   🌟✨🌟   \n     🌟     '
  ],
  '.wave': () => [
    '🌊~~~~~~\n ~~🌊~~~~\n ~~~~🌊~~\n ~~~~~~🌊',
    '~~~~~~🌊\n ~~~~🌊~~\n ~~🌊~~~~\n 🌊~~~~~~',
    '~~🌊~~~~\n ~~~~🌊~~\n ~~~~~~🌊\n 🌊~~~~~~',
    '~~~~🌊~~\n ~~🌊~~~~\n 🌊~~~~~~\n ~~~~~~🌊'
  ],
  '.spiral': () => [
    '🌀🌀🌀🌀🌀\n🌀⚫⚫⚫🌀\n🌀⚫🌀⚫🌀\n🌀⚫⚫⚫🌀\n🌀🌀🌀🌀🌀',
    '⚫⚫⚫⚫⚫\n⚫🌀🌀🌀⚫\n⚫🌀⚫🌀⚫\n⚫🌀🌀🌀⚫\n⚫⚫⚫⚫⚫',
    '🌀⚫🌀⚫🌀\n⚫🌀⚫🌀⚫\n🌀⚫🌀⚫🌀\n⚫🌀⚫🌀⚫\n🌀⚫🌀⚫🌀',
    '⚫🌀⚫🌀⚫\n🌀⚫🌀⚫🌀\n⚫🌀⚫🌀⚫\n🌀⚫🌀⚫🌀\n⚫🌀⚫🌀⚫'
  ],
  '.flower': () => [
    '   🌸   \n 🌸🌼🌸 \n🌼🌺🌼🌺🌼\n 🌸🌼🌸 \n   🌸   ',
    '   🌺   \n 🌺🌸🌺 \n🌸🌼🌸🌼🌸\n 🌺🌸🌺 \n   🌺   ',
    '   🌼   \n 🌼🌺🌼 \n🌺🌸🌺🌸🌺\n 🌼🌺🌼 \n   🌼   ',
    '   🌷   \n 🌷🌹🌷 \n🌹🌸🌹🌸🌹\n 🌷🌹🌷 \n   🌷   '
  ],
  '.rocket': () => [
    '    🚀\n   /|\\\n  /_|_\\\n   / \\\n  🌍',
    '   🚀\n  /|\\\n /_|_\\\n  / \\\n 🌎\n  ☁️',
    '  🚀\n /|\\\n/_|_\\\n / \\\n🌏\n ☁️\n  ☁️',
    ' 🚀\n/|\\\n_|_\n/ \\\n☁️\n 🌍\n  ✨'
  ],
  '.rain': () => [
    '☁️ ☁️ ☁️\n  💧 💧\n💧 💧 💧\n  💧 💧\n🌧️🌧️🌧️',
    '☁️☁️☁️\n💧  💧  💧\n  💧  💧\n💧  💧  💧\n🌧️🌧️🌧️',
    '☁️ ☁️ ☁️\n💧💧💧💧💧\n  💧 💧\n💧💧💧💧💧\n🌧️🌧️🌧️',
    '☁️☁️☁️\n  💧 💧\n💧 💧 💧\n  💧 💧\n⛈️⛈️⛈️'
  ],
  '.dna': () => [
    '🧬      🧬\n  A====T  \n   C==G   \n  G====C  \n🧬      🧬',
    ' 🧬    🧬 \n  T====A  \n   G==C   \n  C====G  \n 🧬    🧬 ',
    '  🧬  🧬  \n   A==T   \n  C====G  \n   G==C   \n  🧬  🧬  ',
    ' 🧬    🧬 \n  C====G  \n   T==A   \n  A====T  \n 🧬    🧬 '
  ],
  '.pulse': () => [
    '─────📈─────\n───📈──📈───\n─📈──────📈─\n───📉──📉───\n─────📉─────',
    '────📈📈────\n──📈────📈──\n📈────────📈\n──📉────📉──\n────📉📉────',
    '───📈──📈───\n─📈──────📈─\n📈────────📈\n─📉──────📉─\n───📉──📉───',
    '─────❤️─────\n───❤️──❤️───\n─❤️──────❤️─\n───❤️──❤️───\n─────❤️─────'
  ],
  '.fire': () => [
    '   🔥   \n  🔥🔥  \n 🔥🔥🔥 \n🔥🔥🔥🔥\n  🪵🪵  ',
    '   🔥   \n  🔥🔥🔥 \n 🔥🔥🔥🔥\n  🔥🔥🔥 \n   🪵🪵  ',
    '    🔥   \n   🔥🔥  \n  🔥🔥🔥 \n 🔥🔥🔥🔥\n  🪵🪵   ',
    '   🔥🔥  \n  🔥🔥🔥 \n 🔥🔥🔥🔥\n  🔥🔥🔥 \n   🪵🪵  '
  ]
};

const commands = Object.keys(animations);
const activeChats = new Set();

function pickFrame(frames, index) {
  return frames[index % frames.length];
}

async function runAnimation(message, command) {
  const chatId = message.from;

  if (activeChats.has(chatId)) {
    await message.reply('⏳ I am already running an animation in this chat. Please wait until it ends.');
    return;
  }

  activeChats.add(chatId);
  const frames = animations[command]();
  const startedAt = Date.now();
  let frameIndex = 0;

  await message.reply(`🎬 Starting *${command}* animation for 70 seconds.`);

  while (Date.now() - startedAt < DURATION_MS) {
    const frame = pickFrame(frames, frameIndex);
    await message.reply(frame);
    frameIndex += 1;
    await new Promise((resolve) => setTimeout(resolve, FRAME_INTERVAL_MS));
  }

  await message.reply(`✅ *${command}* animation finished. Try another: ${commands.join(', ')}`);
  activeChats.delete(chatId);
}

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  }
});

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
  console.log('Scan the QR code above with WhatsApp to log in.');
});

client.on('ready', () => {
  console.log('✅ WhatsApp animation bot is ready.');
  console.log(`Commands: ${commands.join(', ')}`);
});

client.on('message', async (message) => {
  const text = (message.body || '').trim().toLowerCase();

  if (text === '.help') {
    await message.reply(`🤖 Animation commands (70s each):\n${commands.join('\n')}\n\nUse one command at a time.`);
    return;
  }

  if (!animations[text]) {
    return;
  }

  try {
    await runAnimation(message, text);
  } catch (error) {
    console.error('Animation error:', error);
    activeChats.delete(message.from);
    await message.reply('❌ Something went wrong while running animation.');
  }
});

client.initialize();
