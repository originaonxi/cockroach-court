const FACTORS = [
  {
    name: 'Integrity',
    weight: '70%',
    status: 'measured',
    detail: 'Severity-weighted pending charges from the sworn affidavit, discounted because none are convictions. Real, per-person, auditable.',
  },
  {
    name: 'Financial Transparency',
    weight: '30%',
    status: 'measured',
    detail: 'Declared assets, liabilities and disclosure completeness. Rewards full declaration — wealth is never penalised.',
  },
  {
    name: 'Legislative Performance',
    weight: '—',
    status: 'na',
    detail: 'N/A by design: PRS India explicitly does not report participation for Union Ministers — "Ministers represent the government in debates, so we do not report their participation." Cannot be fabricated.',
  },
  {
    name: 'Delivery & Governance',
    weight: '—',
    status: 'context',
    detail: 'CAG audit findings are ministry-and-period specific, not cleanly attributable to an individual minister\u2019s tenure. Shown as ministry context, never an individual penalty.',
  },
  {
    name: 'Public Sentiment',
    weight: '—',
    status: 'context',
    detail: 'News-derived sentiment is subjective and defamation-prone. Shown as exploratory context in the dossier, excluded from the score.',
  },
];

const STATUS = {
  measured: { label: 'In score', color: '#00c853', icon: '✓' },
  na: { label: 'N/A by design', color: '#90a4ae', icon: '∅' },
  context: { label: 'Context only', color: '#ffca28', icon: '◐' },
};

export default function FactorPanel() {
  const measured = FACTORS.filter(f => f.status === 'measured').length;
  return (
    <div className="minister-card p-6 mb-6">
      <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
        <h2 className="text-lg font-bold text-white">📊 Factor Coverage — {measured} of 5 in score</h2>
        <span className="text-xs text-[#888]">why the score is what it is</span>
      </div>
      <p className="text-xs text-[#888] mb-4">
        Following World Bank Worldwide Governance Indicators practice, we publish exactly which factors are measured,
        which are not applicable, and why. We never fabricate a factor to look more complete.
      </p>
      <div className="space-y-2">
        {FACTORS.map(f => {
          const s = STATUS[f.status];
          return (
            <div key={f.name} className="bg-[#12122a] border border-[#2a2a4a] rounded-xl p-3">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <span style={{ color: s.color }}>{s.icon}</span>
                  <span className="text-sm font-semibold text-white">{f.name}</span>
                  {f.weight !== '—' && <span className="text-xs text-[#666]">weight {f.weight}</span>}
                </div>
                <span className="badge text-[10px]" style={{ background: s.color + '22', color: s.color, border: `1px solid ${s.color}44` }}>
                  {s.label}
                </span>
              </div>
              <p className="text-xs text-[#888] leading-relaxed">{f.detail}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
