import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function AuthScreen({ onLogin }) {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (mode === 'signup') {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      });
      if (signUpError) {
        setError(signUpError.message);
      } else {
        setSuccess('Check your email to confirm your account, then log in!');
        setMode('login');
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
      } else {
        onLogin();
      }
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) setError(error.message);
    setLoading(false);
  };

  return (
    <div className="auth-screen">
      <div className="auth-logo-area">
        <h1>Second <span>Salary</span></h1>
        <p>Your AI co-pilot for consulting revenue</p>
      </div>

      <div className="auth-tabs">
        <button
          className={`auth-tab ${mode === 'login' ? 'active' : ''}`}
          onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
        >Sign In</button>
        <button
          className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
          onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
        >Create Account</button>
      </div>

      <form onSubmit={handleSubmit} className="auth-form">
        {mode === 'signup' && (
          <div className="form-field">
            <label>Full Name</label>
            <input
              type="text"
              placeholder="Priya Sharma"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        )}
        <div className="form-field">
          <label>Email Address</label>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-field">
          <label>Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>

        {error && <div className="auth-error">⚠️ {error}</div>}
        {success && <div className="auth-success">✅ {success}</div>}

        <button type="submit" className="auth-submit-btn" disabled={loading}>
          {loading ? <span className="auth-spinner"></span> : (mode === 'login' ? 'Sign In' : 'Create Account')}
        </button>
      </form>

      <div className="auth-divider">
        <div className="auth-divider-line"></div>
        <span>OR</span>
        <div className="auth-divider-line"></div>
      </div>

      <button type="button" className="google-btn" onClick={handleGoogle} disabled={loading}>
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width="20" />
        Continue with Google
      </button>

      {mode === 'login' && (
        <button className="auth-forgot" type="button" onClick={async () => {
          if (!email) { setError('Enter your email above first.'); return; }
          await supabase.auth.resetPasswordForEmail(email);
          setSuccess('Password reset link sent to your email!');
        }}>
          Forgot password?
        </button>
      )}
    </div>
  );
}
