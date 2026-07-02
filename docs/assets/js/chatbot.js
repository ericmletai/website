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
const chatHistory = [];

// ─── Page Detection ───────────────────────────────────────────
// Detects which page the widget is on and sets content accordingly
// Add new pathname conditions here as the widget expands to more pages
const path = window.location.pathname;
const isLabPage = path.includes('/lab');
const isWorkPage = path.includes('/work') && !path.includes('/project-');
const isProjectPage = path.includes('/project-');

// ─── Page-Specific Content ────────────────────────────────────

// Greeting — first message visible when chat opens
const GREETING = isLabPage
  ? `Hi, I'm Bailee — an AI created by Eric to explore this experience. What brings you here today?`
  : isProjectPage
  ? `Hi, I'm Bailee — I can help you navigate this project or answer questions about Eric's process. What are you looking for?`
  : `Hi, I'm Bailee — I can help you navigate Eric's work or answer questions about his process. What are you looking for?`;

// Starter prompts — three options tailored to page context
const STARTERS_HTML = isLabPage ? `
  <button class="starter-btn">What is this experiment about?</button>
  <button class="starter-btn">Tell me about Eric's work</button>
  <button class="starter-btn">Give feedback on this chat</button>
` : isProjectPage ? `
  <button class="starter-btn">What was the key insight?</button>
  <button class="starter-btn">What was the impact of this project?</button>
  <button class="starter-btn">How does this relate to my problem?</button>
` : `
  <button class="starter-btn">I'm looking to hire a designer</button>
  <button class="starter-btn">Show me work in healthcare</button>
  <button class="starter-btn">I have a project I need help with</button>
`;

// Nudge copy — contextual to page intent
const NUDGE_TEXT = isLabPage
  ? `Curious about this experiment? I can help.`
  : isProjectPage
  ? `Questions about this project? I can help.`
  : `Looking for a specific type of work? Ask me.`;

// Tailored opener when chat is opened via nudge bubble
const NUDGE_GREETING = isLabPage
  ? `Curious about the experiment? Happy to walk you through it — or answer anything else.`
  : isProjectPage
  ? `Questions about this project? I can point you to the right section or go deeper on anything here.`
  : `Looking to reach Eric, or have a question? I can help.`;

// ─── Set Nudge Text Dynamically ───────────────────────────────
// Updates the nudge bubble copy based on current page
if (chatNudge) {
  const nudgeText = chatNudge.childNodes[0];
  if (nudgeText) nudgeText.textContent = NUDGE_TEXT;
}

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
  if (nudgeShown || nudgeDismissed) return;
  if (!chatWindow.classList.contains('hidden')) return;
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

// ─── Nudge Click ──────────────────────────────────────────────
// Whole bubble clickable — opens chat with tailored opener
chatNudge.addEventListener('click', (e) => {
  if (e.target === nudgeClose) return;
  dismissNudge();
  chatWindow.classList.remove('hidden');
  chatMessages.innerHTML = `<div class="message bot">${NUDGE_GREETING}</div>`;
  starterPrompts.style.display = 'none';
});

// Close button inside nudge — dismiss only
nudgeClose.addEventListener('click', (e) => {
  e.stopPropagation();
  dismissNudge();
});

// ─── Open / Close Chat ────────────────────────────────────────
toggleBtn.addEventListener('click', () => {
  chatWindow.classList.remove('hidden');
  if (!nudgeDismissed) dismissNudge();
});

closeBtn.addEventListener('click', () => {
  chatWindow.classList.add('hidden');
});

// ─── Refresh ──────────────────────────────────────────────────
// Always resets to default greeting regardless of how chat was opened
refreshBtn.addEventListener('click', () => {
  chatHistory.length = 0;
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

  // Convert markdown links [text](url) to real anchor tags
  // target="_blank" opens in new tab — rel="noopener" is a security best practice
  const parsed = text.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener" style="color:inherit;text-decoration:underline;">$1</a>'
  );

  // innerHTML used here only because we're injecting known anchor tags from markdown parsing
  msg.innerHTML = parsed;

  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  if (text !== '...') {
    chatHistory.push({
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
      body: JSON.stringify({
        messages: chatHistory,
        currentPage: window.location.href // tells Bailey which page visitor is on
      })
    });

    const data = await response.json();
    chatMessages.removeChild(chatMessages.lastChild);

    // Split on ||| delimiter — two bubbles with thinking pause
    // Single bubble when model responds naturally
    // Strip any trailing ||| the model leaves without a follow-up question
    // {3,} catches both ||| and |||| which occasionally appears as a model quirk
    const cleaned = data.reply.replace(/\|{3,}\s*$/, '').trim();
    const parts = cleaned.split('|||').map(p => p.trim()).filter(Boolean);

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