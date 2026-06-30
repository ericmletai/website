// ─── Element References ───────────────────────────────────────
const toggleBtn = document.getElementById('chat-toggle');
const chatWindow = document.getElementById('chat-window');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');
const closeBtn = document.getElementById('close-btn');
const refreshBtn = document.getElementById('refresh-btn');
const starterPrompts = document.getElementById('starter-prompts');
const chatNudge = document.getElementById('chat-nudge');
const nudgeClose = document.getElementById('nudge-close');

// Live Vercel backend — safe to expose, key stays server-side
const API_URL = 'https://chatbot-backend-one-tau.vercel.app/api/chat';

// Conversation history — grows each exchange, sent in full every request
const history = [];

// Default greeting and starters — used on normal icon open or refresh
const GREETING = `Hi, I'm Bailee — an AI created by Eric to explore this experience. What brings you here today?`;
const STARTERS_HTML = `
  <button class="starter-btn">I'm looking to hire a designer</button>
  <button class="starter-btn">I have a project I need help with</button>
  <button class="starter-btn">I'm curious about Eric's work</button>
  <button class="starter-btn">Give feedback on this experiment</button>
`;

// Tailored opener — used only when chat is opened via the nudge bubble
const NUDGE_GREETING = `Looking to reach Eric, or have a question? I can help.`;

// ─── Nudge State ──────────────────────────────────────────────
let nudgeShown = false;
let nudgeDismissed = false;

// ─── Dismiss Nudge ────────────────────────────────────────────
function dismissNudge() {
  nudgeDismissed = true;
  chatNudge.classList.add('fade-out');
  setTimeout(() => chatNudge.classList.add('hidden'), 400);
}

// Auto-dismiss after 7 seconds if untouched
function startNudgeTimer() {
  setTimeout(() => {
    if (!nudgeDismissed) dismissNudge();
  }, 7000);
}

// ─── Show Nudge ───────────────────────────────────────────────
function showNudge() {
  if (nudgeShown || nudgeDismissed) return; // only show once per session
  if (!chatWindow.classList.contains('hidden')) return; // skip if chat already open
  nudgeShown = true;
  chatNudge.classList.remove('hidden');
  chatNudge.classList.remove('fade-out');
  startNudgeTimer();
}

// ─── Scroll Trigger ───────────────────────────────────────────
// Fires nudge when user scrolls within 300px of the footer
window.addEventListener('scroll', () => {
  if (nudgeShown || nudgeDismissed) return;

  const footer = document.querySelector('footer');
  if (!footer) return;

  const footerTop = footer.getBoundingClientRect().top;
  const windowHeight = window.innerHeight;

  if (footerTop < windowHeight + 300) {
    showNudge();
  }
});

// ─── Nudge Click (entire bubble, opens chat with tailored greeting) ──
chatNudge.addEventListener('click', (e) => {
  if (e.target === nudgeClose) return; // let the × handle its own dismiss logic separately
  dismissNudge();
  chatWindow.classList.remove('hidden');

  // Tailored opener replaces default greeting — continues the nudge's context
  chatMessages.innerHTML = `<div class="message bot">${NUDGE_GREETING}</div>`;
  starterPrompts.style.display = 'none'; // intent is already implied, skip starters
});

// Close button inside nudge — dismiss only, doesn't open chat
nudgeClose.addEventListener('click', (e) => {
  e.stopPropagation(); // prevents the bubble's own click handler from also firing
  dismissNudge();
});

// ─── Open / Close Chat (via icon) ─────────────────────────────
toggleBtn.addEventListener('click', () => {
  chatWindow.classList.remove('hidden');
  if (!nudgeDismissed) dismissNudge();
});

closeBtn.addEventListener('click', () => {
  chatWindow.classList.add('hidden');
});

// ─── Refresh ──────────────────────────────────────────────────
// Always resets to default greeting, regardless of how chat was opened
refreshBtn.addEventListener('click', () => {
  history.length = 0;
  chatMessages.innerHTML = `<div class="message bot">${GREETING}</div>`;
  starterPrompts.innerHTML = STARTERS_HTML;
  starterPrompts.style.display = 'flex';
  attachStarterListeners();
  chatInput.value = '';
});

// ─── Starter Prompts ──────────────────────────────────────────
function attachStarterListeners() {
  document.querySelectorAll('.starter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const text = btn.textContent;
      starterPrompts.style.display = 'none';
      sendMessage(text);
    });
  });
}

attachStarterListeners();

// ─── Messages ─────────────────────────────────────────────────
function addMessage(text, sender) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;

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