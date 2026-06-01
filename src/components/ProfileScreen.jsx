import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function ProfileScreen({ theme, setTheme, showToast, user, onLogout }) {
  const [activeTab, setActiveTab] = useState('profile');
  const [name, setName] = useState(user?.user_metadata?.full_name || '');
  const [niche, setNiche] = useState('');
  const [notificationTime, setNotificationTime] = useState('20:00');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    supabase.from('users')
      .select('role, notification_time')
      .eq('id', user.id)
      .single()
      .then(({ data }) => {
        if (data?.role) setNiche(data.role);
        if (data?.notification_time) setNotificationTime(data.notification_time.substring(0, 5));
      });
  }, [user?.id]);

  const handleSaveProfile = async () => {
    await supabase.from('users')
      .update({ role: niche, notification_time: notificationTime + ':00' })
      .eq('id', user.id);
    showToast('✅ Profile Updated!');
  };

  const handlePasswordChange = async () => {
    if (!newPassword || newPassword.length < 6) {
      showToast('❌ Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      showToast('❌ Passwords do not match');
      return;
    }
    setPasswordLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setPasswordLoading(false);
    if (error) {
      showToast('❌ ' + error.message);
    } else {
      showToast('🔒 Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
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
    <div style={{ paddingBottom: '120px' }}>
      {/* Profile Hero */}
      <div style={{ padding: '52px 24px 24px', background: 'var(--white)' }}>
        <div style={{
          width: '64px', height: '64px', borderRadius: '50%',
          background: 'var(--teal)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontWeight: '800', fontSize: '24px',
          marginBottom: '12px',
          boxShadow: '0 4px 12px rgba(27,77,87,0.3)',
        }}>
          {(name || user?.email || 'U')[0].toUpperCase()}
        </div>
        <h1 style={{ fontSize: '22px', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '2px' }}>
          {name || 'Your Name'}
        </h1>
        <p style={{ fontSize: '13px', color: 'var(--text-light)', fontWeight: '500' }}>
          {user?.email}
        </p>
      </div>

      <div style={{ padding: '0 24px' }}>
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

          <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-mid)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Daily Reminder Time</label>
          <input type="time" value={notificationTime} onChange={e => setNotificationTime(e.target.value)} style={inputStyle} />
          <p style={{ fontSize: '12px', color: 'var(--text-mid)', marginTop: '-10px', marginBottom: '16px' }}>
            We'll remind you to check in at this time each day.
          </p>

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
          <input type="password" placeholder="••••••••" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} style={inputStyle} />
          <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-mid)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>New Password</label>
          <input type="password" placeholder="••••••••" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={inputStyle} />
          <label style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-mid)', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Confirm New Password</label>
          <input type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={inputStyle} />
          <button
            className="hero-btn"
            style={{ width: '100%', padding: '16px', borderRadius: '14px', opacity: passwordLoading ? 0.7 : 1 }}
            onClick={handlePasswordChange}
            disabled={passwordLoading}
          >
            {passwordLoading ? 'Updating…' : 'Update Password'}
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
    </div>
  );
}
