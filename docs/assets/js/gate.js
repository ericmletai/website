// ─── Reusable Password Gate ────────────────────────────────────
// This file is shared across ALL projects — do not edit per-project.
// Per-project settings (GATE_ENABLED, GATE_HASH) live in each project's
// index.html, defined BEFORE this script is loaded.
//
// Requires in the HTML:
//   <div id="gate">...password form...</div>
//   <div id="protected-content" style="display:none;">...real content...</div>
//   window.GATE_ENABLED = true/false
//   window.GATE_HASH = "sha256 hash string"

(function () {
  const gate = document.getElementById('gate');
  const protectedContent = document.getElementById('protected-content');
  const pwdInput = document.getElementById('pwd');
  const errorMsg = document.getElementById('error');

  if (!gate || !protectedContent) {
    console.warn('Gate: missing #gate or #protected-content element.');
    return;
  }

  // Storage key is unique per page, so unlocking one project doesn't
  // unlock another
  const storageKey = 'gate-unlocked:' + window.location.pathname;

  function unlock() {
    gate.style.display = 'none';
    protectedContent.style.display = 'block';
  }

  function showGate() {
    gate.style.display = 'flex';
    protectedContent.style.display = 'none';
    if (pwdInput) pwdInput.focus();
  }

  // If gating is turned off for this project, skip straight to content
  if (!window.GATE_ENABLED) {
    unlock();
    return;
  }

  // If already unlocked earlier in this browser tab session, skip the form
  if (sessionStorage.getItem(storageKey) === 'true') {
    unlock();
    return;
  }

  showGate();

  async function hashText(text) {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  async function checkPassword() {
    const input = pwdInput.value;
    const hash = await hashText(input);

    if (hash === window.GATE_HASH) {
      sessionStorage.setItem(storageKey, 'true');
      if (errorMsg) errorMsg.style.display = 'none';
      unlock();
    } else {
      if (errorMsg) errorMsg.style.display = 'block';

      // Trigger shake animation — remove first in case it's mid-animation
      // from a previous wrong attempt, so it can replay from scratch
      gate.classList.remove('shake');
      void gate.offsetWidth; // force reflow so the animation restarts
      gate.classList.add('shake');
      setTimeout(() => gate.classList.remove('shake'), 400);
    }
  }

  // Expose for the button's onclick, and wire up Enter key
  window.checkPassword = checkPassword;

  if (pwdInput) {
    pwdInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') checkPassword();
    });
  }
})();