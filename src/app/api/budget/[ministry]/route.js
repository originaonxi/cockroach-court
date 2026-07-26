import Airtable from 'airtable';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { ministry } = await params;
  const name = decodeURIComponent(ministry).toLowerCase();
  const PAT = process.env.AIRTABLE_API_KEY;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;
  if (!PAT || !BASE_ID) return NextResponse.json({ error: 'no creds' }, { status: 500 });
  const base = new Airtable({ apiKey: PAT }).base(BASE_ID);
  try {
    const recs = await base('tbla0INCkf5ExoQxF').select({ maxRecords: 100 }).all();
    // match a minister's (possibly multi-) portfolio against budget-ministry rows
    const matches = recs.map(r => r.fields).filter(f => {
      const m = (f['Ministry'] || '').toLowerCase();
      if (!m) return false;
      const mKey = m.split(/[,&]/)[0].trim();
      return name.includes(mKey) || mKey.split(' ').filter(w => w.length > 4).some(w => name.includes(w));
    }).map(f => ({
      ministry: f['Ministry'],
      be2526: f['BE 2025-26 (Cr)'] ?? null,
      re2425: f['RE 2024-25 (Cr)'] ?? null,
      be2425: f['BE 2024-25 (Cr)'] ?? null,
      actual2324: f['Actual 2023-24 (Cr)'] ?? null,
      yoy: f['YoY % (RE->BE)'] ?? null,
      midRevision: f['Mid-year Revision %'] ?? null,
      primarySource: f['Primary Source'] || '',
      crossSource: f['Cross-check Source'] || '',
    }));
    return NextResponse.json({ ministry: decodeURIComponent(ministry), count: matches.length, budgets: matches });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
