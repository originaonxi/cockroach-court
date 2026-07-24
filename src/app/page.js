import { fetchAllMinisters } from '@/lib/airtable';

export const dynamic = 'force-dynamic';

const SCORE_COLOR = (score) => {
  if (score >= 7) return '#00c853';
  if (score >= 5) return '#64dd17';
  if (score >= 3) return '#ff9100';
  return '#ff1744';
};

export default async function HomePage() {
  const ministers = await fetchAllMinisters();
  const ranked = [...ministers].sort((a, b) => (b['Public Confidence Score'] || b['Citizen Support Score'] || 0) - (a['Public Confidence Score'] || a['Citizen Support Score'] || 0));

  return (
    <div>
      {/* HERO */}
      <div className="text-center py-10 mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          <span className="text-[#e94560]">The Public</span>{' '}
          <span className="text-[#f5c518]">Trust Layer</span>
        </h1>
        <p className="text-lg text-[#888] max-w-2xl mx-auto">
          Evidence-based Public Confidence Scores for every Union Cabinet minister. Tracked live from official government data sources.
        </p>
        <div className="flex items-center justify-center gap-6 mt-4 text-sm text-[#666]">
          <span>⬡ {ministers.length} ministers</span>
          <span>⬡ Evidence-based</span>
          <span>⬡ 10 linked data sources</span>
        </div>
      </div>

      {/* MINISTERS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {ranked.map((m, i) => {
          const score = m['Public Confidence Score'] || m['Citizen Support Score'] || 0;
          const evidenceScore = m['Evidence Confidence Level'] || m['Resign Demand Score'] || 0;
          const status = (m['Status'] || 'Clean').replace(/\s+/g, '-');
          const cases = m['Pending Court Cases'] || 0;
          const cag = m['CAG Flags'] || 0;

          return (
            <a key={m.id} href={`/ministers/${m.slug}`} className="minister-card p-5 block no-underline text-inherit">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[#555] text-xs font-mono">#{i + 1}</span>
                <span className={`badge status-${status}`}>
                  {status.replace(/-/g, ' ')}
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
              <div className="mb-2">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#888]">Public Confidence</span>
                  <span className="font-bold" style={{ color: SCORE_COLOR(score) }}>{score.toFixed(1)}</span>
                </div>
                <div className="score-bar">
                  <div className="score-fill" style={{ width: `${score * 10}%`, background: SCORE_COLOR(score) }} />
                </div>
              </div>

              {/* Evidence Confidence Level */}
              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#888]">Evidence Level</span>
                  <span className="font-bold" style={{ color: evidenceScore > 5 ? '#ff1744' : '#888' }}>{evidenceScore.toFixed(1)}</span>
                </div>
                <div className="score-bar">
                  <div className="score-fill" style={{ width: `${evidenceScore * 10}%`, background: evidenceScore > 5 ? '#ff1744' : '#555' }} />
                </div>
              </div>

              {/* Stats row */}
              <div className="flex gap-3 text-xs text-[#666] pt-2 border-t border-[#2a2a4a]">
                <span className={cases > 0 ? 'text-[#ff1744] font-semibold' : ''}>
                  ⚖ {cases} case{cases !== 1 ? 's' : ''}
                </span>
                <span className={cag > 0 ? 'text-[#ff9100] font-semibold' : ''}>
                  ● {cag} CAG
                </span>
                <span>{m['Parliament Attendance %'] || '—'}% attendance</span>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}