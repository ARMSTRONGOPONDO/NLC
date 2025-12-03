import { createClient } from '@supabase/supabase-js';
import type { AcquisitionRequest } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseClient = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { auth: { persistSession: false } })
  : null;

export const isSupabaseConfigured = () => Boolean(supabaseClient);

const normalize = (row: any): AcquisitionRequest => ({
  id: String(row.id ?? ''),
  title: row.title ?? 'Untitled Project',
  description: row.description ?? '',
  acquiringBody: row.acquiring_body ?? row.acquiringBody ?? 'KeNHA',
  status: row.status ?? 'Draft',
  dateCreated: row.date_created ?? row.dateCreated ?? new Date().toISOString().split('T')[0],
  lastUpdated: row.last_updated ?? row.lastUpdated ?? new Date().toISOString().split('T')[0],
  documents: Array.isArray(row.documents) ? row.documents : [],
  logs: Array.isArray(row.logs) ? row.logs : [],
  parcels: Array.isArray(row.parcels) ? row.parcels : [],
  budget: Number(row.budget ?? 0),
  gazetteNoticeNumber: row.gazette_notice_number ?? row.gazetteNoticeNumber,
  fundsDeposited: row.funds_deposited ?? row.fundsDeposited ?? false,
  stageEvents: Array.isArray(row.stage_events)
    ? row.stage_events
    : Array.isArray(row.stageEvents)
      ? row.stageEvents
      : []
});

export const fetchRequests = async (): Promise<AcquisitionRequest[]> => {
  if (!supabaseClient) return [];

  const { data, error } = await supabaseClient
    .from('acquisition_requests')
    .select('*')
    .order('last_updated', { ascending: false });

  if (error) {
    console.error('Supabase fetch requests error', error);
    return [];
  }

  return (data ?? []).map(normalize);
};

export const persistRequest = async (request: AcquisitionRequest): Promise<void> => {
  if (!supabaseClient) return;

  const payload = {
    id: request.id,
    title: request.title,
    description: request.description,
    acquiring_body: request.acquiringBody,
    status: request.status,
    date_created: request.dateCreated,
    last_updated: request.lastUpdated,
    budget: request.budget,
    gazette_notice_number: request.gazetteNoticeNumber,
    funds_deposited: request.fundsDeposited ?? false,
    parcels: request.parcels,
    documents: request.documents,
    stage_events: request.stageEvents,
    logs: request.logs
  };

  const { error } = await supabaseClient
    .from('acquisition_requests')
    .upsert(payload, { onConflict: 'id' });

  if (error) {
    console.error('Supabase persist request error', error);
  }
};
