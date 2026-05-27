import React, { useState } from 'react';

export default function CopilotScreen({ showToast }) {
  const [activeTab, setActiveTab] = useState('proposal');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = (msg) => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      showToast(msg);
    }, 2500);
  };

  return (
    <div style={{ padding: '40px 24px' }}>
      <h1 className="section-title" style={{ margin: '0 0 8px 0', fontSize: '26px' }}>AI Co-Pilot</h1>
      <p style={{ fontSize: '14px', color: 'var(--text-mid)', marginBottom: '24px' }}>Your AI assistant for consulting tasks.</p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', overflowX: 'auto' }}>
        <button 
          onClick={() => setActiveTab('proposal')}
          style={{ padding: '10px 16px', borderRadius: '20px', border: '1.5px solid var(--border)', background: activeTab === 'proposal' ? 'var(--teal)' : 'var(--white)', color: activeTab === 'proposal' ? 'white' : 'var(--text-mid)', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          Proposal Builder
        </button>
        <button 
          onClick={() => setActiveTab('contract')}
          style={{ padding: '10px 16px', borderRadius: '20px', border: '1.5px solid var(--border)', background: activeTab === 'contract' ? 'var(--teal)' : 'var(--white)', color: activeTab === 'contract' ? 'white' : 'var(--text-mid)', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          Contract Builder
        </button>
        <button 
          onClick={() => setActiveTab('pricing')}
          style={{ padding: '10px 16px', borderRadius: '20px', border: '1.5px solid var(--border)', background: activeTab === 'pricing' ? 'var(--teal)' : 'var(--white)', color: activeTab === 'pricing' ? 'white' : 'var(--text-mid)', fontWeight: '600', cursor: 'pointer', whiteSpace: 'nowrap' }}
        >
          Pricing Calc
        </button>
      </div>

      {activeTab === 'proposal' && (
        <div className={`confidence-card ${isGenerating ? 'skeleton' : ''}`}>
          <h4>Proposal Generator</h4>
          <p style={{ fontSize: '13px', color: 'var(--text-mid)', marginTop: '8px', marginBottom: '16px' }}>Input client details and we will generate a high-converting proposal.</p>
          <input type="text" placeholder="Client Name" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid var(--border)', marginBottom: '12px', background: 'var(--white)', color: 'inherit' }} />
          <textarea placeholder="Project Scope..." rows={4} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid var(--border)', marginBottom: '16px', background: 'var(--white)', color: 'inherit' }}></textarea>
          <button className="hero-btn" style={{ width: '100%' }} onClick={() => handleGenerate("✨ AI Proposal Drafted!")}>Generate Draft</button>
        </div>
      )}

      {activeTab === 'contract' && (
        <div className={`confidence-card ${isGenerating ? 'skeleton' : ''}`}>
          <h4>Contract Clauses</h4>
          <p style={{ fontSize: '13px', color: 'var(--text-mid)', marginTop: '8px', marginBottom: '16px' }}>Generate protective legal clauses for your consulting agreement.</p>
          <button className="hero-btn" style={{ width: '100%' }} onClick={() => handleGenerate("⚖️ Clauses Generated!")}>Generate Clauses</button>
        </div>
      )}

      {activeTab === 'pricing' && (
        <div className={`confidence-card ${isGenerating ? 'skeleton' : ''}`}>
          <h4>Pricing Calculator</h4>
          <p style={{ fontSize: '13px', color: 'var(--text-mid)', marginTop: '8px', marginBottom: '16px' }}>Calculate your baseline hourly or retainer rate.</p>
          <input type="number" placeholder="Target Monthly Income (₹)" style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1.5px solid var(--border)', marginBottom: '12px', background: 'var(--white)', color: 'inherit' }} />
          <button className="hero-btn" style={{ width: '100%' }} onClick={() => handleGenerate("💰 Pricing Calculated!")}>Calculate</button>
        </div>
      )}
    </div>
  );
}
