import { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function AdminLogin({ onSuccess, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockedOut, setLockedOut] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (lockedOut) return;

    setIsLoading(true);
    setError('');

    try {
      // Authenticate directly using the email and password provided by the user
      await signInWithEmailAndPassword(auth, email.trim(), password);
      onSuccess();
    } catch (err) {
      console.error("Auth login error:", err);
      handleFailure();
    } finally {
      setIsLoading(false);
    }
  };

  const handleFailure = () => {
    const newFails = failedAttempts + 1;
    setFailedAttempts(newFails);
    
    if (newFails >= 3) {
      setLockedOut(true);
      setError("Maximum attempts reached. Access permanently locked.");
      setTimeout(() => {
        onClose();
      }, 1500);
    } else {
      setError(`Invalid credentials. Attempts remaining: ${3 - newFails}`);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(16, 20, 27, 0.85)', backdropFilter: 'blur(10px)',
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      zIndex: 2000
    }}>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', position: 'relative' }}>
        <button 
          onClick={onClose}
          style={{ position: 'absolute', top: '10px', right: '15px', background: 'transparent', color: 'white', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}
        >
          &times;
        </button>
        
        <h3 style={{ marginBottom: '1.5rem', textAlign: 'center', color: 'var(--accent-color)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Restricted Access
        </h3>

        {lockedOut ? (
          <div style={{ color: 'var(--error-color)', textAlign: 'center', padding: '2rem 0' }}>
            <span style={{ fontSize: '3rem' }}>🔒</span>
            <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>SYSTEM LOCKED</p>
          </div>
        ) : (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Email Address</label>
              <input 
                type="email" 
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Password</label>
              <input 
                type="password" 
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p style={{ color: 'var(--error-color)', fontSize: '0.85rem', textAlign: 'center' }}>{error}</p>}

            <button type="submit" className="btn-primary" style={{ marginTop: '1rem', width: '100%', padding: '0.75rem' }} disabled={isLoading}>
              {isLoading ? 'Verifying...' : 'Access Terminal'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

