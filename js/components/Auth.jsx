// ─── Auth / PIN screen ────────────────────────────────────────────────────────
function AuthScreen({ onUnlock }) {
  const hasPin = !!getStoredPin();
  const [mode, setMode]     = useState(hasPin ? 'unlock' : 'setup');
  const [step, setStep]     = useState(1);   // 1=enter new, 2=confirm new
  const [pin, setPin]       = useState('');
  const [confirm, setConfirm] = useState('');
  const [err, setErr]       = useState('');
  const [busy, setBusy]     = useState(false); // true while PBKDF2 is running
  const [shake, setShake]   = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [lockUntil, setLockUntil] = useState(0); // timestamp

  const PIN_LEN = 4;

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 500); };

  const currentVal = (mode === 'unlock' || step === 1) ? pin : confirm;

  const press = (d) => {
    if (busy || Date.now() < lockUntil) return;
    setErr('');
    const next = currentVal + d;
    if (next.length > PIN_LEN) return;
    if (step === 2) setConfirm(next); else setPin(next);
    if (next.length === PIN_LEN) setTimeout(() => evaluate(next), 80);
  };

  const del = () => {
    if (busy) return;
    setErr('');
    if (step === 2) setConfirm(p => p.slice(0,-1));
    else setPin(p => p.slice(0,-1));
  };

  const evaluate = async (entered) => {
    if (mode === 'unlock') {
      // Lockout: after 5 wrong attempts, lock for 30s (doubles each time)
      if (Date.now() < lockUntil) {
        const secs = Math.ceil((lockUntil - Date.now()) / 1000);
        setErr(`Aguarde ${secs}s antes de tentar novamente.`);
        setPin('');
        return;
      }

      setBusy(true);
      setErr('');
      const ok = await verifyPin(entered);
      setBusy(false);

      if (ok) {
        onUnlock();
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setPin('');
        triggerShake();
        if (newAttempts >= 5) {
          const lockSecs = Math.min(30 * Math.pow(2, Math.floor(newAttempts / 5) - 1), 3600);
          setLockUntil(Date.now() + lockSecs * 1000);
          setErr(`Muitas tentativas. Bloqueado por ${lockSecs}s.`);
          setAttempts(0);
        } else {
          setErr(`PIN incorreto. ${5 - newAttempts} tentativa(s) restante(s).`);
        }
      }

    } else {
      // Setup mode
      if (step === 1) {
        setStep(2);
        setConfirm('');
      } else {
        if (entered === pin) {
          setBusy(true);
          await setStoredPin(pin);   // async PBKDF2
          setBusy(false);
          onUnlock();
        } else {
          setErr('PINs não coincidem. Tente novamente.');
          setPin(''); setConfirm(''); setStep(1);
          triggerShake();
        }
      }
    }
  };

  // Lockout countdown display
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    if (lockUntil <= Date.now()) return;
    const id = setInterval(() => {
      const r = Math.ceil((lockUntil - Date.now()) / 1000);
      setRemaining(r > 0 ? r : 0);
      if (r <= 0) clearInterval(id);
    }, 1000);
    return () => clearInterval(id);
  }, [lockUntil]);

  const label = mode === 'setup'
    ? (step === 1 ? 'Crie seu PIN de 4 dígitos' : 'Confirme o PIN')
    : 'Digite seu PIN para entrar';

  const dots = Array.from({length: PIN_LEN}, (_, i) => {
    const filled = i < currentVal.length;
    return <div key={i} className={`pin-dot ${filled ? (shake ? 'error' : 'filled') : ''}`}/>;
  });

  const KEYS = ['1','2','3','4','5','6','7','8','9','','0','⌫'];
  const locked = Date.now() < lockUntil;

  return (
    <div className="auth-wrap">
      <div className="auth-logo">💰</div>
      <div className="auth-title">Finanças Pessoais</div>
      <div className="auth-sub">{label}</div>
      <div className="pin-dots">{dots}</div>
      <div className="auth-err">
        {busy ? '🔐 Verificando...' : locked ? `🔒 Bloqueado — aguarde ${remaining}s` : err}
      </div>
      <div className="pin-grid">
        {KEYS.map((k, i) => {
          if (k === '') return <div key={i} className="pin-key empty"/>;
          if (k === '⌫') return <button key={i} className="pin-key del" onClick={del} disabled={busy || locked}>{k}</button>;
          return <button key={i} className="pin-key" onClick={() => press(k)} disabled={busy || locked}>{k}</button>;
        })}
      </div>
      {mode === 'unlock' && !locked && !busy && (
        <span className="auth-link" onClick={() => {
          if (window.confirm('Remover PIN? Seus dados financeiros serão mantidos.')) {
            clearStoredPin(); onUnlock();
          }
        }}>Esqueci meu PIN</span>
      )}
    </div>
  );
}
