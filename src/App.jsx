import React, { useState, useEffect, useCallback, useRef } from 'react';
import { LayoutGrid, MessageSquare, Plus, Users, User } from 'lucide-react';
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
  const [user, setUser] = useState(null);
  const [earningsRefreshKey, setEarningsRefreshKey] = useState(0);
  const [logAmount, setLogAmount] = useState('');
  const [agentStage, setAgentStage] = useState(null);
  const [agentHandoff, setAgentHandoff] = useState(null);
  const [persona, setPersona] = useState(null);
  const [pathAssigned, setPathAssigned] = useState(null);
  const [initialWebhook, setInitialWebhook] = useState('router');
  const [copilotMode, setCopilotMode] = useState('onboarding');
  const [copilotContext, setCopilotContext] = useState(null);
  const hasNavigated = useRef(false);

  const buildDailyLoopContext = async (userId) => {
    const { data: sessionData, error: sessionError } = await supabase
      .from('sessions')
      .select('created_at, day1_recipient, output_generated, last_checkin_date')
      .eq('user_id', userId)
      .eq('agent', 'path_1')
      .single();

    if (sessionError || !sessionData) throw new Error('path_1 session not found');

    // Compute day number from last completed daily_progress row — more accurate than calendar counting
    const { data: progressData } = await supabase
      .from('daily_progress')
      .select('day_number')
      .eq('user_id', userId)
      .eq('status', 'complete')
      .order('day_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    const lastCompletedDay = progressData?.day_number || 1;
    const dayNumber = Math.min(lastCompletedDay + 1, 9);

    // Fetch all rows for this day then pick the universal task client-side
    // Avoids .is() filter inconsistency with PostgREST
    const { data: allTaskData } = await supabase
      .from('daily_tasks')
      .select('return_question, title, branch_type')
      .eq('path', 'path_1')
      .eq('day_number', dayNumber);

    const taskData = allTaskData?.find(t => t.branch_type === null) || allTaskData?.[0] || null;

    const serviceCard = sessionData.output_generated
      ? (typeof sessionData.output_generated === 'string'
          ? JSON.parse(sessionData.output_generated)
          : sessionData.output_generated)
      : null;

    return {
      dayNumber,
      recipient: sessionData.day1_recipient,
      returnQuestion: taskData?.return_question || `How did Day ${dayNumber - 1} go?`,
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
      // Guard: only run once per login session. Supabase fires SIGNED_IN on
      // token auto-refresh too, which would re-run this mid-conversation and
      // navigate away based on the (now-updated) active_webhook.
      if (hasNavigated.current) return;
      hasNavigated.current = true;

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
        hasNavigated.current = false;
        setUser(null);
        setActiveScreen('screen-login');
      } else if (session?.user) {
        setUser(session.user);
      }
    });

    return () => listener.subscription.unsubscribe();
  }, []);

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
    if (!logAmount || !user) return;

    await supabase.from('income_log').insert({
      user_id: user.id,
      path: 'path_1',
      amount: parseInt(logAmount),
      source_type: 'consulting_project',
      source_description: 'Logged via app',
      is_first_earning: false,
      verified: false,
    });

    const { data: userData } = await supabase
      .from('users')
      .select('total_earned')
      .eq('id', user.id)
      .single();

    await supabase
      .from('users')
      .update({ total_earned: (userData?.total_earned || 0) + parseInt(logAmount) })
      .eq('id', user.id);

    setIsLogOpen(false);
    showToast('✅ ₹' + parseInt(logAmount).toLocaleString('en-IN') + ' logged!');
    setLogAmount('');
    setEarningsRefreshKey(prev => prev + 1);
  };

  return (
    <div className={`app-shell ${theme === 'dark' ? 'dark-theme' : ''}`}>
      {/* Toast */}
      {toastMessage && <div className="toast-container">{toastMessage}</div>}

      {/* Screen content */}
      <div className="screen-animate" key={activeScreen}>
        {activeScreen === 'screen-login' && (
          <AuthScreen onLogin={() => {}} />
        )}
        {activeScreen === 'screen-home' && (
          <HomeScreen onOpenLog={() => setIsLogOpen(true)} user={user} onOpenCopilot={navigateToCopilot} refreshKey={earningsRefreshKey} />
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
            setPersona={setPersona}
            setPathAssigned={setPathAssigned}
            onNavigateToDashboard={async () => {
              await navigateToCopilot();
              setActiveScreen('screen-home');
              setActiveNav('home');
            }}
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
            <span style={{ fontSize: '10px', fontWeight: '600', marginTop: '3px' }}>Home</span>
          </div>
          <div className={`nav-item ${activeNav === 'copilot' ? 'active' : ''}`} onClick={navigateToCopilot}>
            <MessageSquare size={22} />
            <span style={{ fontSize: '10px', fontWeight: '600', marginTop: '3px' }}>Coach</span>
          </div>
          <div className="nav-plus" onClick={() => setIsLogOpen(true)}>
            <Plus size={22} />
          </div>
          <div className={`nav-item ${activeNav === 'cohort' ? 'active' : ''}`} onClick={() => navigate('screen-cohort', 'cohort')}>
            <Users size={22} />
            <span style={{ fontSize: '10px', fontWeight: '600', marginTop: '3px' }}>Stories</span>
          </div>
          <div className={`nav-item ${activeNav === 'profile' ? 'active' : ''}`} onClick={() => navigate('screen-profile', 'profile')}>
            <User size={22} />
            <span style={{ fontSize: '10px', fontWeight: '600', marginTop: '3px' }}>Profile</span>
          </div>
        </div>
      )}
    </div>
  );
}
