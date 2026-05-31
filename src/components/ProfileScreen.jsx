import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function ProfileScreen({ theme, setTheme, showToast, user, onLogout }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState(user?.user_metadata?.full_name || '');
  const [niche, setNiche] = useState('');

  useEffect(() => {
    if (!user?.id) return;
    supabase.from('users')
      .select('role')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.role) setNiche(data.role);
      });
  }, [user?.id]);

  const handleSaveProfile = async () => {
    await supabase.from('users')
      .update({ role: niche })
      .eq('id', user.id);
    showToast('✅ Profile Updated!');
  };

  const tabStyle = (tab) => ({
    padding: '10px 18px',
    borderRadius: '20px',
    border: '1.5px solid var(--border)',
    background: activeTab === tab ? 'var(--teal)' : (theme === 'dark' ? 'var(--cream)' : 'var(--white)'),
    color: activeTab === tab ? 'white' : 'var(--text-mid)',
    fontWeight: '700',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    fontSize: '13px',
    transition: 'all 0.2s ease',
  });

  const inputStyle = {
    width: '100%',
    padding: '14px',
    borderRadius: '12px',
    border: '1.5px solid var(--border)',
    fontSize: '15px',
    background: theme === 'dark' ? 'var(--bg)' : 'white',
    color: 'var(--text-dark)',
    marginBottom: '16px',
    outline: 'none',
    boxSizing: 'border-box',
  };

  return (
    <div style={{ padding: '48px 24px 120px' }}>
      {/* Profile Hero */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
        <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--teal), var(--orange))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', fontWeight: '800', color: 'white', flexShrink: 0 }}>
          {(name || user?.email || 'U')[0].toUpperCase()}
        </div>
        <div>
          <div style={{ fontSize: '20px', fontWeight: '800', color: 'var(--text-dark)' }}>{name || 'Your Name'}</div>
          <div style={{ fontSize: '13px', color: 'var(--text-mid)', marginTop: '2px' }}>{user?.email}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '4px' }}>
        <button style={tabStyle('profile')} onClick={() => setActiveTab('profile')}>Profile</button>
        <button style={tabStyle('security')} onClick={() => setActiveTab('security')}>Security</button>
        <button style={tabStyle('help')} onClick={() => setActiveTab('help')}>Help</button>
      </div>

      {activeTab === 'profile' && (
        <div className="confidence-card">
          <h4 style={{ marginBottom: '20px', fontSize: '17px' }}>Personal Information</h4>
          <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-mid)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} style={inputStyle} placeholder="Your full name" />

          <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-mid)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Login ID (Email)</label>
          <input type="email" value={user?.email || ''} readOnly style={{ ...inputStyle, opacity: 0.6, cursor: 'not-allowed' }} />

          <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-mid)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Consulting Niche</label>
          <input type="text" value={niche} onChange={e => setNiche(e.target.value)} style={inputStyle} placeholder="e.g. B2B SaaS Growth" />

          <button className="hero-btn" style={{ width: '100%', padding: '16px', borderRadius: '14px' }} onClick={handleSaveProfile}>
            Save Changes
          </button>
        </div>
      )}

      {activeTab === 'security' && (
        <div className="confidence-card">
          <h4 style={{ marginBottom: '20px', fontSize: '17px' }}>Appearance</h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '16px', background: theme === 'dark' ? 'var(--bg)' : '#F8FAFC', borderRadius: '12px' }}>
            <div>
              <div style={{ fontWeight: '700', fontSize: '15px', color: 'var(--text-dark)' }}>Dark Mode</div>
              <div style={{ fontSize: '12px', color: 'var(--text-mid)', marginTop: '2px' }}>Switch to dark theme</div>
            </div>
            <button
              onClick={() => { setTheme(theme === 'dark' ? 'light' : 'dark'); showToast(theme === 'dark' ? '☀️ Light Mode On' : '🌙 Dark Mode On'); }}
              style={{ background: theme === 'dark' ? 'var(--teal)' : 'var(--border)', border: 'none', borderRadius: '20px', width: '52px', height: '28px', position: 'relative', cursor: 'pointer', transition: 'background 0.3s', flexShrink: 0 }}
            >
              <div style={{ position: 'absolute', top: '4px', left: theme === 'dark' ? '28px' : '4px', width: '20px', height: '20px', background: 'white', borderRadius: '50%', transition: 'left 0.3s', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
            </button>
          </div>

          <h4 style={{ marginBottom: '16px', fontSize: '17px', borderTop: '1px solid var(--border)', paddingTop: '20px' }}>Change Password</h4>
          <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-mid)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Current Password</label>
          <input type="password" placeholder="••••••••" style={inputStyle} />
          <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-mid)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>New Password</label>
          <input type="password" placeholder="••••••••" style={inputStyle} />
          <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-mid)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Confirm New Password</label>
          <input type="password" placeholder="••••••••" style={inputStyle} />
          <button className="hero-btn" style={{ width: '100%', padding: '16px', borderRadius: '14px' }} onClick={() => showToast('🔒 Password Updated!')}>
            Update Password
          </button>
        </div>
      )}

      {activeTab === 'help' && (
        <div className="confidence-card">
          <h4 style={{ marginBottom: '20px', fontSize: '17px' }}>Help & Support</h4>
          {[
            { icon: '📖', label: 'Read FAQs', sub: 'Common questions answered' },
            { icon: '💬', label: 'Contact Support', sub: 'We reply within 24 hours' },
            { icon: '🐞', label: 'Report a Bug', sub: 'Help us improve the app' },
          ].map(item => (
            <button
              key={item.label}
              style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1.5px solid var(--border)', background: theme === 'dark' ? 'var(--bg)' : '#F8FAFC', marginBottom: '12px', cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '14px' }}
              onClick={() => showToast(`Opening ${item.label}...`)}
            >
              <span style={{ fontSize: '22px' }}>{item.icon}</span>
              <div>
                <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-dark)' }}>{item.label}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-mid)', marginTop: '2px' }}>{item.sub}</div>
              </div>
              <span style={{ marginLeft: 'auto', color: 'var(--text-light)', fontSize: '18px' }}>›</span>
            </button>
          ))}
          <button
            style={{ width: '100%', padding: '16px', borderRadius: '12px', border: '1.5px solid #FCA5A5', background: '#FEF2F2', color: '#EF4444', fontWeight: '700', cursor: 'pointer', marginTop: '8px' }}
            onClick={onLogout}
          >
            🚪 Log Out
          </button>
        </div>
      )}
    </div>
  );
}
