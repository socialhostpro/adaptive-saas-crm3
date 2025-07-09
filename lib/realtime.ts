import { supabase } from './supabaseClient';

export function subscribeToTable(table: string, onChange: (payload: any) => void) {
  const channel = supabase.channel(`realtime:${table}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table },
      payload => {
        onChange(payload);
      }
    )
    .subscribe();
  return channel;
}

export function unsubscribeFromChannel(channel: any) {
  if (channel) supabase.removeChannel(channel);
}
