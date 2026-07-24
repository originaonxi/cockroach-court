import Airtable from 'airtable';

const PAT = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TABLE_ID = 'tblsBIdjdNgchANVP';

if (!PAT || !BASE_ID) {
  console.warn('[airtable] Missing AIRTABLE_API_KEY or AIRTABLE_BASE_ID');
}

const base = PAT && BASE_ID ? new Airtable({ apiKey: PAT }).base(BASE_ID) : null;

export async function fetchAllMinisters() {
  if (!base) return [];
  const records = await base(TABLE_ID).select({ sort: [{ field: 'Citizen Support Score', direction: 'desc' }] }).all();
  return records.map(r => ({
    id: r.id,
    slug: r.fields.Name?.toLowerCase().replace(/[^a-z]+/g, '-').replace(/-+$/, '') || 'unknown',
    ...r.fields,
  }));
}

export async function fetchMinisterBySlug(slug) {
  const all = await fetchAllMinisters();
  return all.find(m => m.slug === slug) || null;
}

export async function fetchMinisterRankings() {
  const all = await fetchAllMinisters();
  const ranked = [...all].sort((a, b) => (b['Citizen Support Score'] || 0) - (a['Citizen Support Score'] || 0));
  return ranked.map((m, i) => ({ rank: i + 1, ...m }));
}