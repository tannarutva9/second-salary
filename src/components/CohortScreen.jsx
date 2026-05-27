import React, { useState } from 'react';

export default function CohortScreen() {
  const [messages, setMessages] = useState([
    { sender: 'Ravi', text: 'Just landed my first client using the day-9 proposal!', verified: true },
    { sender: 'Anita', text: 'Struggling with pricing. Any tips for retainer models?', verified: false }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { sender: 'You', text: input, verified: false }]);
      setInput('');
    }
  };

  return (
    <div style={{ padding: '40px 24px', display: 'flex', flexDirection: 'column', height: '100vh', paddingBottom: '100px' }}>
      <h1 className="section-title" style={{ margin: '0 0 8px 0', fontSize: '26px' }}>Peer Cohort</h1>
      <p style={{ fontSize: '14px', color: 'var(--text-mid)', marginBottom: '24px' }}>Learn from others in the same stage.</p>

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.map((m, i) => (
          <div key={i} className="confidence-card" style={{ margin: 0, background: m.sender === 'You' ? 'var(--teal)' : 'var(--white)', color: m.sender === 'You' ? 'white' : 'var(--text-dark)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <strong style={{ fontSize: '13px' }}>{m.sender} {m.verified && '✓'}</strong>
            </div>
            <p style={{ fontSize: '14px', color: m.sender === 'You' ? 'white' : 'var(--text-mid)' }}>{m.text}</p>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the cohort..." 
          style={{ flex: 1, padding: '14px', borderRadius: '12px', border: '1.5px solid var(--border)' }}
        />
        <button className="hero-btn" onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
