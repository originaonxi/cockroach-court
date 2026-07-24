import Airtable from 'airtable';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
  const { minister } = await params;
  const decodedName = decodeURIComponent(minister);

  const PAT = process.env.AIRTABLE_API_KEY;
  const BASE_ID = process.env.AIRTABLE_BASE_ID;
  
  if (!PAT || !BASE_ID) {
    return NextResponse.json({ error: 'Missing Airtable credentials' }, { status: 500 });
  }

  const base = new Airtable({ apiKey: PAT }).base(BASE_ID);

  try {
    const records = await base('tblOmOELPHRs152ur')
      .select({ filterByFormula: `{Minister} = '${decodedName.replace(/'/g, "\\'")}'`, maxRecords: 100 })
      .all();

    const data = records.map(r => ({
      id: r.id,
      type: r.fields['Record Type'] || 'General',
      title: r.fields['Title'] || '',
      description: (r.fields['Description'] || '').slice(0, 500),
      url: r.fields['Source URL'] || '',
      domain: r.fields['Source Domain'] || '',
      tags: r.fields['Tags'] || '',
    }));

    const negKeywords = ['controversy', 'complaint', 'violation', 'scam', 'case', 'audit', 'flag', 'fraud', 'failure', 'scandal', 'leak', 'protest', 'arrest', 'charge'];
    const posKeywords = ['achievement', 'launch', 'success', 'growth', 'record', 'award', 'scheme', 'development', 'increase', 'inaugurate'];
    
    let positive = 0, negative = 0, neutral = 0;
    data.forEach(d => {
      const t = (d.title + ' ' + d.tags).toLowerCase();
      if (negKeywords.some(k => t.includes(k))) negative++;
      else if (posKeywords.some(k => t.includes(k))) positive++;
      else neutral++;
    });

    const total = positive + negative + neutral;
    const supportScore = total > 0 ? Math.max(0, Math.min(10, +(5 + (positive - negative) * 0.6).toFixed(1))) : 5;
    const resignScore = total > 0 ? Math.max(0, Math.min(10, +(5 + (negative - positive) * 0.4).toFixed(1))) : 1;

    return NextResponse.json({
      minister: decodedName,
      totalRecords: data.length,
      positive, negative, neutral,
      supportScore, resignScore,
      records: data,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}