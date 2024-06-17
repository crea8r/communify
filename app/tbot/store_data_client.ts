import TelegramBot from 'node-telegram-bot-api';
import {
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  Connection,
} from '@solana/web3.js';
import * as bip39 from 'bip39';
import storage from 'node-persist';
import { transfer } from './transfer';

const SOLANA_RPC_URL = '';
const LITE_RPC_URL = '';

// Initialize the Telegram bot
const token = '';
const bot = new TelegramBot(token, { polling: true });

// Define types for stored data
interface StoredData {
  mnemonic: string;
  publicKey: string;
}

// Initialize session storage
storage.init();

// Function to handle the /home command
bot.onText(/\/home/, async (msg) => {
  const chatId = msg.chat.id;
  const storedData = (await storage.getItem(
    chatId.toString()
  )) as StoredData | null;

  if (!storedData) {
    bot.sendMessage(chatId, 'You need to create a wallet first using /start');
    return;
  }

  const { mnemonic, publicKey } = storedData;
  const seed = bip39.mnemonicToSeedSync(mnemonic).slice(0, 32);
  const keypair = Keypair.fromSeed(seed);

  const connection = new Connection(SOLANA_RPC_URL);
  const balance = await connection.getBalance(keypair.publicKey);
  const solBalance = balance / LAMPORTS_PER_SOL;
  const usdBalance = solBalance * 166.25; // TODO: Fetch real-time price

  const options: TelegramBot.SendMessageOptions = {
    reply_markup: {
      inline_keyboard: [
        [{ text: 'Refresh Balance', callback_data: 'refresh_balance' }],
        [{ text: 'Settings', callback_data: 'settings' }],
      ],
    },
    parse_mode: 'Markdown',
  };

  const message = `Solana · 🅴\n\`${publicKey}\`  (Tap to copy)\nBalance: ${solBalance.toFixed(
    3
  )} SOL ($${usdBalance.toFixed(
    2
  )})\n\nClick on the Refresh button to update your current balance.\n\nJoin our Telegram group @tertsolcom for users of Tert!`;
  bot.sendMessage(chatId, message, options);
});

// Function to handle the /start command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const existingData = (await storage.getItem(
    chatId.toString()
  )) as StoredData | null;

  if (existingData) {
    bot.sendMessage(
      chatId,
      'You already have a wallet. Use /delete to delete your existing wallet before creating a new one.'
    );
    return;
  }

  const mnemonic = bip39.generateMnemonic();
  const seed = bip39.mnemonicToSeedSync(mnemonic).slice(0, 32);
  const keypair = Keypair.fromSeed(seed);

  await storage.setItem(chatId.toString(), {
    mnemonic,
    publicKey: keypair.publicKey.toString(),
  });

  bot.sendMessage(chatId, 'Your Solana wallet has been created.');
});

// Function to handle the /snipe command
bot.onText(/\/snipe/, async (msg) => {
  const chatId = msg.chat.id;

  // Retrieve the mnemonic from session storage
  const storedData = (await storage.getItem(
    chatId.toString()
  )) as StoredData | null;
  if (!storedData) {
    bot.sendMessage(chatId, 'You need to create a wallet first using /start');
    return;
  }

  const { mnemonic } = storedData;
  const seed = bip39.mnemonicToSeedSync(mnemonic).slice(0, 32);
  const keypair = Keypair.fromSeed(seed);

  // Prompt the user for the recipient's address
  bot.sendMessage(chatId, "Enter the recipient's Solana address:");
  bot.once('message', async (recipientMsg) => {
    const recipientAddress = recipientMsg.text?.trim();
    if (!recipientAddress) {
      bot.sendMessage(chatId, 'Please provide a valid Solana address.');
      return;
    }

    // Validate the recipient's address
    try {
      new PublicKey(recipientAddress);
    } catch (error) {
      bot.sendMessage(chatId, 'Invalid Solana address. Please try again.');
      return;
    }

    // Prompt the user for the amount to send
    bot.sendMessage(chatId, 'Enter the amount to send (in SOL):');
    bot.once('message', async (amountMsg) => {
      const amountText = amountMsg.text?.trim();
      if (!amountText) {
        bot.sendMessage(chatId, 'Please provide a valid amount.');
        return;
      }
      const amount = parseFloat(amountText);

      if (isNaN(amount) || amount <= 0) {
        bot.sendMessage(
          chatId,
          'Invalid amount. Please enter a positive number.'
        );
        return;
      }

      try {
        const signature = await transfer(keypair, recipientAddress, amount);
        if (signature) {
          bot.sendMessage(
            chatId,
            `Transaction sent successfully. View on Solscan: https://solscan.io/tx/${signature}`
          );
        } else {
          bot.sendMessage(
            chatId,
            'Transaction failed. Please try again later.'
          );
        }
      } catch (error) {
        if (error instanceof Error) {
          bot.sendMessage(
            chatId,
            `Error sending transaction: ${error.message}`
          );
        } else {
          bot.sendMessage(chatId, 'An unknown error occurred');
        }
        console.error('Transaction error:', error);
      }
    });
  });
});

// Function to handle the /delete command
bot.onText(/\/delete/, async (msg) => {
  const chatId = msg.chat.id;
  await storage.removeItem(chatId.toString());
  bot.sendMessage(chatId, 'Your wallet has been deleted.');
});

// Handle callback queries
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message?.chat.id;
  if (!chatId) return;

  const data = callbackQuery.data;

  if (data === 'refresh_balance') {
    const storedData = (await storage.getItem(
      chatId.toString()
    )) as StoredData | null;
    if (!storedData) {
      bot.sendMessage(chatId, 'You need to create a wallet first using /start');
      return;
    }

    const { mnemonic, publicKey } = storedData;
    const seed = bip39.mnemonicToSeedSync(mnemonic).slice(0, 32);
    const keypair = Keypair.fromSeed(seed);

    const connection = new Connection(SOLANA_RPC_URL);
    const balance = await connection.getBalance(keypair.publicKey);
    const solBalance = balance / LAMPORTS_PER_SOL;
    const usdBalance = solBalance * 166.25; // TODO: Fetch real-time price

    const message = `Solana · 🅴\n\`${publicKey}\`  (Tap to copy)\nBalance: ${solBalance.toFixed(
      3
    )} SOL ($${usdBalance.toFixed(
      2
    )})\n\nClick on the Refresh button to update your current balance.\n\nJoin our Telegram group @tertsolcom for users of Tert!`;
    bot.editMessageText(message, {
      chat_id: chatId,
      message_id: callbackQuery.message?.message_id,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Refresh Balance', callback_data: 'refresh_balance' }],
          [{ text: 'Settings', callback_data: 'settings' }],
        ],
      },
    });
  } else if (data === 'settings') {
    const options: TelegramBot.EditMessageTextOptions = {
      chat_id: chatId,
      message_id: callbackQuery.message?.message_id,
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Export Private Key', callback_data: 'export_private_key' }],
          [{ text: 'Back', callback_data: 'home' }],
        ],
      },
    };
    bot.editMessageText('Settings:', options);
  } else if (data === 'export_private_key') {
    const storedData = (await storage.getItem(
      chatId.toString()
    )) as StoredData | null;
    if (!storedData) {
      bot.sendMessage(chatId, 'You need to create a wallet first using /start');
      return;
    }

    const { mnemonic } = storedData;
    const seed = bip39.mnemonicToSeedSync(mnemonic).slice(0, 32);
    const keypair = Keypair.fromSeed(seed);

    // Convert secret key to hex string
    const privateKeyHex = Buffer.from(keypair.secretKey).toString('hex');

    bot.sendMessage(
      chatId,
      `Your private key is:\n\`${privateKeyHex}\`\nKeep it safe!`,
      { parse_mode: 'Markdown' }
    );
  } else if (data === 'home') {
    const storedData = (await storage.getItem(
      chatId.toString()
    )) as StoredData | null;
    if (!storedData) {
      bot.sendMessage(chatId, 'You need to create a wallet first using /start');
      return;
    }

    const { mnemonic, publicKey } = storedData;
    const seed = bip39.mnemonicToSeedSync(mnemonic).slice(0, 32);
    const keypair = Keypair.fromSeed(seed);

    const connection = new Connection(SOLANA_RPC_URL);
    const balance = await connection.getBalance(keypair.publicKey);
    const solBalance = balance / LAMPORTS_PER_SOL;
    const usdBalance = solBalance * 166.25; // TODO: Fetch real-time price

    const options: TelegramBot.SendMessageOptions = {
      reply_markup: {
        inline_keyboard: [
          [{ text: 'Refresh Balance', callback_data: 'refresh_balance' }],
          [{ text: 'Settings', callback_data: 'settings' }],
        ],
      },
      parse_mode: 'Markdown',
    };

    const message = `Solana · 🅴\n\`${publicKey}\`  (Tap to copy)\nBalance: ${solBalance.toFixed(
      3
    )} SOL ($${usdBalance.toFixed(
      2
    )})\n\nClick on the Refresh button to update your current balance.\n\nJoin our Telegram group @tertsolcom for users of Tert!`;
    bot.sendMessage(chatId, message, options);
  }
});
