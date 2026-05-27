import React from 'react';

export default function SpecsScreen() {
  return (
    <div style={{ padding: '40px 24px' }}>
      <h1 className="section-title" style={{ margin: '0 0 8px 0', fontSize: '26px' }}>Targeter & Specs</h1>
      <p style={{ fontSize: '14px', color: 'var(--text-mid)', marginBottom: '24px' }}>Manage your channel specs and metrics.</p>
      
      <div className="confidence-card">
        <h4>Channel Targeter</h4>
        <p style={{ fontSize: '13px', color: 'var(--text-mid)', marginTop: '8px' }}>View your primary distribution channels.</p>
        <button className="hero-btn" style={{ marginTop: '16px', width: '100%' }}>View Channels</button>
      </div>

      <div className="confidence-card">
        <h4>The 8 Capabilities</h4>
        <p style={{ fontSize: '13px', color: 'var(--text-mid)', marginTop: '8px' }}>Your core service offerings.</p>
        <button className="hero-btn" style={{ marginTop: '16px', width: '100%' }}>View Capabilities</button>
      </div>
    </div>
  );
}
