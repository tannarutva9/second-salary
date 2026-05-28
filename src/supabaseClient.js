import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fjhlpbopcpgzlgwixhwk.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZqaGxwYm9wY3Bnemxnd2l4aHdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MDgzODksImV4cCI6MjA5NTI4NDM4OX0.EHB_X0D_goLi6yzRHzh_L9lB_pkkv5OC0vQo7BQfOfE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const WEBHOOKS = {
  router: 'https://info15779.n8n-wsk.com/webhook/ss-router', // User personalisation
  path_1: 'https://info15779.n8n-wsk.com/webhook/ss-path1',  // Burnt starter agent
};

export async function callWebhook(eventPayload, type = 'router') {
  try {
    const url = WEBHOOKS[type] || WEBHOOKS.router;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventPayload),
    });
    const text = await res.text();
    const data = text ? JSON.parse(text) : {};
    console.log(`[Webhook Response | ${type}]`, data);
    return data;
  } catch (err) {
    console.error(`[Webhook Error | ${type}]`, err);
  }
}
