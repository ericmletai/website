// ─── Element References ───────────────────────────────────────
const toggleBtn = document.getElementById('chat-toggle');
const chatWindow = document.getElementById('chat-window');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chat-input');
const chatSend = document.getElementById('chat-send');
const closeBtn = document.getElementById('close-btn');
const starterPrompts = document.getElementById('starter-prompts');

// Live Vercel backend — safe to expose, key stays server-side
const API_URL = 'https://chatbot-backend-one-tau.vercel.app/api/chat';

// Conversation history — grows each exchange, sent in full every request
const history = [];

// ─── Open / Close ─────────────────────────────────────────────

// Toggle button: opens chat window
toggleBtn.addEventListener('click', () => {
  chatWindow.classList.remove('hidden');
});

// Close button: fully hides window — toggle button needed to reopen
// Conversation history persists in memory so reopening continues same session
closeBtn.addEventListener('click', () => {
  chatWindow.classList.add('hidden');
});

// ─── Starter Prompts ──────────────────────────────────────────

// Each starter sends its label as a message, then hides the prompt row
document.querySelectorAll('.starter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const text = btn.textContent;
    starterPrompts.style.display = 'none';
    sendMessage(text);
  });
});

// ─── Messages ─────────────────────────────────────────────────

function addMessage(text, sender) {
  const msg = document.createElement('div');
  msg.classList.add('message', sender);
  msg.textContent = text;
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight; // auto-scroll to latest

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
  if (!text) return; // ignore empty sends

  // Hide starters once user sends first message
  starterPrompts.style.display = 'none';

  addMessage(text, 'user');
  chatInput.value = '';
  addMessage('...', 'bot'); // typing indicator while waiting

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history }) // full history every request
    });

    const data = await response.json();

    // Remove "..." placeholder before rendering reply
    chatMessages.removeChild(chatMessages.lastChild);

    // Split on ||| delimiter if present — renders as two bubbles with a thinking pause
    // When model responds as one block, renders naturally as a single bubble
    const parts = data.reply.split('|||').map(p => p.trim()).filter(Boolean);

    if (parts.length > 1) {
      addMessage(parts[0], 'bot'); // first bubble appears immediately
      setTimeout(() => addMessage(parts[1], 'bot'), 700); // second bubble after pause — feels like thinking
    } else {
      addMessage(data.reply, 'bot'); // single bubble when model responds naturally
    }

  } catch (error) {
    chatMessages.removeChild(chatMessages.lastChild);
    addMessage('Something went wrong. Try again.', 'bot');
    console.error(error);
  }
}

// ─── Input Triggers ───────────────────────────────────────────

// Send button click
chatSend.addEventListener('click', () => sendMessage());

// Enter key sends message
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendMessage();
});