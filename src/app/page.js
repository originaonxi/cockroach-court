import { fetchAllMinisters } from '@/lib/airtable';

export const dynamic = 'force-dynamic';

const BAND_COLORS = {
  'Strong': '#00c853',
  'Stable': '#64dd17',
  'Watch': '#ff9100',
  'Elevated Legal Exposure': '#ff5252',
  'High Legal Exposure': '#ff1744',
};

const scoreColor = (s) => {
  if (s >= 80) return '#00c853';
  if (s >= 60) return '#64dd17';
  if (s >= 40) return '#ff9100';
  if (s >= 20) return '#ff5252';
  return '#ff1744';
};

export default async function HomePage() {
  const ministers = await fetchAllMinisters();
  const ranked = [...ministers].sort((a, b) => (b['Public Confidence Score'] ?? 0) - (a['Public Confidence Score'] ?? 0));

  return (
    <div>
      {/* HERO */}
      <div className="text-center py-10 mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          <span className="text-[#e94560]">The Public</span>{' '}
          <span className="text-[#f5c518]">Trust Layer</span>
        </h1>
        <p className="text-lg text-[#888] max-w-2xl mx-auto">
          Evidence-based Public Confidence Scores for every Union Cabinet minister, computed from official
          ADR sworn-affidavit data. Transparent maths. Not a court.
        </p>
        <div className="flex items-center justify-center gap-6 mt-4 text-sm text-[#666]">
          <span>⬡ {ministers.length} ministers</span>
          <span>⬡ Model v2.0</span>
          <span>⬡ 2 of 5 factors live</span>
        </div>
      </div>

      {/* MINISTERS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ranked.map((m, i) => {
          const pcs = m['Public Confidence Score'] ?? 0;
          const band = m['Score Band'] || 'Watch';
          const conf = m['Confidence Level'] || 'Low';
          const bandColor = BAND_COLORS[band] || scoreColor(pcs);
          const cases = m['Pending Court Cases'] || 0;
          const charges = m['Total Charges'] || 0;

          return (
            <a key={m.id} href={`/ministers/${m.slug}`} className="minister-card p-5 block no-underline text-inherit">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[#555] text-xs font-mono">#{i + 1}</span>
                <span className="badge" style={{ background: bandColor + '22', color: bandColor, border: `1px solid ${bandColor}44` }}>
                  {band}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-[#2a2a4a] flex items-center justify-center text-lg font-bold text-[#f5c518]">
                  {m.Name?.[0] || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-white font-semibold text-base truncate">{m.Name}</h2>
                  <p className="text-[#888] text-xs truncate">{m.Ministry}</p>
                </div>
              </div>

              {/* Public Confidence Score */}
              <div className="mb-3">
                <div className="flex justify-between items-baseline text-xs mb-1">
                  <span className="text-[#888]">Public Confidence Score</span>
                  <span className="font-bold text-lg" style={{ color: bandColor }}>{pcs}<span className="text-[#555] text-xs">/100</span></span>
                </div>
                <div className="score-bar">
                  <div className="score-fill" style={{ width: `${pcs}%`, background: bandColor }} />
                </div>
                <div className="text-[10px] text-[#555] mt-1">{conf} confidence · 2 of 5 factors</div>
              </div>

              {/* Stats row */}
              <div className="flex gap-3 text-xs text-[#666] pt-2 border-t border-[#2a2a4a]">
                <span className={cases > 0 ? 'text-[#ff9100] font-semibold' : ''}>
                  ⚖ {cases} pending case{cases !== 1 ? 's' : ''}
                </span>
                <span>{charges} charge{charges !== 1 ? 's' : ''}</span>
                <span className="text-[#64b5f6]">₹{(m['Declared Assets (Cr)'] ?? 0).toFixed(1)}Cr</span>
              </div>
            </a>
          );
        })}
      </div>

      {/* METHODOLOGY NOTE */}
      <div className="mt-10 text-center text-xs text-[#555] max-w-3xl mx-auto">
        <p>
          Scores use only official ADR / MyNeta sworn-affidavit data (integrity + disclosure). Pending cases are
          <strong> unadjudicated allegations shown as public record</strong> — not findings of guilt. Legislative,
          delivery, and sentiment factors are being added. This is a transparency layer, not a judicial system.
        </p>
      </div>
    </div>
  );
}
