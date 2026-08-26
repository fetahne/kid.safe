import { createClient } from '@supabase/supabase-js';

export const SUPABASE_CONFIG = {
  projectId: 'frexkrmwkpyhruoryjvj',
  url: 'https://frexkrmwkpyhruoryjvj.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyZXhrcm13a3B5aHJ1b3J5anZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc3MjU1NjAsImV4cCI6MjEwMzMwMTU2MH0.uX8CuQrDHyDYiKiUVwEhTZ38qR0K0ngL3T_0gN1rOsk',
};

// Create Supabase client
export const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);

// Helper to test connection
export async function testSupabaseConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    const res = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/`, {
      headers: {
        apikey: SUPABASE_CONFIG.anonKey,
        Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
      },
    });
    if (res.ok || res.status === 200 || res.status === 404) {
      return { connected: true, message: 'Supabase REST API bağlantısı başarılı ve aktif.' };
    }
    return { connected: false, message: `HTTP Yanıtı: ${res.status}` };
  } catch (err: any) {
    return { connected: false, message: err.message || 'Bağlantı hatası' };
  }
}
