import React, { useState, useRef, useEffect } from 'react';
import { Send, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase, callWebhook } from '../supabaseClient';

const HANDOFF_WEBHOOK_MAP = { path_1: 'path_1' };

function parseAssistantMessage(raw) {
  const withoutExtract = raw.replace(/<EXTRACT>[\s\S]*?<\/EXTRACT>/g, '').trim();
  const cardMatch = withoutExtract.match(/<CARD>([\s\S]*?)<\/CARD>/);
  let card = null;
  let text = withoutExtract;
  if (cardMatch) {
    try { card = JSON.parse(cardMatch[1].trim()); } catch {}
    text = withoutExtract.replace(/<CARD>[\s\S]*?<\/CARD>/g, '').trim();
  }
  return { text, card };
}

function ChecklistItem({ text, positive = true }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '2px 0' }}>
      <span style={{ color: positive ? 'var(--success)' : 'var(--danger)', fontWeight: '800', flexShrink: 0 }}>
        {positive ? '✓' : '✗'}
      </span>
      <span style={{ fontSize: '13px', color: 'var(--text-dark)', lineHeight: '1.5' }}>{text}</span>
    </div>
  );
}

function PitchEmail({ email }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(email.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ marginTop: '4px' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', background: 'rgba(255,255,255,0.15)', color: 'white',
          border: '1px solid rgba(255,255,255,0.25)', borderRadius: '8px',
          padding: '10px 14px', fontSize: '13px', fontWeight: '600', cursor: 'pointer',
        }}
      >
        <span>View Pitch Email</span>
        {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
      </button>
      {open && (
        <div style={{
          marginTop: '8px', background: '#F8FAFC', border: '1px solid var(--border)',
          borderRadius: '10px', padding: '14px',
        }}>
          <pre style={{
            whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '13px',
            color: 'var(--text-dark)', lineHeight: '1.7', margin: 0,
          }}>
            {email.body}
          </pre>
          <button
            onClick={handleCopy}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px',
              background: copied ? 'var(--success)' : 'white',
              color: copied ? 'white' : 'var(--text-mid)',
              border: '1.5px solid var(--border)', borderRadius: '8px',
              padding: '7px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {copied ? <Check size={13} /> : <Copy size={13} />}
            {copied ? 'Copied!' : 'Copy Email'}
          </button>
        </div>
      )}
    </div>
  );
}

function ServiceCard({ card }) {
  return (
    <div style={{
      background: 'var(--white)', border: '1.5px solid var(--border)',
      borderRadius: '16px', overflow: 'hidden', marginTop: '8px',
      boxShadow: 'var(--shadow-md)',
    }}>
      {/* Header */}
      <div style={{ background: 'var(--teal)', padding: '16px 20px' }}>
        <div style={{ fontSize: '15px', fontWeight: '800', color: 'white', marginBottom: '8px' }}>
          {card.service_name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{
            background: 'var(--orange)', color: 'white', borderRadius: '8px',
            padding: '4px 12px', fontSize: '16px', fontWeight: '800',
          }}>
            ₹{card.price.toLocaleString('en-IN')}
          </span>
          <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', fontWeight: '500' }}>
            {card.delivery_days}-day delivery
          </span>
        </div>
        {card.pitch_email && <PitchEmail email={card.pitch_email} />}
      </div>

      {/* Body */}
      <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>
            What's Included
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {card.included.map((item, i) => <ChecklistItem key={i} text={item} positive={true} />)}
          </div>
        </div>

        {card.excluded?.length > 0 && (
          <div>
            <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-light)', textTransform: 'uppercase', letterSpacing: '0.6px', marginBottom: '8px' }}>
              Not Included
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {card.excluded.map((item, i) => <ChecklistItem key={i} text={item} positive={false} />)}
            </div>
          </div>
        )}

        {card.ideal_client && (
          <div style={{ background: 'var(--cream)', borderRadius: '10px', padding: '10px 12px' }}>
            <span style={{ fontSize: '10px', fontWeight: '700', color: 'var(--orange)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Ideal for · </span>
            <span style={{ fontSize: '13px', color: 'var(--text-dark)' }}>{card.ideal_client}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function MessageText({ text }) {
  const paragraphs = text.split(/\n{2,}/);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {paragraphs.map((para, i) => {
        const trimmed = para.trim();
        if (!trimmed) return null;
        const lines = trimmed.split('\n');

        // Persona line: single line with 2+ · separators
        const isPersona = lines.length === 1
          && (trimmed.match(/·/g) || []).length >= 2
          && !trimmed.startsWith('✓')
          && !trimmed.startsWith('Month');

        // Stats line: "Month 1: ₹X · Month 2: ₹Y"
        const isStats = /^Month \d+:/.test(trimmed) && trimmed.includes('·');

        // Block quote: starts and ends with "
        const isQuote = trimmed.startsWith('"') && trimmed.endsWith('"');

        if (isPersona) {
          return (
            <div key={i} style={{
              background: 'var(--teal)', color: 'white', borderRadius: '10px',
              padding: '8px 14px', fontSize: '13px', fontWeight: '600',
            }}>
              {trimmed}
            </div>
          );
        }

        if (isStats) {
          return (
            <div key={i} style={{
              background: 'var(--cream)', borderRadius: '10px', padding: '8px 14px',
              fontSize: '13px', fontWeight: '700', color: 'var(--teal)',
            }}>
              {trimmed}
            </div>
          );
        }

        if (isQuote) {
          return (
            <div key={i} style={{
              borderLeft: '3px solid var(--orange)', paddingLeft: '12px',
              fontStyle: 'italic', fontSize: '13px', color: 'var(--text-mid)', lineHeight: '1.6',
            }}>
              {trimmed}
            </div>
          );
        }

        const hasChecklist = lines.some(l => l.trim().startsWith('✓'));
        if (hasChecklist) {
          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {lines.map((line, j) => {
                const t = line.trim();
                if (!t) return null;
                if (t.startsWith('✓')) return <ChecklistItem key={j} text={t.replace(/^✓\s*/, '')} positive={true} />;
                return <p key={j} style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', fontWeight: '600' }}>{t}</p>;
              })}
            </div>
          );
        }

        return (
          <p key={i} style={{ margin: 0, fontSize: '14px', lineHeight: '1.6' }}>
            {lines.map((line, j) => (
              <React.Fragment key={j}>
                {line}
                {j < lines.length - 1 && <br />}
              </React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

export default function CopilotScreen({
  showToast, user,
  initialWebhook = 'router',
  mode = 'onboarding',
  copilotContext = null,
  setAgentStage, setAgentHandoff,
  setPersona, setPathAssigned,
  onNavigateToDashboard,
}) {
  const hasInitialised = useRef(false);
  const lastDayNumber = useRef(null);
  const [messages, setMessages] = useState(() => {
    if (mode === 'return' && copilotContext) {
      const { dayNumber, recipient, returnQuestion } = copilotContext;
      const greeting = `Day ${dayNumber}. ${(returnQuestion || '').replace('[recipient]', recipient || 'them')}`;
      return [{ role: 'assistant', text: greeting }];
    }
    return [{ role: 'assistant', text: "Hi! I'm your Second Salary co-pilot. Tell me about your consulting goal and I'll help you get there." }];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeWebhook, setActiveWebhook] = useState(initialWebhook);
  const [sessionComplete, setSessionComplete] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (mode === 'return' && copilotContext) {
      if (!hasInitialised.current || lastDayNumber.current !== copilotContext.dayNumber) {
        hasInitialised.current = true;
        lastDayNumber.current = copilotContext.dayNumber;
        const { dayNumber, recipient, returnQuestion } = copilotContext;
        const greeting = `Day ${dayNumber}. ${(returnQuestion || '').replace('[recipient]', recipient || 'them')}`;
        setMessages([{ role: 'assistant', text: greeting }]);
      }
    }
  }, [mode, copilotContext]);

  useEffect(() => {
    return () => {
      hasInitialised.current = false;
      lastDayNumber.current = null;
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    setMessages(prev => [...prev, { role: 'user', text }]);
    setInput('');
    setLoading(true);

    const fullName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';
    const firstName = fullName.split(' ')[0];

    const payload = (mode === 'return' && initialWebhook === 'daily_loop')
      ? {
          event: 'daily_message',
          user_id: user?.id,
          email: user?.email,
          message: text,
          timestamp: new Date().toISOString(),
        }
      : (mode === 'return' && initialWebhook === 'path_1')
      ? {
          event: 'daily_return',
          day_number: copilotContext?.dayNumber,
          user_id: user?.id,
          email: user?.email,
          message: text,
          recipient: copilotContext?.recipient,
        }
      : {
          user_id: user?.id,
          message: text,
          first_name: firstName,
        };

    const rawResponse = await callWebhook(payload, activeWebhook);

    // n8n may return a top-level array — unwrap to first item
    const response = Array.isArray(rawResponse) ? rawResponse[0] : rawResponse;

    // Router format: { message, stage, handoff, session_complete }
    // Path1 format: { output, session_complete } or { messages: [...] or "..." }
    let reply = response?.output || response?.message || response?.reply;

    if (!reply && response?.messages) {
      try {
        // messages may be a JSON string or already a parsed array
        const msgs = typeof response.messages === 'string'
          ? JSON.parse(response.messages)
          : response.messages;
        if (Array.isArray(msgs)) {
          const lastAssistant = [...msgs].reverse().find(m => m.role === 'assistant');
          if (lastAssistant) reply = typeof lastAssistant.content === 'string'
            ? lastAssistant.content
            : null;
        }
      } catch {}
    }

    // n8n sometimes returns a raw Supabase record (sessions or users table) instead of
    // a formatted message. Fetch the latest path_1 session to get the stored AI reply.
    if (!reply && activeWebhook === 'path_1') {
      try {
        const isSessionRecord = response?.agent === 'path_1' && response?.id;
        const query = isSessionRecord
          ? supabase.from('sessions').select('messages, session_complete').eq('id', response.id).single()
          : supabase.from('sessions').select('messages, session_complete').eq('user_id', user?.id).eq('agent', 'path_1').order('updated_at', { ascending: false }).limit(1).maybeSingle();

        const { data: sess } = await query;

        if (sess?.messages) {
          const msgs = typeof sess.messages === 'string'
            ? JSON.parse(sess.messages)
            : sess.messages;
          if (Array.isArray(msgs)) {
            const lastAssistant = [...msgs].reverse().find(m => m.role === 'assistant');
            if (lastAssistant?.content) {
              reply = typeof lastAssistant.content === 'string'
                ? lastAssistant.content
                : lastAssistant.content.find?.(b => b.type === 'text')?.text ?? null;
            }
          }
        }
        if (sess?.session_complete === true) setSessionComplete(true);
      } catch {}
    }

    reply = reply || "Got it! I'm working on your plan...";

    if (response?.stage != null) setAgentStage(response.stage);
    if (response?.handoff != null) setAgentHandoff(response.handoff);
    if (response?.session_complete === true) setSessionComplete(true);
    if (response?.persona != null) setPersona(response.persona);
    if (response?.path_assigned != null) setPathAssigned(response.path_assigned);

    if (response?.handoff && HANDOFF_WEBHOOK_MAP[response.handoff]) {
      setActiveWebhook(HANDOFF_WEBHOOK_MAP[response.handoff]);
    }

    setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    setLoading(false);

  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', paddingBottom: 'calc(var(--nav-h) + 16px)' }}>
      <div style={{ padding: '20px 24px 16px', background: 'var(--white)', borderBottom: '1px solid var(--border)' }}>
        <h1 className="section-title" style={{ margin: 0, fontSize: '26px' }}>Your Coach</h1>
        <p style={{ fontSize: '14px', color: 'var(--text-mid)', marginTop: '4px' }}>Check in daily. Build momentum.</p>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 140px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {messages.map((msg, i) => {
          if (msg.role === 'user') {
            return (
              <div key={i} style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <div style={{
                  maxWidth: '85%', padding: '12px 16px',
                  borderRadius: '18px 4px 18px 18px',
                  background: 'var(--teal)', color: 'white',
                  fontSize: '14px', lineHeight: '1.6',
                  marginBottom: '8px',
                }}>
                  {msg.text}
                </div>
              </div>
            );
          }

          const { text, card } = parseAssistantMessage(msg.text);
          return (
            <div key={i} style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{ maxWidth: '85%' }}>
                {text && (
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: '4px 18px 18px 18px',
                    background: 'var(--cream)', border: '1px solid var(--border)',
                    fontSize: '14px', lineHeight: '1.6', color: 'var(--text-dark)',
                    marginBottom: '8px',
                  }}>
                    <MessageText text={text} />
                  </div>
                )}
                {card && <ServiceCard card={card} />}
              </div>
            </div>
          );
        })}

        {sessionComplete && activeWebhook === 'path_1' && (
          <div style={{
            padding: '16px 24px 24px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          }}>
            <p style={{
              fontSize: '13px',
              color: 'var(--text-mid)',
              textAlign: 'center',
              margin: 0,
            }}>
              Your plan is ready. Check your dashboard.
            </p>
            <button
              onClick={onNavigateToDashboard}
              style={{
                width: '100%',
                maxWidth: '340px',
                padding: '18px',
                borderRadius: '16px',
                background: 'var(--teal)',
                border: 'none',
                color: 'white',
                fontSize: '16px',
                fontWeight: '800',
                cursor: 'pointer',
              }}
            >
              Go to Dashboard →
            </button>
          </div>
        )}

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{
              padding: '12px 16px', borderRadius: '18px 18px 18px 4px',
              background: 'var(--white)', border: '1px solid var(--border)',
              fontSize: '14px', color: 'var(--text-mid)',
            }}>
              Thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{
        position: 'fixed',
        bottom: 'var(--nav-h, 80px)',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '100%',
        maxWidth: '430px',
        padding: '12px 16px',
        background: 'var(--white)',
        borderTop: '1px solid var(--border)',
        display: 'flex', gap: '12px', alignItems: 'center',
        zIndex: 10,
      }}>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder={sessionComplete ? 'Session complete' : 'Ask your co-pilot...'}
          disabled={sessionComplete}
          style={{
            flex: 1, padding: '14px 16px', borderRadius: '12px',
            border: '1.5px solid var(--border)', fontSize: '15px',
            background: 'var(--bg)', color: 'var(--text-dark)',
          }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading || sessionComplete}
          style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'var(--teal)', border: 'none', color: 'white',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', opacity: (!input.trim() || loading) ? 0.5 : 1, flexShrink: 0,
          }}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
