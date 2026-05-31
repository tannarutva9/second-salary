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

function DayPlanGrid({ tasks, completedDays, dayNumber, day9Hit }) {
  if (!tasks.length) return null;

  const completed = tasks.filter(t => completedDays.has(t.day_number));
  const lastCompleted = completed[completed.length - 1];
  const firstCompleted = completed[0];
  const day9Task = tasks.find(t => t.is_day9_milestone);
  const currentTask = tasks.find(t => t.day_number === Math.min(dayNumber, 9) && !completedDays.has(t.day_number));

  const cards = [];

  // Card 1: first completed day or current active day
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

  // Card 2: Day 9 milestone
  if (day9Task) {
    cards.push(
      <div key="day9" className="plan-card teal">
        <h4>
          Day 9 {day9Hit ? '✓' : ''}
          <span className="milestone-badge">MILESTONE</span>
        </h4>
        <p>{day9Hit ? day9Task.title : 'Close your first project'}</p>
      </div>
    );
  }

  // Card 3: last completed (if different from first) or next pending
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

  // Card 4: extended plan
  cards.push(
    <div key="extended" className="plan-card teal">
      <h4>Days 10–30</h4>
      <p>Extended Plan</p>
      <button className="btn-outline">View Plan</button>
    </div>
  );

  return (
    <div className="plan-grid">
      {cards.slice(0, 4)}
    </div>
  );
}

export default function HomeScreen({ onOpenLog, user, onOpenCopilot }) {
  const [dashData, setDashData] = useState(null);
  const [loading, setLoading] = useState(true);

  const displayName = (user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'there').split(' ')[0];
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    if (!user?.id) return;
    load();
  }, [user?.id]);

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
        .single(),
    ]);

    const u = userRes.data || {};
    const s = sessionRes.data || {};
    const path = u.path_assigned || 'path_1';

    const sessionStart = s.created_at ? new Date(s.created_at) : new Date(u.created_at || Date.now());
    const dayNumber = Math.max(1, Math.min(30, Math.floor((Date.now() - sessionStart) / 86400000) + 1));
    const monthsActive = Math.max(1, Math.floor((Date.now() - new Date(u.created_at || Date.now())) / (86400000 * 30)));

    const serviceCard = s.output_generated || null;
    const goalAmount = serviceCard?.price || 0;
    const totalEarned = u.total_earned || 0;
    const progressPct = goalAmount > 0 ? Math.min(100, Math.round((totalEarned / goalAmount) * 100)) : 0;

    const [progressRes, tasksRes] = await Promise.all([
      supabase.from('daily_progress')
        .select('status, milestone_type, day_number, task_id')
        .eq('user_id', user.id),
      supabase.from('daily_tasks')
        .select('id, day_number, title, is_day9_milestone')
        .eq('path', path)
        .is('branch_type', null)
        .lte('day_number', 9)
        .order('day_number', { ascending: true }),
    ]);

    const progress = progressRes.data || [];
    const tasks = tasksRes.data || [];

    const dmsSent = progress.filter(p => p.status === 'complete').length;
    const pipeline = progress.filter(p => p.milestone_type === 'pitch_sent' && p.status === 'complete').length;
    const proposals = progress.filter(p => p.milestone_type === 'contract_sent' && p.status === 'complete').length;
    const completedDays = new Set(progress.filter(p => p.status === 'complete').map(p => p.day_number));

    const pendingTask = tasks.find(t => !completedDays.has(t.day_number) && t.day_number <= dayNumber);

    setDashData({
      totalEarned, goalAmount, progressPct,
      dayNumber, monthsActive,
      day9Hit: u.day9_milestone_hit || false,
      dmsSent, pipeline, proposals,
      serviceCard, tasks, completedDays,
      nextTask: pendingTask || tasks.find(t => t.day_number === Math.min(dayNumber, 9)),
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
      {nextTask && (
        <>
          <h2 className="section-title">Next Action</h2>
          <div className="next-action">
            <div className="icon"><Send size={20} /></div>
            <div className="body">
              <h4>
                {nextTask.day_number === 1 && recipient
                  ? `Send pitch to ${recipient}${serviceCard?.service_name ? ` — ${serviceCard.service_name}` : ''}`
                  : `${nextTask.title}${recipient ? ` — ${recipient}` : ''}`}
              </h4>
              <p>Day {nextTask.day_number} task</p>
            </div>
            <button className="btn" onClick={onOpenCopilot}>Do it</button>
          </div>
        </>
      )}

      {/* Service Card Summary (replaces confidence slider) */}
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
      />
    </>
  );
}
