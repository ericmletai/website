// ─── Element References ───────────────────────────────────────
const toggleBtn = document.getElementById('chat-toggle');
const chatWindow = document.getElementById('chat-window');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');
const closeBtn = document.getElementById('close-btn');
const refreshBtn = document.getElementById('refresh-btn');
const starterPrompts = document.getElementById('starter-prompts');

// Live Vercel backend — safe to expose, key stays server-side
const API_URL = 'https://chatbot-backend-one-tau.vercel.app/api/chat';

// Conversation history — grows each exchange, sent in full every request
const history = [];

// Opening greeting and starter prompts HTML — stored so refresh can restore them
const GREETING = `Hi, I'm Bailee. What are you working on or what brought you here today?`;
const STARTERS_HTML = `
  <button class="starter-btn">I'm looking to hire a designer</button>
  <button class="starter-btn">I have a project I need help with</button>
  <button class="starter-btn">I'm curious about Eric's work</button>
  <button class="starter-btn">Give feedback on chat</button>
`;

// ─── Open / Close ─────────────────────────────────────────────

toggleBtn.addEventListener('click', () => {
  chatWindow.classList.remove('hidden');
});

closeBtn.addEventListener('click', () => {
  chatWindow.classList.add('hidden');
});

// ─── Refresh ──────────────────────────────────────────────────

// Resets conversation to initial state without closing the window
// Clears history, messages, and restores greeting + starter prompts
refreshBtn.addEventListener('click', () => {
  // Clear conversation history array
  history.length = 0;

  // Clear all messages and restore opening greeting
  chatMessages.innerHTML = `<div class="message bot">${GREETING}</div>`;

  // Restore starter prompts and re-attach their click listeners
  starterPrompts.innerHTML = STARTERS_HTML;
  starterPrompts.style.display = 'flex';
  attachStarterListeners(); // re-attach since innerHTML replaced the old elements

  // Clear input field just in case
  chatInput.value = '';
});

// ─── Starter Prompts ──────────────────────────────────────────

// Extracted into a function so both initial load and refresh can call it
function attachStarterListeners() {
  document.querySelectorAll('.starter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.textContent;
      starterPrompts.style.display = 'none';
      sendMessage(text);
    });
  });
}

// Attach on initial load
attachStarterListeners();

// ─── Messages ─────────────────────────────────────────────────

function addMessage(text, sender) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  // Only log real messages to history, not the "..." typing indicator
  if (text !== '...') {
    history.push({
      role: sender === 'user' ? 'user' : 'assistant',
      content: text
    });
  }
}

// ─── Send Message ─────────────────────────────────────────────

async function sendMessage(text) {
  if (!text) text = chatInput.value.trim();
  if (!text) return;

  starterPrompts.style.display = 'none';

  addMessage(text, 'user');
  chatInput.value = '';
  addMessage('...', 'bot');

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history })
    });

    const data = await response.json();
    chatMessages.removeChild(chatMessages.lastChild);

    // Split on ||| delimiter if present — two bubbles with thinking pause
    // Single bubble when model responds naturally without delimiter
    const parts = data.reply.split('|||').map(p => p.trim()).filter(Boolean);

    if (parts.length > 1) {
      addMessage(parts[0], 'bot');
      setTimeout(() => addMessage(parts[1], 'bot'), 700);
    } else {
      addMessage(data.reply, 'bot');
    }

  } catch (error) {
    chatMessages.removeChild(chatMessages.lastChild);
    addMessage('Something went wrong. Try again.', 'bot');
    console.error(error);
  }
}

// ─── Input Triggers ───────────────────────────────────────────

chatSend.addEventListener('click', () => sendMessage());

chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendMessage();
});





// ─── Scroll Nudge ─────────────────────────────────────────────
// Feature 2 placeholder — scroll trigger logic will go here