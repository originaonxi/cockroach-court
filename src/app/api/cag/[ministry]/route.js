import Airtable from 'airtable';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { ministry } = await params;
  const name = decodeURIComponent(ministry);
  const PAT = process.env.AIRTABLE_API_KEY;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;
  if (!PAT || !BASE_ID) return NextResponse.json({ error: 'no creds' }, { status: 500 });
  const base = new Airtable({ apiKey: PAT }).base(BASE_ID);
  try {
    const recs = await base('tbliVqXaVuhHp2q0G').select({ maxRecords: 100 }).all();
    const key = name.toLowerCase();
    const flags = recs
      .map(r => r.fields)
      // Only ever surface findings sourced to a specific CAG report. Unverified rows never reach the public.
      .filter(f => (f['Data Status'] || '') === 'Verified (report-cited)')
      .filter(f => {
        const m = (f['Ministry'] || '').toLowerCase();
        return m && (key.includes(m) || m.includes(key.split(',')[0].trim()) ||
          key.split(/[,&]/).some(part => part.trim().length > 4 && m.includes(part.trim())));
      })
      .map(f => ({
        ministry: f['Ministry'] || '',
        year: f['Audit Year'] || '',
        amount: f['Amount Flagged (Cr)'] ?? null,
        nature: f['Nature of Objection'] || '',
        type: f['Objection Type'] || '',
        url: f['CAG Report URL'] || '',
        resolved: !!f['Resolved'],
        action: f['Action Taken'] || '',
      }));
    return NextResponse.json({ ministry: name, count: flags.length, flags });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
