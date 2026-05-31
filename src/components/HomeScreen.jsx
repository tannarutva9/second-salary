import React, { useState, useEffect } from 'react';
import { Send, Zap, Users, TrendingUp, CheckCircle2 } from 'lucide-react';
import { supabase } from '../supabaseClient';

const CIRCUMFERENCE = 251.2; // 2π × r40

function StatPill({ value, label, color = 'orange' }) {
  return (
    <div className="stat-pill">
      <span className={`val ${color}`}>{value}</span>
      <span className="label">{label}</span>
    </div>
  );
}

function ToolItem({ title, subtitle, content }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ borderBottom: '1px solid var(--border)', paddingBottom: '16px', marginBottom: '16px' }}>
      <div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
        onClick={() => setOpen(!open)}
      >
        <div>
          <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-dark)' }}>{title}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-mid)', marginTop: '2px' }}>{subtitle}</div>
        </div>
        <span style={{ color: 'var(--text-mid)', fontSize: '18px' }}>{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div style={{ marginTop: '12px', background: 'var(--bg)', borderRadius: '10px', padding: '14px' }}>
          <pre style={{
            whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: '13px',
            color: 'var(--text-dark)', lineHeight: '1.7', margin: 0,
          }}>
            {content}
          </pre>
          <button
            onClick={handleCopy}
            style={{
              marginTop: '10px', display: 'flex', alignItems: 'center', gap: '6px',
              background: copied ? 'var(--teal)' : 'white',
              color: copied ? 'white' : 'var(--text-mid)',
              border: '1.5px solid var(--border)', borderRadius: '8px',
              padding: '7px 14px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
            }}
          >
            {copied ? '✓ Copied!' : '📋 Copy'}
          </button>
        </div>
      )}
    </div>
  );
}

function CheckInItem({ dayNumber, status, returnResponse, agentNotes }) {
  const [open, setOpen] = useState(false);

  const preview = returnResponse
    ? returnResponse.substring(0, 60) + (returnResponse.length > 60 ? '…' : '')
    : 'No response recorded';

  return (
    <div
      style={{
        background: 'var(--white)', borderRadius: '14px',
        boxShadow: 'var(--shadow-sm)',
        borderLeft: status === 'complete' ? '3px solid var(--teal)' : '3px solid var(--border)',
        overflow: 'hidden', cursor: 'pointer',
      }}
      onClick={() => setOpen(!open)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--teal)' }}>
              Day {dayNumber} {status === 'complete' ? '✓' : ''}
            </span>
          </div>
          {!open && (
            <p style={{
              fontSize: '13px', color: 'var(--text-mid)', margin: 0, lineHeight: '1.4',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {preview}
            </p>
          )}
        </div>
        <span style={{ color: 'var(--text-mid)', fontSize: '16px', marginLeft: '12px', flexShrink: 0 }}>
          {open ? '▲' : '▼'}
        </span>
      </div>

      {open && (
        <div style={{ padding: '0 16px 16px', borderTop: '1px solid var(--border)' }}>
          {returnResponse && (
            <div style={{ marginTop: '14px' }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-mid)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                You said
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-dark)', margin: 0, lineHeight: '1.6', background: 'var(--bg)', borderRadius: '10px', padding: '10px 12px' }}>
                "{returnResponse}"
              </p>
            </div>
          )}
          {agentNotes && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-mid)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '6px' }}>
                Coach replied
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-dark)', margin: 0, lineHeight: '1.6', borderLeft: '3px solid var(--orange)', paddingLeft: '12px' }}>
                {agentNotes}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function DayPlanGrid({ tasks, completedDays, dayNumber, day9Hit, onOpenCopilot }) {
  if (!tasks.length) return null;

  const completed = tasks.filter(t => completedDays.has(t.day_number));
  const lastCompleted = completed[completed.length - 1];
  const firstCompleted = completed[0];
  const day9Task = tasks.find(t => t.is_day9_milestone);
  const currentTask = tasks.find(t => t.day_number === Math.min(dayNumber, 9) && !completedDays.has(t.day_number));

  const cards = [];

  if (firstCompleted) {
    cards.push(
      <div key="first" className="plan-card cream">
        <h4><CheckCircle2 size={16} /> Day {firstCompleted.day_number} Complete</h4>
        <p>{firstCompleted.title}</p>
      </div>
    );
  } else if (currentTask) {
    cards.push(
      <div key="current" className="plan-card cream">
        <h4>Day {currentTask.day_number} — Today</h4>
        <p>{currentTask.title}</p>
      </div>
    );
  }

  if (day9Task) {
    cards.push(
      <div
        key="day9"
        className="plan-card teal"
        onClick={!day9Hit ? onOpenCopilot : undefined}
        style={{ cursor: day9Hit ? 'default' : 'pointer' }}
      >
        <h4>
          Day 9 {day9Hit ? '✓' : ''}
          <span className="milestone-badge">MILESTONE</span>
        </h4>
        <p>{day9Hit ? 'First project closed ✓' : 'Close your first project'}</p>
        {!day9Hit && (
          <p style={{ fontSize: '12px', marginTop: '6px', opacity: 0.8 }}>
            Tap to check in →
          </p>
        )}
      </div>
    );
  }

  if (lastCompleted && lastCompleted.day_number !== firstCompleted?.day_number) {
    cards.push(
      <div key="last" className="plan-card cream">
        <h4><CheckCircle2 size={16} /> Day {lastCompleted.day_number} Complete</h4>
        <p>{lastCompleted.title}</p>
      </div>
    );
  } else {
    const nextPending = tasks.find(t => !completedDays.has(t.day_number) && t.day_number > (currentTask?.day_number || 0));
    if (nextPending) {
      cards.push(
        <div key="next" className="plan-card cream">
          <h4>Day {nextPending.day_number} — Next</h4>
          <p>{nextPending.title}</p>
        </div>
      );
    }
  }

  cards.push(
    <div key="extended" className="plan-card teal" style={{ opacity: 0.7 }}>
      <h4>Days 10–30</h4>
      <p>Extended plan unlocks after Day 9</p>
      <p style={{ fontSize: '11px', marginTop: '4px', opacity: 0.75 }}>
        Complete your first project to continue
      </p>
    </div>
  );

  return (
    <div className="plan-grid">
      {cards.slice(0, 4)}
    </div>
  );
}

export default function HomeScreen({ onOpenLog, user, onOpenCopilot, refreshKey }) {
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);

  const displayName = (user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there').split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    if (!user?.id) return;
    load();
  }, [user?.id, refreshKey]);

  const load = async () => {
    setLoading(true);

    const [userRes, sessionRes] = await Promise.all([
      supabase.from('users')
        .select('total_earned, day9_milestone_hit, created_at, path_assigned')
        .eq('id', user.id)
        .single(),
      supabase.from('sessions')
        .select('created_at, output_generated, day1_recipient')
        .eq('user_id', user.id)
        .eq('agent', 'path_1')
        .maybeSingle(),
    ]);

    const u = userRes.data || {};
    const s = sessionRes.data || {};
    const path = u.path_assigned || 'path_1';

    const sessionStart = s.created_at
      ? new Date(s.created_at)
      : new Date(u.created_at || Date.now());
    const dayNumber = Math.max(1, Math.min(30,
      Math.floor((Date.now() - sessionStart) / 86400000) + 1
    ));
    const monthsActive = Math.max(1,
      Math.floor((Date.now() - new Date(u.created_at || Date.now())) / (86400000 * 30))
    );

    let serviceCard = null;
    if (s.output_generated) {
      try {
        serviceCard = typeof s.output_generated === 'string'
          ? JSON.parse(s.output_generated)
          : s.output_generated;
      } catch {}
    }

    const goalAmount = serviceCard?.price || 0;
    const totalEarned = u.total_earned || 0;
    const progressPct = goalAmount > 0
      ? Math.min(100, Math.round((totalEarned / goalAmount) * 100))
      : 0;

    const [progressRes, tasksRes, toolkitRes, recentProgressRes] = await Promise.all([
      supabase.from('daily_progress')
        .select('status, day_number, task_id')
        .eq('user_id', user.id)
        .eq('path', path),
      supabase.from('daily_tasks')
        .select('id, day_number, title, is_day9_milestone, action_type, milestone_type, branch_type')
        .eq('path', path)
        .lte('day_number', 9)
        .order('day_number', { ascending: true }),
      supabase.from('protection_toolkit')
        .select('tool_type, title, content')
        .eq('applicable_path', 'path_1')
        .eq('is_active', true),
      supabase.from('daily_progress')
        .select('day_number, status, return_response, agent_notes')
        .eq('user_id', user.id)
        .eq('path', path)
        .order('day_number', { ascending: false })
        .limit(5),
    ]);

    const progress = progressRes.data || [];
    const tasks = tasksRes.data || [];
    const toolkit = toolkitRes.data || [];
    const recentProgress = recentProgressRes.data || [];

    // Filter out branch tasks — only show universal tasks (branch_type null)
    // Branch tasks are only relevant inside the daily loop agent, not on the dashboard
    const universalTasks = tasks.filter(t => t.branch_type === null);

    const taskById = {};
    universalTasks.forEach(t => { taskById[t.id] = t; });

    const completedProgress = progress.filter(p => p.status === 'complete');

    const dmsSent = completedProgress.filter(p => taskById[p.task_id]?.action_type === 'send_message').length;
    const pipeline = completedProgress.filter(p => taskById[p.task_id]?.milestone_type === 'pitch_sent').length;
    const proposals = completedProgress.filter(p => taskById[p.task_id]?.milestone_type === 'contract_sent').length;

    const completedDays = new Set(completedProgress.map(p => p.day_number));
    // First look for today's task if not complete
    // Then fall back to the next upcoming incomplete task
    // Never show a past day as "next action" — that's confusing
    const pendingTask =
      universalTasks.find(t => t.day_number === Math.min(dayNumber, 9) && !completedDays.has(t.day_number)) ||
      universalTasks.find(t => t.day_number > Math.min(dayNumber, 9) && !completedDays.has(t.day_number)) ||
      null;

    // Task is actionable only if it's for today or an overdue day
    const taskIsToday = pendingTask ? pendingTask.day_number <= dayNumber : false;

    setDashData({
      totalEarned, goalAmount, progressPct,
      dayNumber, monthsActive,
      day9Hit: u.day9_milestone_hit || false,
      dmsSent, pipeline, proposals,
      serviceCard, tasks: universalTasks, completedDays,
      toolkit, recentProgress,
      nextTask: pendingTask || universalTasks.find(t => t.day_number === Math.min(dayNumber, 9)),
      taskIsToday,
      recipient: s.day1_recipient,
    });

    setLoading(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p style={{ color: 'var(--text-mid)', fontSize: '14px' }}>Loading your dashboard…</p>
      </div>
    );
  }

  const {
    totalEarned, goalAmount, progressPct,
    dayNumber, monthsActive, day9Hit,
    dmsSent, pipeline, proposals,
    serviceCard, tasks, completedDays, nextTask, recipient,
    toolkit, recentProgress, taskIsToday,
  } = dashData;

  const goalLabel = goalAmount > 0
    ? `₹${goalAmount >= 1000 ? `${Math.round(goalAmount / 1000)}K` : goalAmount}`
    : '—';

  return (
    <>
      {/* Header */}
      <div className="top-header">
        <div className="avatar">{displayName[0]?.toUpperCase()}</div>
        <div className="greeting">{greeting}, {displayName} 👋</div>
        <h1>Let's keep <span>earning more</span></h1>
      </div>

      {/* Hero card */}
      <div className="hero-card">
        <div className="hero-text">
          <p>Total ₹ Earned</p>
          <div className="hero-amount">₹{totalEarned.toLocaleString('en-IN')}</div>
          <button className="hero-btn" onClick={onOpenLog}>Log Earnings</button>
        </div>
        <div className="circular-progress">
          <svg viewBox="0 0 100 100">
            <circle className="ring-bg" cx="50" cy="50" r="40" />
            <circle
              className="ring-fill"
              cx="50" cy="50" r="40"
              style={{ strokeDashoffset: CIRCUMFERENCE * (1 - progressPct / 100) }}
            />
          </svg>
          <div className="pct">{progressPct}%</div>
        </div>
      </div>

      {/* Stat pills */}
      <div className="stat-row">
        <StatPill value={`Day ${dayNumber}`} label="Day" color="orange" />
        <StatPill value={day9Hit ? 'Day 9 ✓' : 'Day 9'} label="Plan" color={day9Hit ? 'teal' : 'orange'} />
        <StatPill value={monthsActive} label="Months" color="green" />
        <StatPill value={goalLabel} label="Goal" color="orange" />
      </div>

      {/* Next Action */}
      <h2 className="section-title">Next Action</h2>
      <div className="next-action">
        <div className="icon"><Send size={20} /></div>
        <div className="body">
          <h4>
            {nextTask
              ? (nextTask.day_number === 1 && recipient
                  ? `Send pitch to ${recipient}${serviceCard?.service_name ? ` — ${serviceCard.service_name}` : ''}`
                  : `${nextTask.title}${recipient ? ` — ${recipient}` : ''}`)
              : "Today's daily check-in"}
          </h4>
          <p>{nextTask ? `Day ${nextTask.day_number} task` : `Day ${dayNumber}`}</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
          <button
            className="btn"
            onClick={taskIsToday ? onOpenCopilot : undefined}
            disabled={!taskIsToday}
            style={{ opacity: taskIsToday ? 1 : 0.45, cursor: taskIsToday ? 'pointer' : 'not-allowed' }}
          >
            Do it →
          </button>
          {!taskIsToday && (
            <span style={{ fontSize: '10px', color: 'var(--text-mid)', fontWeight: '600', textAlign: 'right' }}>
              Come back tomorrow
            </span>
          )}
        </div>
      </div>

      {/* Service Card Summary */}
      {serviceCard && (
        <div className="confidence-card">
          <div className="header">
            <h4>Your Service</h4>
            <span className="val">₹{serviceCard.price?.toLocaleString('en-IN')}</span>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--text-dark)', fontWeight: '600', marginTop: '6px' }}>
            {serviceCard.service_name}
          </div>
          {serviceCard.delivery_days && (
            <div style={{ fontSize: '12px', color: 'var(--text-light)', marginTop: '4px' }}>
              {serviceCard.delivery_days}-day delivery · {serviceCard.ideal_client}
            </div>
          )}
        </div>
      )}

      {/* Your Tools — pitch email + protection toolkit */}
      {(serviceCard?.pitch_email || toolkit.length > 0) && (
        <>
          <h2 className="section-title">Your Tools</h2>
          <div className="confidence-card">
            {serviceCard?.pitch_email && (
              <ToolItem
                title="Your Pitch Email"
                subtitle={`To: ${recipient || 'your contact'}`}
                content={serviceCard.pitch_email.body || serviceCard.pitch_email}
              />
            )}
            {toolkit.map((tool, i) => (
              <ToolItem
                key={i}
                title={tool.title}
                subtitle={
                  tool.tool_type === 'contract_template' ? 'Contract Template' :
                  tool.tool_type === 'scope_creep_script' ? 'Scope Creep Script' :
                  tool.tool_type === 'ghosting_playbook' ? 'Ghosting Playbook' :
                  tool.tool_type
                }
                content={tool.content}
              />
            ))}
          </div>
        </>
      )}

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', margin: '20px 0' }}>
        {[
          { icon: <Zap size={20} style={{ color: 'var(--orange)' }} />, value: dmsSent, label: 'DMs Sent' },
          { icon: <Users size={20} style={{ color: 'var(--teal)' }} />, value: pipeline, label: 'Pipeline' },
          { icon: <TrendingUp size={20} style={{ color: '#22C55E' }} />, value: proposals, label: 'Proposals' },
        ].map(({ icon, value, label }) => (
          <div key={label} style={{
            background: 'var(--white)', borderRadius: '16px', padding: '16px 12px',
            textAlign: 'center', boxShadow: 'var(--shadow-sm)',
          }}>
            <div style={{ marginBottom: '8px' }}>{icon}</div>
            <div style={{ fontSize: '18px', fontWeight: '800', color: 'var(--text-dark)' }}>{value}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-mid)' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Day Plan Grid */}
      <h2 className="section-title">Your Day-9 Plan</h2>
      <DayPlanGrid
        tasks={tasks}
        completedDays={completedDays}
        dayNumber={dayNumber}
        day9Hit={day9Hit}
        onOpenCopilot={onOpenCopilot}
      />

      {/* Recent Check-ins */}
      {recentProgress.length > 0 && (
        <>
          <h2 className="section-title">Recent Check-ins</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            {recentProgress.map((p, i) => (
              <CheckInItem
                key={i}
                dayNumber={p.day_number}
                status={p.status}
                returnResponse={p.return_response}
                agentNotes={p.agent_notes}
              />
            ))}
          </div>
        </>
      )}
    </>
  );
}
