import React, { useState, useEffect, useCallback } from 'react';
import { LayoutGrid, Calendar, Plus, BarChart2, User } from 'lucide-react';
import './index.css';

import { supabase, callWebhook } from './supabaseClient';
import AuthScreen from './components/AuthScreen';
import HomeScreen from './components/HomeScreen';
import CopilotScreen from './components/CopilotScreen';
import CohortScreen from './components/CohortScreen';
import ProfileScreen from './components/ProfileScreen';

export default function App() {
  const [activeScreen, setActiveScreen] = useState('screen-login');
  const [activeNav, setActiveNav] = useState('home');
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  const [toastMessage, setToastMessage] = useState(null);
  const [showReminder, setShowReminder] = useState(false);
  const [user, setUser] = useState(null);
  const [logAmount, setLogAmount] = useState('');
  const [agentStage, setAgentStage] = useState(null);
  const [agentHandoff, setAgentHandoff] = useState(null);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [persona, setPersona] = useState(null);
  const [pathAssigned, setPathAssigned] = useState(null);
  const [initialWebhook, setInitialWebhook] = useState('router');
  const [copilotMode, setCopilotMode] = useState('onboarding');
  const [copilotContext, setCopilotContext] = useState(null);

  const goToDashboard = () => {
    setActiveScreen('screen-home');
    setActiveNav('home');
  };

  const buildDailyLoopContext = async (userId) => {
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select('created_at, day1_recipient, output_generated, last_checkin_date')
      .eq('user_id', userId)
      .eq('agent', 'path_1')
      .single();

    if (sessionError || !sessionData) throw new Error('path_1 session not found');

    const sessionStart = new Date(sessionData.created_at);
    const dayNumber = Math.max(2, Math.min(9,
      Math.floor((Date.now() - sessionStart) / 86400000) + 1
    ));

    const { data: taskData } = await supabase
      .from('daily_tasks')
      .select('return_question, title')
      .eq('path', 'path_1')
      .eq('day_number', Math.min(dayNumber, 9))
      .limit(1)
      .maybeSingle();

    const serviceCard = sessionData.output_generated
      ? (typeof sessionData.output_generated === 'string'
          ? JSON.parse(sessionData.output_generated)
          : sessionData.output_generated)
      : null;

    return {
      dayNumber,
      recipient: sessionData.day1_recipient,
      returnQuestion: taskData?.return_question || 'How did it go?',
      serviceCard,
    };
  };

  const navigateToCopilot = useCallback(async () => {
    if (!user) return;

    const { data: userData } = await supabase
      .from('users')
      .select('active_webhook')
      .eq('id', user.id)
      .single();

    const webhook = userData?.active_webhook;

    if (webhook === 'daily_loop') {
      try {
        const context = await buildDailyLoopContext(user.id);
        setCopilotMode('return');
        setCopilotContext(context);
      } catch {
        setCopilotMode('return');
        setCopilotContext(null);
      }
      setInitialWebhook('daily_loop');
      setActiveScreen('screen-copilot');
      setActiveNav('copilot');
    } else {
      setActiveScreen('screen-copilot');
      setActiveNav('copilot');
    }
  }, [user]);

  // Listen for Supabase auth state changes
  useEffect(() => {
    const navigateAfterLogin = async (user) => {
      const { data } = await supabase
        .from('users')
        .select('active_webhook')
        .eq('id', user.id)
        .single();

      const webhook = (data?.active_webhook || '').toLowerCase().trim();

      if (webhook === 'daily_loop') {
        try {
          const context = await buildDailyLoopContext(user.id);
          setCopilotMode('return');
          setCopilotContext(context);
          setInitialWebhook('daily_loop');
        } catch {
          setCopilotMode('return');
          setCopilotContext(null);
          setInitialWebhook('daily_loop');
        }
        setActiveScreen('screen-home');
        setActiveNav('home');
        return;
      }

      if (webhook === 'path_1') {
        setInitialWebhook('path_1');
        setCopilotMode('onboarding');
        setCopilotContext(null);
        setActiveScreen('screen-copilot');
        setActiveNav('copilot');
        return;
      }

      if (webhook === 'router' || !webhook) {
        setInitialWebhook('router');
        setCopilotMode('onboarding');
        setCopilotContext(null);
        setActiveScreen('screen-copilot');
        setActiveNav('copilot');
        return;
      }

      // any other active_webhook value (specs, custom) → home
      setActiveScreen('screen-home');
      setActiveNav('home');
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        navigateAfterLogin(session.user);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (_event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        navigateAfterLogin(session.user);
      } else if (_event === 'SIGNED_OUT') {
        setUser(null);
        setActiveScreen('screen-login');
      } else if (session?.user) {
        setUser(session.user);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // 8 PM daily reminder simulation (fires 5s after login)
  useEffect(() => {
    if (activeScreen !== 'screen-home') return;
    const timer = setTimeout(() => setShowReminder(true), 5000);
    return () => clearTimeout(timer);
  }, [activeScreen]);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const navigate = (screen, nav = null) => {
    setActiveScreen(screen);
    if (nav) setActiveNav(nav);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    showToast('👋 Logged out successfully');
  };

  const handleSaveEarnings = async () => {
    setIsLogOpen(false);
    showToast('✅ Earnings Logged Successfully!');
    if (user) {
      callWebhook({
        event: 'earnings_logged',
        email: user.email,
        amount: logAmount,
        userId: user.id,
        timestamp: new Date().toISOString(),
      });
    }
    setLogAmount('');
  };

  return (
    <div className={`app-shell ${theme === 'dark' ? 'dark-theme' : ''}`}>
      {/* Toast */}
      {toastMessage && <div className="toast-container">{toastMessage}</div>}

      {/* 8 PM Reminder */}
      {showReminder && activeScreen !== 'screen-login' && (
        <div className="reminder-modal" onClick={() => setShowReminder(false)}>
          <span>🔔</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', opacity: 0.85, fontWeight: '600' }}>8:00 PM • Daily Reminder</div>
            <div style={{ fontSize: '15px', fontWeight: '700' }}>Don't forget to log today's earnings!</div>
          </div>
          <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', fontSize: '18px' }}>✕</button>
        </div>
      )}

      {/* Screen content */}
      <div className="screen-animate" key={activeScreen}>
        {activeScreen === 'screen-login' && (
          <AuthScreen onLogin={() => {}} />
        )}
        {activeScreen === 'screen-home' && (
          <HomeScreen onOpenLog={() => setIsLogOpen(true)} user={user} onOpenCopilot={navigateToCopilot} />
        )}
        {activeScreen === 'screen-copilot' && (
          <CopilotScreen
            showToast={showToast}
            user={user}
            initialWebhook={initialWebhook}
            mode={copilotMode}
            copilotContext={copilotContext}
            agentStage={agentStage}
            setAgentStage={setAgentStage}
            agentHandoff={agentHandoff}
            setAgentHandoff={setAgentHandoff}
            sessionComplete={sessionComplete}
            setSessionComplete={setSessionComplete}
            setPersona={setPersona}
            setPathAssigned={setPathAssigned}
            onSessionComplete={goToDashboard}
          />
        )}
        {activeScreen === 'screen-cohort' && <CohortScreen user={user} />}
        {activeScreen === 'screen-profile' && (
          <ProfileScreen
            theme={theme}
            setTheme={setTheme}
            showToast={showToast}
            user={user}
            onLogout={handleLogout}
          />
        )}
      </div>

      {/* Log Earnings Modal */}
      {isLogOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 200, display: 'flex', alignItems: 'flex-end', backdropFilter: 'blur(4px)' }}
          onClick={() => setIsLogOpen(false)}
        >
          <div
            style={{ background: theme === 'dark' ? '#1E293B' : 'white', width: '100%', maxWidth: '430px', margin: '0 auto', borderTopLeftRadius: '28px', borderTopRightRadius: '28px', padding: '28px 24px 36px' }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ width: '40px', height: '4px', background: 'var(--border)', borderRadius: '4px', margin: '0 auto 24px' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <div>
                <h2 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-dark)' }}>Log Earnings</h2>
                <p style={{ fontSize: '13px', color: 'var(--text-mid)', marginTop: '4px' }}>Record your consulting income</p>
              </div>
              <button onClick={() => setIsLogOpen(false)} style={{ background: 'var(--bg)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', fontSize: '16px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>
            <div style={{ position: 'relative', marginBottom: '20px' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '20px', fontWeight: '800', color: 'var(--teal)' }}>₹</span>
              <input
                type="number"
                placeholder="0"
                value={logAmount}
                onChange={e => setLogAmount(e.target.value)}
                style={{ width: '100%', padding: '18px 18px 18px 44px', borderRadius: '16px', border: '2px solid var(--border)', fontSize: '28px', fontWeight: '800', background: theme === 'dark' ? 'var(--cream)' : '#F8FAFC', color: 'var(--text-dark)' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              {[500, 1000, 5000, 10000].map(amt => (
                <button
                  key={amt}
                  onClick={() => setLogAmount(amt)}
                  style={{ flex: 1, padding: '10px 4px', borderRadius: '10px', border: '1.5px solid var(--border)', background: logAmount == amt ? 'var(--teal)' : 'transparent', color: logAmount == amt ? 'white' : 'var(--text-mid)', fontWeight: '700', fontSize: '12px', cursor: 'pointer' }}
                >
                  ₹{amt >= 1000 ? `${amt / 1000}K` : amt}
                </button>
              ))}
            </div>
            <button
              className="hero-btn"
              style={{ width: '100%', padding: '18px', borderRadius: '16px', fontSize: '16px' }}
              onClick={handleSaveEarnings}
              disabled={!logAmount}
            >
              Save Earnings 💰
            </button>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      {activeScreen !== 'screen-login' && (
        <div className="bottom-nav">
          <div className={`nav-item ${activeNav === 'home' ? 'active' : ''}`} onClick={() => navigate('screen-home', 'home')}>
            <LayoutGrid size={22} />
          </div>
          <div className={`nav-item ${activeNav === 'copilot' ? 'active' : ''}`} onClick={() => navigate('screen-copilot', 'copilot')}>
            <Calendar size={22} />
          </div>
          <div className="nav-plus" onClick={() => setIsLogOpen(true)}>
            <Plus size={22} />
          </div>
          <div className={`nav-item ${activeNav === 'cohort' ? 'active' : ''}`} onClick={() => navigate('screen-cohort', 'cohort')}>
            <BarChart2 size={22} />
          </div>
          <div className={`nav-item ${activeNav === 'profile' ? 'active' : ''}`} onClick={() => navigate('screen-profile', 'profile')}>
            <User size={22} />
          </div>
        </div>
      )}
    </div>
  );
}
