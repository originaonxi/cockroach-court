import { fetchMinisterBySlug } from '@/lib/airtable';
import { notFound } from 'next/navigation';
import DossierPanel from './DossierPanel';
import ChargesPanel from './ChargesPanel';
import FactorPanel from './FactorPanel';
import CagPanel from './CagPanel';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const m = await fetchMinisterBySlug(slug);
  if (!m) return { title: 'Not Found' };
  const pcs = m['Public Confidence Score'] ?? 0;
  return {
    title: `${m.Name} — The Public Trust Layer`,
    description: `${m.Name} | ${m.Rank} | ${m.Ministry} | Public Confidence Score: ${pcs}/100 (${m['Confidence Level'] || 'Low'} confidence, 2 of 5 factors) | Pending cases: ${m['Pending Court Cases'] || 0} (unadjudicated)`,
  };
}

const BAND_COLORS = {
  'Strong': '#00c853',
  'Stable': '#64dd17',
  'Watch': '#ff9100',
  'Elevated Legal Exposure': '#ff5252',
  'High Legal Exposure': '#ff1744',
};

const CONF_COLORS = { 'High': '#00c853', 'Medium': '#ff9100', 'Low': '#ff5252' };

export default async function MinisterPage({ params }) {
  const { slug } = await params;
  const m = await fetchMinisterBySlug(slug);
  if (!m) notFound();

  const pcs = m['Public Confidence Score'] ?? 0;
  const integrity = m['Integrity Index'] ?? null;
  const transparency = m['Financial Index'] ?? null;
  const band = m['Score Band'] || 'Watch';
  const confLevel = m['Confidence Level'] || 'Low';
  const bandColor = BAND_COLORS[band] || '#ff9100';
  const confColor = CONF_COLORS[confLevel] || '#ff5252';
  const cases = m['Pending Court Cases'] || 0;
  const charges = m['Total Charges'] || 0;
  const pcsLo = m['PCS Lower (5%)']; const pcsHi = m['PCS Upper (95%)'];
  const rankLo = m['Rank Low']; const rankHi = m['Rank High'];

  return (
    <div className="max-w-5xl mx-auto">
      <a href="/" className="text-sm text-[#888] hover:text-white mb-6 inline-block">← Back to all ministers</a>

      {/* PROFILE HEADER */}
      <div className="minister-card p-6 sm:p-8 mb-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-[#2a2a4a] flex items-center justify-center text-4xl sm:text-5xl font-bold text-[#f5c518] flex-shrink-0 border-2 border-[#e94560]">
            {m.Name?.[0] || '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl sm:text-4xl font-bold text-white">{m.Name}</h1>
              <span className="badge" style={{ background: bandColor + '22', color: bandColor, border: `1px solid ${bandColor}44` }}>
                {band}
              </span>
            </div>
            <p className="text-[#e94560] font-semibold text-lg">{m.Rank}</p>
            <p className="text-[#aaa] text-base mt-1">{m.Ministry}</p>
            <div className="flex flex-wrap gap-4 mt-3 text-sm text-[#888]">
              <span>🏛 {m.Party}</span>
              <span>📍 {m.Constituency}</span>
              <span>🗳 {m.House}</span>
              {m.Education && <span>🎓 {m.Education}</span>}
            </div>
          </div>
        </div>
      </div>

      {/* PUBLIC CONFIDENCE SCORE — with prominent confidence caveat */}
      <div className="minister-card p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="text-center">
            <div className="text-6xl font-bold" style={{ color: bandColor }}>{pcs}</div>
            <div className="text-xs text-[#888] mt-1">out of 100</div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-lg font-bold text-white">Public Confidence Score</h2>
              <span className="badge" style={{ background: confColor + '22', color: confColor, border: `1px solid ${confColor}44` }}>
                {confLevel} Confidence
              </span>
            </div>
            {pcsLo != null && pcsHi != null && (
              <div className="mb-3">
                <div className="score-bar relative">
                  <div className="absolute h-full rounded" style={{ left: `${pcsLo}%`, width: `${pcsHi - pcsLo}%`, background: bandColor + '55' }} />
                  <div className="score-fill" style={{ width: `${pcs}%`, background: 'transparent', borderRight: `2px solid ${bandColor}` }} />
                </div>
                <div className="text-xs text-[#888] mt-1">
                  Median <strong style={{ color: bandColor }}>{pcs}</strong> · 90% credible interval <strong>{pcsLo}–{pcsHi}</strong>
                  {rankLo != null && ` · rank #${rankLo}${rankHi !== rankLo ? `–${rankHi}` : ''} of 30`}
                </div>
              </div>
            )}
            <div className="bg-[#2a1a1a] border border-[#ff525233] rounded-lg p-3 text-xs text-[#ffab91]">
              ⚠ <strong>Preliminary — based on 2 of 5 factors.</strong> This score currently uses only official
              ADR sworn-affidavit data (integrity + disclosure). Legislative performance, delivery, and citizen
              sentiment are not yet included. Pending cases are <strong>unadjudicated allegations</strong>, shown as
              public record — not findings of guilt.
            </div>
          </div>
        </div>
      </div>

      {/* MODEL BREAKDOWN */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="stat-box">
          <div className="stat-label">Integrity Index (weight 70%)</div>
          <div className="text-3xl font-bold mb-2" style={{ color: (integrity ?? 0) >= 0.7 ? '#00c853' : '#ff9100' }}>
            {integrity !== null ? (integrity * 100).toFixed(0) : '—'}<span className="text-lg text-[#555]">/100</span>
          </div>
          <div className="score-bar mb-2">
            <div className="score-fill" style={{ width: `${(integrity ?? 0) * 100}%`, background: (integrity ?? 0) >= 0.7 ? '#00c853' : '#ff9100' }} />
          </div>
          <p className="text-xs text-[#666]">exp(−λ·convictions) with pending charges as mild legal-exposure signal. Convictions: 0. Pending charges: {charges}.</p>
        </div>
        <div className="stat-box">
          <div className="stat-label">Transparency Index (weight 30%)</div>
          <div className="text-3xl font-bold mb-2" style={{ color: (transparency ?? 0) >= 0.7 ? '#00c853' : '#ff9100' }}>
            {transparency !== null ? (transparency * 100).toFixed(0) : '—'}<span className="text-lg text-[#555]">/100</span>
          </div>
          <div className="score-bar mb-2">
            <div className="score-fill" style={{ width: `${(transparency ?? 0) * 100}%`, background: (transparency ?? 0) >= 0.7 ? '#00c853' : '#ff9100' }} />
          </div>
          <p className="text-xs text-[#666]">Rewards complete affidavit disclosure. Wealth is never penalized — full declaration raises this score.</p>
        </div>
      </div>

      {/* REAL DATA FROM AFFIDAVIT */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Pending Cases (unadjudicated)', value: cases, color: cases > 0 ? '#ff9100' : '#00c853' },
          { label: 'Total Charges Declared', value: charges, color: charges > 0 ? '#ff9100' : '#888' },
          { label: 'Declared Assets (₹ Cr)', value: m['Declared Assets (Cr)']?.toFixed(2) ?? '—', color: '#64b5f6' },
          { label: 'Declared Liabilities (₹ Cr)', value: (m['Liabilities (Cr)'] ?? 0).toFixed(2), color: '#64b5f6' },
        ].map(stat => (
          <div key={stat.label} className="stat-box text-center">
            <div className="stat-label">{stat.label}</div>
            <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* VERIFIED CHARGES — auditable evidence */}
      <ChargesPanel ministerName={m.Name} />

      {/* CAG MINISTRY CONTEXT — non-scored */}
      <CagPanel ministry={m.Ministry} />

      {/* HOW IT'S CALCULATED */}
      <div className="minister-card p-6 mb-6">
        <h2 className="text-lg font-bold text-white mb-3">🧮 How this score is calculated</h2>
        <div className="bg-[#0d0d1a] rounded-lg p-4 font-mono text-xs text-[#8ab4f8] mb-3 overflow-x-auto">
          PCS = 100 × ( Integrity^wI × Transparency^wT )   ← weighted geometric mean<br/>
          Integrity = exp( −λ · Σ severity × pending_charges ),  convictions weighted 10×<br/>
          90% credible interval from 1,500 Monte-Carlo draws over wI∈[.6,.8], λ∈[.025,.05]
        </div>
        <p className="text-xs text-[#888] leading-relaxed mb-2">
          <strong>Method (OECD Handbook on Composite Indicators + World Bank WGI):</strong> geometric aggregation
          means a low integrity score <em>cannot</em> be offset by high disclosure — the two are non-compensatory.
          Weights and severity constants are varied across plausible ranges in a Monte-Carlo simulation, so the score
          is reported as a median with a 90% credible interval and a rank range — not false-precision single number.
        </p>
        <p className="text-xs text-[#888] leading-relaxed">
          Every input comes from this minister&apos;s official sworn affidavit filed with the Election Commission,
          published by the Association for Democratic Reforms (ADR/MyNeta). This is a transparency layer, not a court —
          it reports verifiable public records and computes an explainable score. No verdicts. No removals.
        </p>
        {m['ECI Affidavit URL'] && (
          <a href={m['ECI Affidavit URL']} target="_blank" className="source-link text-xs mt-3 inline-block">
            📋 View the source sworn affidavit (ADR/MyNeta) ↗
          </a>
        )}
      </div>

      {/* FACTOR COVERAGE TRANSPARENCY */}
      <FactorPanel />

      {/* DATA SOURCES */}
      <div className="minister-card p-6 mb-8">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          📋 All Government Data Sources
          <span className="text-xs bg-[#2a2a4a] text-[#888] px-2 py-0.5 rounded-full">Official · Verifiable</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {m['ECI Affidavit URL'] && (
            <div className="bg-[#12122a] border border-[#2a2a4a] rounded-xl p-4">
              <div className="text-xs text-[#888] uppercase tracking-wider mb-1">📋 ADR / MyNeta — Sworn Affidavit</div>
              <div className="text-sm text-white font-medium">{m.Name} — Assets, Cases, Education</div>
              <a href={m['ECI Affidavit URL']} target="_blank" className="source-link text-xs mt-1 inline-block">
                Source of every number on this page ↗
              </a>
            </div>
          )}
          {m['PRS India Profile'] && (
            <div className="bg-[#12122a] border border-[#2a2a4a] rounded-xl p-4">
              <div className="text-xs text-[#888] uppercase tracking-wider mb-1">📊 PRS Legislative Research</div>
              <div className="text-sm text-white font-medium">Parliamentary Track (coming to score)</div>
              <a href={m['PRS India Profile']} target="_blank" className="source-link text-xs mt-1 inline-block">
                Attendance, questions, bills, debates ↗
              </a>
            </div>
          )}
          {[
            ['⚖ eCourts', 'Court Cases — All India', 'https://ecourts.gov.in'],
            ['📄 CAG India', 'Audit Reports — All Ministries', 'https://cag.gov.in'],
            ['💰 CPPP', 'Central Public Procurement Portal', 'https://eprocure.gov.in'],
            ['📬 RTI Online', 'Right to Information Portal', 'https://rtionline.gov.in'],
            ['📍 Lok Sabha', 'MP profiles, attendance, questions', 'https://loksabha.nic.in'],
            ['🏛 Open Budgets India', 'Government Spending Data', 'https://openbudgetsindia.org'],
            ['⚖ ECI', 'Election Commission of India', 'https://affidavit.eci.gov.in'],
          ].map(([label, desc, url]) => (
            <div key={url} className="bg-[#12122a] border border-[#2a2a4a] rounded-xl p-4">
              <div className="text-xs text-[#888] uppercase tracking-wider mb-1">{label}</div>
              <div className="text-sm text-white font-medium">{desc}</div>
              <a href={url} target="_blank" className="source-link text-xs mt-1 inline-block">{url.replace('https://', '')} ↗</a>
            </div>
          ))}
        </div>
      </div>

      {/* DOSSIER PANEL */}
      <div className="mb-8">
        <DossierPanel ministerName={m.Name} />
      </div>

      {/* NOTES */}
      {m['Notes'] && (
        <div className="minister-card p-6">
          <h2 className="text-lg font-bold text-white mb-3">⬡ Public Record Notes</h2>
          <p className="text-sm text-[#aaa] leading-relaxed">{m['Notes']}</p>
          <p className="text-xs text-[#555] mt-4">Last updated: July 25, 2026 · Model v2.0</p>
        </div>
      )}
    </div>
  );
}
