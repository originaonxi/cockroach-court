'use client';

import { useState, useEffect } from 'react';

const fmt = (cr) => cr == null ? '—' : '₹' + (cr >= 100000 ? (cr / 100000).toFixed(2) + ' L cr' : cr.toLocaleString('en-IN') + ' cr');

export default function BudgetPanel({ ministry }) {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(false);

  useEffect(() => {
    if (!ministry) return;
    fetch(`/api/budget/${encodeURIComponent(ministry)}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(d => { if (d.error) throw new Error(); setData(d); })
      .catch(() => setErr(true));
  }, [ministry]);

  if (err || !data || !data.count) return null;

  return (
    <div className="minister-card p-6 mb-6">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
        <h2 className="text-lg font-bold text-white">💰 Ministry Budget — delivery context</h2>
        <span className="badge text-[10px]" style={{ background: '#64b5f622', color: '#64b5f6', border: '1px solid #64b5f644' }}>
          Ministry-level · sourced
        </span>
      </div>
      <p className="text-xs text-[#888] mb-4">
        Real Union Budget allocations for this ministry. Context on the scale and direction of resources —
        <strong> not an individual performance verdict</strong>. Every figure is cited below.
      </p>

      {data.budgets.map((b, i) => (
        <div key={i} className="bg-[#12122a] border border-[#2a2a4a] rounded-xl p-4 mb-3">
          <div className="text-sm font-semibold text-white mb-3">{b.ministry}</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[#888]">Allocation 2025-26</div>
              <div className="text-lg font-bold text-[#64b5f6]">{fmt(b.be2526)}</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[#888]">YoY change</div>
              <div className="text-lg font-bold" style={{ color: b.yoy >= 0 ? '#00c853' : '#ff5252' }}>
                {b.yoy > 0 ? '+' : ''}{b.yoy}%
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[#888]">BE→RE revision 24-25</div>
              <div className="text-lg font-bold" style={{ color: b.midRevision < -10 ? '#ff9100' : '#aaa' }}>
                {b.midRevision > 0 ? '+' : ''}{b.midRevision}%
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[#888]">Actual 2023-24</div>
              <div className="text-lg font-bold text-[#aaa]">{fmt(b.actual2324)}</div>
            </div>
          </div>
          {b.midRevision < -10 && (
            <p className="text-[11px] text-[#ff9100] mb-2">
              ⚠ Budget was revised down {Math.abs(b.midRevision)}% mid-year (BE→RE) — worth scrutiny. Note: a revised
              estimate reflects re-allocation, not final actual spend.
            </p>
          )}
          <div className="flex gap-3 text-[10px]">
            {b.primarySource && <a href={b.primarySource} target="_blank" className="source-link">Primary: indiabudget.gov.in ↗</a>}
            {b.crossSource && <a href={b.crossSource} target="_blank" className="source-link">Cross-check: PRS ↗</a>}
          </div>
        </div>
      ))}
    </div>
  );
}
