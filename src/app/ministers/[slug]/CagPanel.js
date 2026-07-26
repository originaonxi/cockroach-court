'use client';

import { useState, useEffect } from 'react';

export default function CagPanel({ ministry }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (!ministry) return;
    fetch(`/api/cag/${encodeURIComponent(ministry)}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { if (d.error) throw new Error(); setData(d); })
      .catch(() => setErr(true));
  }, [ministry]);

  if (err || !data || !data.count) return null; // only show when there ARE findings

  return (
    <div className="minister-card p-6 mb-6">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <h2 className="text-lg font-bold text-white">📄 CAG Audit Findings — ministry context</h2>
        <span className="badge text-[10px]" style={{ background: '#ffca2822', color: '#ffca28', border: '1px solid #ffca2844' }}>
          Not in individual score
        </span>
      </div>
      <p className="text-xs text-[#888] mb-4">
        Comptroller &amp; Auditor General findings for this <strong>ministry</strong>. Shown as institutional context —
        <strong> not attributed to the individual minister</strong>, since audit periods may predate their tenure.
      </p>
      <div className="space-y-3">
        {data.flags.map((f, i) => (
          <div key={i} className="bg-[#12122a] border border-[#2a2a4a] rounded-xl p-4">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="text-sm font-semibold text-white">{f.ministry} · {f.year}</span>
              {f.amount != null && <span className="text-sm font-bold text-[#ff9100]">₹{f.amount.toLocaleString('en-IN')} Cr</span>}
            </div>
            {f.type && <span className="text-[10px] uppercase tracking-wider text-[#888]">{f.type}</span>}
            <p className="text-xs text-[#aaa] mt-1 leading-relaxed">{f.nature}</p>
            {f.action && <p className="text-xs text-[#666] mt-1">Action: {f.action}</p>}
            <div className="flex items-center gap-3 mt-2">
              <span className="text-[10px]" style={{ color: f.resolved ? '#00c853' : '#ff9100' }}>
                {f.resolved ? '✓ Resolved' : '● Pending resolution'}
              </span>
              {f.url && <a href={f.url} target="_blank" className="source-link text-[10px]">CAG report ↗</a>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
