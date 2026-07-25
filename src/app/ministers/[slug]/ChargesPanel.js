'use client';

import { useState, useEffect } from 'react';

const CAT_COLOR = {
  protest: '#64b5f6',
  defamation: '#90a4ae',
  decency: '#9ccc65',
  hate: '#ff9100',
  election: '#ffca28',
  intimid: '#ff7043',
  forgery: '#ef5350',
  economic: '#e53935',
  violent: '#b71c1c',
};

export default function ChargesPanel({ ministerName }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch(`/api/charges/${encodeURIComponent(ministerName)}`)
      .then(r => r.ok ? r.json() : Promise.reject(new Error('http')))
      .then(d => { if (d && d.error) throw new Error(d.error); setData(d); setLoading(false); })
      .catch(() => { setError(true); setLoading(false); });
  }, [ministerName]);

  if (loading) return null;

  if (error || !data) {
    return (
      <div className="minister-card p-6 mb-6">
        <h2 className="text-lg font-bold text-white mb-2">⚖ Declared Legal Matters</h2>
        <p className="text-sm text-[#ff9100]">Could not load legal records from the source right now. This is a data-load error — <strong>not</strong> a statement that no cases exist. Please retry.</p>
      </div>
    );
  }

  if (data.count === 0) {
    return (
      <div className="minister-card p-6 mb-6">
        <h2 className="text-lg font-bold text-white mb-2">⚖ Declared Legal Matters</h2>
        <p className="text-sm text-[#00c853]">No pending cases declared in this minister&apos;s sworn affidavit.</p>
      </div>
    );
  }

  const byCat = {};
  data.charges.forEach(c => { (byCat[c.category] ||= []).push(c); });
  const source = data.charges[0]?.source;
  const year = data.charges[0]?.year;

  return (
    <div className="minister-card p-6 mb-6">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <h2 className="text-lg font-bold text-white">⚖ Declared Legal Matters — {data.count} charges</h2>
        <span className="badge" style={{ background: '#ff910022', color: '#ff9100', border: '1px solid #ff910044' }}>
          All Pending / Unadjudicated
        </span>
      </div>

      <div className="bg-[#2a1a1a] border border-[#ff525233] rounded-lg p-3 text-xs text-[#ffab91] mb-4">
        ⚠ These are <strong>alleged, pending charges</strong> declared by the minister in their own sworn affidavit —
        <strong> not convictions or findings of guilt</strong>. Many are routine for active politicians (protest,
        defamation). Severity is weighted accordingly; adjudicated convictions would count far more.
      </div>

      <div className="space-y-4">
        {Object.entries(byCat).sort((a, b) => b[1].length - a[1].length).map(([cat, list]) => (
          <div key={cat}>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full" style={{ background: CAT_COLOR[cat] || '#888' }} />
              <span className="text-sm font-semibold" style={{ color: CAT_COLOR[cat] || '#aaa' }}>
                {list[0].categoryLabel}
              </span>
              <span className="text-xs text-[#555]">({list.length})</span>
            </div>
            <div className="space-y-1 pl-4">
              {list.map((c, i) => (
                <div key={i} className="text-xs text-[#aaa] flex gap-2">
                  <span className="text-[#666] font-mono shrink-0">{c.section}</span>
                  <span>{c.description}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {source && (
        <a href={source} target="_blank" className="source-link text-xs mt-4 inline-block">
          📋 Source: ADR / MyNeta sworn affidavit ({year}) ↗
        </a>
      )}
    </div>
  );
}
