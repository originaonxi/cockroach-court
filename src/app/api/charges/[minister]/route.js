import Airtable from 'airtable';
import { NextResponse } from 'next/server';

const CAT_LABEL = {
  protest: 'Protest / agitation',
  defamation: 'Defamation (often politically filed)',
  decency: 'Public decency / minor',
  hate: 'Communal / hate speech',
  election: 'Election-related',
  intimid: 'Intimidation / mischief',
  forgery: 'Forgery',
  economic: 'Economic / breach of trust',
  violent: 'Violent',
};

export async function GET(request, { params }) {
  const { minister } = await params;
  const name = decodeURIComponent(minister);
  const PAT = process.env.AIRTABLE_API_KEY;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;
  if (!PAT || !BASE_ID) return NextResponse.json({ error: 'no creds' }, { status: 500 });
  const base = new Airtable({ apiKey: PAT }).base(BASE_ID);
  try {
    const recs = await base('tbl1W71yi4XVUsU7G')
      .select({ filterByFormula: `{Minister} = '${name.replace(/'/g, "\\'")}'`, maxRecords: 100 })
      .all();
    const charges = recs.map(r => ({
      section: r.fields['IPC Section'] || '',
      description: r.fields['Charge Description'] || '',
      category: r.fields['Category'] || '',
      categoryLabel: CAT_LABEL[r.fields['Category']] || r.fields['Category'] || '',
      status: r.fields['Adjudication Status'] || 'Pending / Unadjudicated',
      source: r.fields['Affidavit Source'] || '',
      year: r.fields['Affidavit Year'] || '',
    }));
    return NextResponse.json({ minister: name, count: charges.length, charges });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
