import { fetchMinisterBySlug } from '@/lib/airtable';
import { notFound } from 'next/navigation';
import VotePanel from './VotePanel';
import DossierPanel from './DossierPanel';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const m = await fetchMinisterBySlug(slug);
  if (!m) return { title: 'Not Found' };
  return {
    title: `${m.Name} — The Public Trust Layer`,
    description: `${m.Name} | ${m.Rank} | ${m.Ministry} | Public Confidence: ${(m['Public Confidence Score'] || m['Citizen Support Score'] || 0)?.toFixed(1)}/10 | Evidence Level: ${(m['Evidence Confidence Level'] || m['Resign Demand Score'] || 0)?.toFixed(1)}/10 | Pending cases: ${m['Pending Court Cases'] || 0}`,
  };
}

const STATUS_COLORS = {
  'Clean': { bg: '#00c85322', text: '#00c853', border: '#00c85344' },
  'Under Watch': { bg: '#ff910022', text: '#ff9100', border: '#ff910044' },
  'Case Pending': { bg: '#ff174422', text: '#ff1744', border: '#ff174444' },
  'Resign Demanded': { bg: '#d5000022', text: '#ff1744', border: '#ff174466' },
};

export default async function MinisterPage({ params }) {
  const { slug } = await params;
  const m = await fetchMinisterBySlug(slug);
  if (!m) notFound();

  const sc = STATUS_COLORS[m['Status']?.replace(/\s+/g, '-')] || STATUS_COLORS['Clean'];
  const publicConfidenceScore = m['Public Confidence Score'] || m['Citizen Support Score'] || 0;
  const evidenceLevel = m['Evidence Confidence Level'] || m['Resign Demand Score'] || 0;

  return (
    <div className="max-w-5xl mx-auto">
      {/* BACK */}
      <a href="/" className="text-sm text-[#888] hover:text-white mb-6 inline-block">← Back to all ministers</a>

      {/* PROFILE HEADER */}
      <div className="minister-card p-6 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Photo */}
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[#2a2a4a] flex items-center justify-center text-4xl sm:text-5xl font-bold text-[#f5c518] flex-shrink-0 border-2 border-[#e94560]">
            {m.Name?.[0] || '?'}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-white">{m.Name}</h1>
              <span className="badge" style={{ background: sc.bg, color: sc.text, border: `1px solid ${sc.border}` }}>
                {m['Status'] || 'Clean'}
              </span>
            </div>
            <p className="text-[#e94560] font-semibold text-lg">{m.Rank}</p>
            <p className="text-[#aaa] text-base mt-1">{m.Ministry}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-[#888]">
              <span>🏛 {m.Party}</span>
              <span>📍 {m.Constituency}</span>
              <span>🗳 {m.House}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SCORES ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="stat-box">
          <div className="stat-label">Public Confidence Score</div>
          <div className="text-4xl font-bold mb-2" style={{ color: publicConfidenceScore >= 5 ? '#00c853' : '#ff9100' }}>
            {publicConfidenceScore.toFixed(1)}
          </div>
          <div className="score-bar mb-2">
            <div className="score-fill" style={{ width: `${publicConfidenceScore * 10}%`, background: publicConfidenceScore >= 5 ? '#00c853' : '#ff9100' }} />
          </div>
          <p className="text-xs text-[#666]">0–10 evidence-based score derived from verified public records, court data, CAG audits, and citizen reports.</p>
        </div>
        <div className="stat-box">
          <div className="stat-label">Evidence Confidence Level</div>
          <div className="text-4xl font-bold mb-2" style={{ color: evidenceLevel >= 5 ? '#ff1744' : '#888' }}>
            {evidenceLevel.toFixed(1)}
          </div>
          <div className="score-bar mb-2">
            <div className="score-fill" style={{ width: `${evidenceLevel * 10}%`, background: evidenceLevel >= 5 ? '#ff1744' : '#555' }} />
          </div>
          <p className="text-xs text-[#666]">Confidence in available evidence. High = verified records exist. Low = insufficient evidence.</p>
        </div>
      </div>

      {/* KEY METRICS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {[
          { label: 'Pending Court Cases', value: m['Pending Court Cases'] || 0, color: (m['Pending Court Cases'] || 0) > 0 ? '#ff1744' : '#888' },
          { label: 'CAG Audit Flags', value: m['CAG Flags'] || 0, color: (m['CAG Flags'] || 0) > 0 ? '#ff9100' : '#888' },
          { label: 'Declared Assets (₹ Cr)', value: m['Declared Assets (Cr)']?.toFixed(1) || '—', color: '#64b5f6' },
          { label: 'Parliament Attendance', value: m['Parliament Attendance %'] ? `${m['Parliament Attendance %']}%` : '—', color: (m['Parliament Attendance %'] || 0) >= 75 ? '#00c853' : '#ff9100' },
        ].map(stat => (
          <div key={stat.label} className="stat-box text-center">
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>
      <VotePanel ministerName={m.Name} supportScore={publicConfidenceScore} resignScore={evidenceLevel} />

      {/* DATA SOURCES — ALL GOVERNMENT RECORDS */}
      <div className="minister-card p-6 mb-8">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          📋 All Government Data Sources
          <span className="text-xs bg-[#2a2a4a] text-[#888] px-2 py-0.5 rounded-full">Official · Live · Verifiable</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {m['ECI Affidavit URL'] && (
            <div className="bg-[#12122a] border border-[#2a2a4a] rounded-xl p-4">
              <div className="text-xs text-[#888] uppercase tracking-wider mb-1">📋 ADR (MyNeta) — Sworn Affidavit</div>
              <div className="text-sm text-white font-medium">{m.Name} — Assets, Cases, Education</div>
              <a href={m['ECI Affidavit URL']} target="_blank" className="source-link text-xs mt-1 inline-block">
                View sworn affidavit: assets, criminal cases, education ↗
              </a>
            </div>
          )}
          {m['PRS India Profile'] && (
            <div className="bg-[#12122a] border border-[#2a2a4a] rounded-xl p-4">
              <div className="text-xs text-[#888] uppercase tracking-wider mb-1">📊 PRS Legislative Research</div>
              <div className="text-sm text-white font-medium">{m.Name} — Parliamentary Track</div>
              <a href={m['PRS India Profile']} target="_blank" className="source-link text-xs mt-1 inline-block">
                View attendance, questions, bills, debates ↗
              </a>
            </div>
          )}
          <div className="bg-[#12122a] border border-[#2a2a4a] rounded-xl p-4">
            <div className="text-xs text-[#888] uppercase tracking-wider mb-1">⚖ eCourts</div>
            <div className="text-sm text-white font-medium">Court Cases — All India</div>
            <a href="https://ecourts.gov.in" target="_blank" className="source-link text-xs mt-1 inline-block">
              Search by case number, party, or court ↗
            </a>
          </div>
          <div className="bg-[#12122a] border border-[#2a2a4a] rounded-xl p-4">
            <div className="text-xs text-[#888] uppercase tracking-wider mb-1">📄 CAG India</div>
            <div className="text-sm text-white font-medium">Audit Reports — All Ministries</div>
            <a href="https://cag.gov.in" target="_blank" className="source-link text-xs mt-1 inline-block">
              Comptroller & Auditor General reports ↗
            </a>
          </div>
          <div className="bg-[#12122a] border border-[#2a2a4a] rounded-xl p-4">
            <div className="text-xs text-[#888] uppercase tracking-wider mb-1">💰 CPPP — Govt Tenders</div>
            <div className="text-sm text-white font-medium">Central Public Procurement Portal</div>
            <a href="https://eprocure.gov.in" target="_blank" className="source-link text-xs mt-1 inline-block">
              All government tenders, awards, contractors ↗
            </a>
          </div>
          <div className="bg-[#12122a] border border-[#2a2a4a] rounded-xl p-4">
            <div className="text-xs text-[#888] uppercase tracking-wider mb-1">📬 RTI Online</div>
            <div className="text-sm text-white font-medium">Right to Information Portal</div>
            <a href="https://rtionline.gov.in" target="_blank" className="source-link text-xs mt-1 inline-block">
              File RTI, track responses from all ministries ↗
            </a>
          </div>
          <div className="bg-[#12122a] border border-[#2a2a4a] rounded-xl p-4">
            <div className="text-xs text-[#888] uppercase tracking-wider mb-1">📍 Lok Sabha</div>
            <div className="text-sm text-white font-medium">House of the People</div>
            <a href="https://loksabha.nic.in" target="_blank" className="source-link text-xs mt-1 inline-block">
              MP profiles, attendance, questions, bills ↗
            </a>
          </div>
          <div className="bg-[#12122a] border border-[#2a2a4a] rounded-xl p-4">
            <div className="text-xs text-[#888] uppercase tracking-wider mb-1">🏛 Open Budgets India</div>
            <div className="text-sm text-white font-medium">Government Spending Data</div>
            <a href="https://openbudgetsindia.org" target="_blank" className="source-link text-xs mt-1 inline-block">
              Budget allocations, expenditures, schemes ↗
            </a>
          </div>
          <div className="bg-[#12122a] border border-[#2a2a4a] rounded-xl p-4">
            <div className="text-xs text-[#888] uppercase tracking-wider mb-1">📈 NITI Aayog</div>
            <div className="text-sm text-white font-medium">SDG India Index & Dashboard</div>
            <a href="https://niti.gov.in" target="_blank" className="source-link text-xs mt-1 inline-block">
              State & ministry performance data ↗
            </a>
          </div>
          <div className="bg-[#12122a] border border-[#2a2a4a] rounded-xl p-4">
            <div className="text-xs text-[#888] uppercase tracking-wider mb-1">⚖ ECI</div>
            <div className="text-sm text-white font-medium">Election Commission of India</div>
            <a href="https://affidavit.eci.gov.in" target="_blank" className="source-link text-xs mt-1 inline-block">
              Candidate affidavits, criminal records, assets ↗
            </a>
          </div>
        </div>
      </div>

      {/* DOSSIER PANEL — Deep data, charts, records */}
      <div className="mb-8">
        <DossierPanel ministerName={m.Name} />
      </div>

      {/* NOTES */}
      {m['Notes'] && (
        <div className="minister-card p-6">
          <h2 className="text-lg font-bold text-white mb-3">⬡ Public Record Notes</h2>
          <p className="text-sm text-[#aaa] leading-relaxed">{m['Notes']}</p>
          <p className="text-xs text-[#555] mt-4">Last updated: {m['Last Updated'] || 'July 24, 2026'}</p>
        </div>
      )}
    </div>
  );
}