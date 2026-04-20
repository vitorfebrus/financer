// ─── App data storage ─────────────────────────────────────────────────────────
const SKEY = "finapp_v8";
let _st = null;
const persist = d => {
  clearTimeout(_st);
  _st = setTimeout(() => {
    try { localStorage.setItem(SKEY, JSON.stringify(d)); }
    catch(e) { console.error(e); }
  }, 500);
};
const hydrate = async () => {
  try { const r = localStorage.getItem(SKEY); return r ? JSON.parse(r) : null; }
  catch { return null; }
};

// ─── PIN authentication — PBKDF2 via Web Crypto API ──────────────────────────
//
// O PIN nunca é armazenado. O que fica no localStorage é:
//   { "salt": "<base64 de 16 bytes aleatórios>", "hash": "<base64 de 32 bytes PBKDF2>" }
//
// Para verificar: re-deriva com o mesmo salt e compara bit-a-bit em tempo
// constante (sem timing side-channel). Com 200.000 iterações PBKDF2-SHA256,
// cada tentativa de brute-force demora ~1-2s em hardware moderno.
// Os 10.000 PINs de 4 dígitos levariam horas mesmo com acesso ao hash.
//
// Limite inerente de auth client-side: quem tiver acesso físico ao
// dispositivo + DevTools pode apagar a chave do localStorage e bypassar
// o lock. Isso protege contra acesso casual, não contra atacante com
// acesso físico e conhecimento técnico. Para segurança total seria
// necessário autenticação server-side.

const AUTH_KEY    = 'finapp_pin';
const PBKDF2_ITER = 200_000;
const PBKDF2_HASH = 'SHA-256';

function bufToB64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function b64ToBuf(b64) {
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}

async function deriveKey(pin, salt) {
  const enc    = new TextEncoder();
  const keyMat = await crypto.subtle.importKey(
    'raw', enc.encode(pin), 'PBKDF2', false, ['deriveBits']
  );
  return crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: PBKDF2_HASH, salt, iterations: PBKDF2_ITER },
    keyMat, 256
  );
}

function timingSafeEqual(a, b) {
  const ua = new Uint8Array(a), ub = new Uint8Array(b);
  if (ua.length !== ub.length) return false;
  let diff = 0;
  for (let i = 0; i < ua.length; i++) diff |= ua[i] ^ ub[i];
  return diff === 0;
}

function getStoredPin() { return localStorage.getItem(AUTH_KEY) || null; }

async function setStoredPin(pin) {
  const salt    = crypto.getRandomValues(new Uint8Array(16));
  const derived = await deriveKey(pin, salt);
  localStorage.setItem(AUTH_KEY, JSON.stringify({ salt: bufToB64(salt), hash: bufToB64(derived) }));
}

function clearStoredPin() { localStorage.removeItem(AUTH_KEY); }

async function verifyPin(entered) {
  const raw = localStorage.getItem(AUTH_KEY);
  if (!raw) return false;
  try {
    const { salt, hash } = JSON.parse(raw);
    const derived = await deriveKey(entered, b64ToBuf(salt));
    return timingSafeEqual(derived, b64ToBuf(hash));
  } catch { return false; }
}
