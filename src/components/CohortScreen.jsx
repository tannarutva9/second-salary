import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function CohortScreen({ user }) {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);

    const { data: userData } = await supabase
      .from('users')
      .select('path_assigned')
      .eq('id', user?.id)
      .single();

    const path = userData?.path_assigned || 'path_1';

    const { data } = await supabase
      .from('peer_proof')
      .select('first_name, age, role, city, month_1_income, month_2_income, quote, path_used, still_active, context')
      .eq('path', path)
      .limit(10);

    setStories(data || []);
    setLoading(false);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <p style={{ color: 'var(--text-mid)', fontSize: '14px' }}>Loading stories…</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 24px 120px' }}>
      <h1 style={{ fontSize: '26px', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '6px' }}>
        Peer Stories
      </h1>
      <p style={{ fontSize: '14px', color: 'var(--text-mid)', marginBottom: '24px' }}>
        People who started exactly where you are.
      </p>

      {stories.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-mid)' }}>
          <p>Stories coming soon.</p>
          <p style={{ fontSize: '13px', marginTop: '8px' }}>
            Be one of the first to complete Day 9 and your story will appear here.
          </p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {stories.map((s, i) => (
          <div key={i} style={{
            background: 'var(--white)', borderRadius: '18px',
            padding: '20px', boxShadow: 'var(--shadow-sm)',
            border: '1px solid var(--border)',
          }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px', height: '42px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--teal), var(--orange))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '18px', fontWeight: '800', color: 'white', flexShrink: 0,
                }}>
                  {s.first_name?.[0] || '?'}
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--text-dark)' }}>
                    {s.first_name}{s.age ? `, ${s.age}` : ''}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-mid)' }}>
                    {s.role} · {s.city}
                  </div>
                </div>
              </div>
              {s.still_active && (
                <span style={{
                  background: 'var(--cream)', color: 'var(--teal)',
                  fontSize: '11px', fontWeight: '700', padding: '4px 10px', borderRadius: '20px',
                }}>
                  Active ✓
                </span>
              )}
            </div>

            {/* Quote */}
            {s.quote && (
              <div style={{
                borderLeft: '3px solid var(--orange)', paddingLeft: '12px',
                fontStyle: 'italic', fontSize: '14px', color: 'var(--text-mid)',
                lineHeight: '1.6', marginBottom: '14px',
              }}>
                "{s.quote}"
              </div>
            )}

            {/* Income */}
            {(s.month_1_income || s.month_2_income) && (
              <div style={{ display: 'flex', gap: '10px' }}>
                {s.month_1_income && (
                  <div style={{
                    background: 'var(--cream)', borderRadius: '10px',
                    padding: '8px 14px', flex: 1, textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-mid)', marginBottom: '2px' }}>Month 1</div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--teal)' }}>
                      ₹{s.month_1_income.toLocaleString('en-IN')}
                    </div>
                  </div>
                )}
                {s.month_2_income && (
                  <div style={{
                    background: 'var(--cream)', borderRadius: '10px',
                    padding: '8px 14px', flex: 1, textAlign: 'center',
                  }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-mid)', marginBottom: '2px' }}>Month 2</div>
                    <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--teal)' }}>
                      ₹{s.month_2_income.toLocaleString('en-IN')}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* How */}
            {s.path_used && (
              <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-mid)' }}>
                <strong style={{ color: 'var(--text-dark)' }}>How:</strong> {s.path_used}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
