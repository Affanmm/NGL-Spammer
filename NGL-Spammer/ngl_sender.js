const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const fetch = require("node-fetch");

// === CONFIGURATION ===
const USERNAME = "wyd.mahrukh"; // replace with actual NGL username
const MAX_MESSAGES = 50; // how many messages to send

// === UTILS ===

const readMessagesFromFile = (filePath) => {
  const raw = fs.readFileSync(filePath, "utf8");
  return raw.split("\n").map(line => line.trim()).filter(Boolean);
};

const randomDelay = (min = 5000, max = 15000) =>
  new Promise(resolve => setTimeout(resolve, Math.floor(Math.random() * (max - min + 1)) + min));

const getRandomMessage = (messages) =>
  messages[Math.floor(Math.random() * messages.length)];

// === MAIN FUNCTION ===

const sendMessage = async (username, message) => {
  const deviceId = crypto.randomBytes(21).toString("hex");
  const url = "https://ngl.link/api/submit";
  const headers = {
    "User-Agent": `Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.${Math.floor(Math.random() * 20 + 80)}) Gecko/20100101 Firefox/109.0`,
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.5",
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
    "X-Requested-With": "XMLHttpRequest",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-origin",
    "Referer": `https://ngl.link/${username}`,
    "Origin": "https://ngl.link"
  };
  const body = `username=${username}&question=${encodeURIComponent(message)}&deviceId=${deviceId}&gameSlug=&referrer=`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body,
      mode: "cors",
      credentials: "include"
    });

    const time = new Date().toLocaleTimeString();

    if (response.status !== 200) {
      console.log(`[${time}] ❌ Failed to send message. Status: ${response.status}`);
      return false;
    }

    console.log(`[${time}] ✅ Message sent: "${message}"`);
    return true;

  } catch (error) {
    console.error(`Error: ${error.message}`);
    return false;
  }
};

// === EXECUTION ===

(async () => {
  const messages = readMessagesFromFile(path.join(__dirname, "messages.txt"));

  if (messages.length === 0) {
    console.error("No messages found in messages.txt");
    return;
  }

  for (let i = 0; i < MAX_MESSAGES; i++) {
    const msg = getRandomMessage(messages);
    const success = await sendMessage(USERNAME, msg);

    if (!success) {
      console.log("Waiting longer due to error or rate-limit...");
      await randomDelay(20000, 30000);
    } else {
      await randomDelay();
    }

    // Optional: Longer break every 5 messages
    if ((i + 1) % 5 === 0) {
      console.log("Taking a short human-like break...");
      await randomDelay(30000, 60000);
    }
  }

  console.log("✅ Done sending messages.");
})();
