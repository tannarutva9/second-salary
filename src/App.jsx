import React, { useState, useEffect } from 'react';
import { LayoutGrid, Calendar, Plus, BarChart2, User, Send, CheckCircle2, Zap, Users, TrendingUp } from 'lucide-react';
import './index.css';

import { supabase, callWebhook } from './supabaseClient';
import AuthScreen from './components/AuthScreen';
import CopilotScreen from './components/CopilotScreen';
import CohortScreen from './components/CohortScreen';
import ProfileScreen from './components/ProfileScreen';

function HomeScreen({ onOpenLog, user }) {
  const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <>
      <div className="top-header">
        <div className="avatar">{displayName[0]?.toUpperCase()}</div>
        <div className="greeting">{greeting}, {displayName} 👋</div>
        <h1>Let's keep <span>earning more</span></h1>
      </div>

      <div className="hero-card">
        <div className="hero-text">
          <p>Total ₹ Earned</p>
          <div className="hero-amount">₹42,000</div>
          <button className="hero-btn" onClick={onOpenLog}>Log Earnings</button>
        </div>
        <div className="circular-progress">
          <svg viewBox="0 0 100 100">
            <circle className="ring-bg" cx="50" cy="50" r="40" />
            <circle className="ring-fill" cx="50" cy="50" r="40" />
          </svg>
          <div className="pct">70%</div>
        </div>
      </div>

      <div className="stat-row">
        <div className="stat-pill">
          <span className="val orange">Day 28</span>
          <span className="label">Day</span>
        </div>
        <div className="stat-pill">
          <span className="val teal">Day 9 ✓</span>
          <span className="label">Plan</span>
        </div>
        <div className="stat-pill">
          <span className="val green">3</span>
          <span className="label">Months</span>
        </div>
        <div className="stat-pill">
          <span className="val orange">₹50K</span>
          <span className="label">Goal</span>
        </div>
      </div>

      <h2 className="section-title">Next Action</h2>
      <div className="next-action">
        <div className="icon"><Send size={20} /></div>
        <div className="body">
          <h4>Send follow-up to Client 2</h4>
          <p>Your Day-14 script is ready • ~15 min</p>
        </div>
        <button className="btn">Do it</button>
      </div>

      <div className="confidence-card">
        <div className="header">
          <h4>Confidence Level</h4>
          <span className="val">7 / 10</span>
        </div>
        <div className="slider-track">
          <div className="slider-fill"></div>
          <div className="slider-thumb"></div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', margin: '20px 0' }}>
        <div style={{ background: 'var(--white)', borderRadius: '16px', padding: '16px 12px', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
          <Zap size={20} style={{ color: 'var(--orange)', marginBottom: '8px' }} />
          <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-dark)' }}>12</div>
          <div style={{ fontSize: '11px', color: 'var(--text-mid)' }}>DMs Sent</div>
        </div>
        <div style={{ background: 'var(--white)', borderRadius: '16px', padding: '16px 12px', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
          <Users size={20} style={{ color: 'var(--teal)', marginBottom: '8px' }} />
          <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-dark)' }}>3</div>
          <div style={{ fontSize: '11px', color: 'var(--text-mid)' }}>Prospects</div>
        </div>
        <div style={{ background: 'var(--white)', borderRadius: '16px', padding: '16px 12px', textAlign: 'center', boxShadow: 'var(--shadow)' }}>
          <TrendingUp size={20} style={{ color: '#22C55E', marginBottom: '8px' }} />
          <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-dark)' }}>1</div>
          <div style={{ fontSize: '11px', color: 'var(--text-mid)' }}>Proposals</div>
        </div>
      </div>

      <h2 className="section-title">Your Day-9 Plan</h2>
      <div className="plan-grid">
        <div className="plan-card cream">
          <h4><CheckCircle2 size={16} /> Day 1 Complete</h4>
          <p>- Update LinkedIn<br />Profile - 20 min</p>
        </div>
        <div className="plan-card teal">
          <h4>Day 9 ✓ <span className="milestone-badge">MILESTONE</span></h4>
          <p>- Proposal Sent! - ⭐</p>
        </div>
        <div className="plan-card cream">
          <h4><CheckCircle2 size={16} /> Day 4 Complete</h4>
          <p>- Send First DMs<br />- 20 min</p>
        </div>
        <div className="plan-card teal">
          <h4>Days 10-30</h4>
          <p>Extended Plan</p>
          <button className="btn-outline">View Plan</button>
        </div>
      </div>
    </>
  );
}

export default function App() {
  const [activeScreen, setActiveScreen] = useState('screen-login');
  const [activeNav, setActiveNav] = useState('home');
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [theme, setTheme] = useState('light');
  const [toastMessage, setToastMessage] = useState(null);
  const [showReminder, setShowReminder] = useState(false);
  const [user, setUser] = useState(null);
  const [logAmount, setLogAmount] = useState('');

  // Listen for Supabase auth state changes
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setActiveScreen('screen-home');
        // Fire webhook on login
        callWebhook({
          event: 'user_login',
          email: session.user.email,
          name: session.user.user_metadata?.full_name,
          userId: session.user.id,
        });
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setActiveScreen('screen-home');
        setActiveNav('home');
        if (_event === 'SIGNED_IN') {
          callWebhook({
            event: 'user_login',
            email: session.user.email,
            name: session.user.user_metadata?.full_name,
            userId: session.user.id,
          });
        }
      } else {
        setUser(null);
        setActiveScreen('screen-login');
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
          <HomeScreen onOpenLog={() => setIsLogOpen(true)} user={user} />
        )}
        {activeScreen === 'screen-copilot' && <CopilotScreen showToast={showToast} user={user} />}
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
            <span>Home</span>
          </div>
          <div className={`nav-item ${activeNav === 'copilot' ? 'active' : ''}`} onClick={() => navigate('screen-copilot', 'copilot')}>
            <Calendar size={22} />
            <span>Co-Pilot</span>
          </div>
          <div className="nav-plus" onClick={() => setIsLogOpen(true)}>
            <Plus size={22} />
          </div>
          <div className={`nav-item ${activeNav === 'cohort' ? 'active' : ''}`} onClick={() => navigate('screen-cohort', 'cohort')}>
            <BarChart2 size={22} />
            <span>Cohort</span>
          </div>
          <div className={`nav-item ${activeNav === 'profile' ? 'active' : ''}`} onClick={() => navigate('screen-profile', 'profile')}>
            <User size={22} />
            <span>Profile</span>
          </div>
        </div>
      )}
    </div>
  );
}
