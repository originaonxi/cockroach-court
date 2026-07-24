'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const STATUS_COLORS = { positive: '#00c853', neutral: '#555', negative: '#ff1744' };

export default function DossierPanel({ ministerName }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [entered, setEntered] = useState(false);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    fetch(`/api/records/${encodeURIComponent(ministerName)}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false); })
      .catch(e => { setError(e.message); setLoading(false); });
  }, [ministerName]);

  if (!entered) {
    return (
      <div className="minister-card p-8 mb-6 text-center">
        <div className="text-4xl mb-4">⚠</div>
        <h2 className="text-xl font-bold text-white mb-3">Public Records Dossier</h2>
        <p className="text-sm text-[#aaa] mb-4 max-w-xl mx-auto">
          This dossier contains verified public records about this minister — court cases, 
          CAG audits, news reports, parliamentary data, and citizen-submitted evidence.
        </p>
        <p className="text-xs text-[#555] mb-6">
          All data is sourced from official government portals: eCourts, CAG, ECI, Lok Sabha, RTI.
          You have a constitutional right to this information under Article 19(1)(a) and the RTI Act 2005.
        </p>
        <button
          onClick={() => setEntered(true)}
          className="bg-[#e94560] hover:bg-[#d63850] text-white font-semibold py-3 px-8 rounded-xl transition"
        >
          I am 18+. Enter Dossier →
        </button>
      </div>
    );
  }

  if (loading) return <div className="minister-card p-6 text-center text-[#888]">📡 Loading dossier data...</div>;
  if (error) return <div className="minister-card p-6 text-center text-[#ff1744]">Error: {error}</div>;
  if (!data) return null;

  const pieData = [
    { name: 'Positive', value: data.positive, color: STATUS_COLORS.positive },
    { name: 'Neutral', value: data.neutral, color: STATUS_COLORS.neutral },
    { name: 'Negative', value: data.negative, color: STATUS_COLORS.negative },
  ].filter(d => d.value > 0);

  const barData = [
    { name: 'Public Confidence', score: data.supportScore, fill: '#00c853' },
    { name: 'Evidence Level', score: data.resignScore, fill: '#ff1744' },
  ];

  const displayed = showAll ? data.records : data.records.slice(0, 15);

  return (
    <div>
      {/* SCORES + CHART ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="stat-box">
          <div className="stat-label">Public Confidence Score</div>
          <div className="text-4xl font-bold text-[#00c853] mb-2">{data.supportScore}</div>
          <div className="score-bar">
            <div className="score-fill" style={{ width: `${data.supportScore * 10}%`, background: '#00c853' }} />
          </div>
        </div>
        <div className="stat-box">
          <div className="stat-label">Evidence Level</div>
          <div className="text-4xl font-bold text-[#ff1744] mb-2">{data.resignScore}</div>
          <div className="score-bar">
            <div className="score-fill" style={{ width: `${data.resignScore * 10}%`, background: '#ff1744' }} />
          </div>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="stat-box">
          <h3 className="text-sm font-semibold text-white mb-2">Record Sentiment Breakdown</h3>
          <p className="text-xs text-[#888] mb-3">{data.totalRecords} total records collected</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Legend formatter={(v) => <span style={{ color: '#aaa', fontSize: 12 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
          {data.totalRecords > 0 && (
            <div className="flex justify-center gap-6 text-xs mt-2">
              <span className="text-[#00c853]">+{data.positive} good</span>
              <span className="text-[#555]">∘{data.neutral} neutral</span>
              <span className="text-[#ff1744]">-{data.negative} bad</span>
            </div>
          )}
        </div>
        <div className="stat-box">
          <h3 className="text-sm font-semibold text-white mb-2">Score Comparison</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData}>
              <XAxis dataKey="name" tick={{ fill: '#888', fontSize: 12 }} />
              <YAxis domain={[0, 10]} tick={{ fill: '#555', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a4a', borderRadius: 8, color: '#fff' }} />
              <Bar dataKey="score" radius={[6, 6, 0, 0]}>
                {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* RECORDS DOSSIER */}
      <div className="minister-card p-6 mb-6">
        <h2 className="text-lg font-bold text-white mb-4 flex items-center justify-between">
          <span>📋 The Dossier — {data.totalRecords} Records</span>
          <span className="text-xs bg-[#2a2a4a] text-[#888] px-2 py-0.5 rounded-full">
            {data.positive}↑ {data.negative}↓ {data.neutral}∘
          </span>
        </h2>

        <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
          {displayed.map((rec) => (
            <div key={rec.id} className="bg-[#12122a] border border-[#2a2a4a] rounded-xl p-3 hover:border-[#e9456044] transition">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                      rec.type === 'News' ? 'bg-blue-900/30 text-blue-400' :
                      rec.type === 'Performance Metric' ? 'bg-green-900/30 text-green-400' :
                      'bg-[#2a2a4a] text-[#888]'
                    }`}>{rec.type}</span>
                    <span className="text-[10px] text-[#555]">{rec.domain}</span>
                  </div>
                  <p className="text-sm text-white font-medium">{rec.title}</p>
                  {rec.description && <p className="text-xs text-[#888] mt-1 line-clamp-2">{rec.description}</p>}
                </div>
                {rec.url && (
                  <a href={rec.url} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-[#64b5f6] hover:text-white shrink-0 mt-1">
                    ↗ Source
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        {data.records.length > 15 && (
          <button onClick={() => setShowAll(!showAll)}
            className="mt-3 text-sm text-[#64b5f6] hover:text-white w-full text-center py-2 border-t border-[#2a2a4a]">
            {showAll ? 'Show less' : `Show all ${data.records.length} records`}
          </button>
        )}
      </div>

      {/* CONTRIBUTE */}
      <div className="minister-card p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold text-sm">✏ Contribute to this Dossier</h3>
            <p className="text-xs text-[#888] mt-1">Found a missing record? Add it via GitHub or Airtable.</p>
          </div>
          <div className="flex gap-2">
            <a href={`https://airtable.com/appQsIke1wuAVOkpF/tblOmOELPHRs152ur`} target="_blank"
              className="bg-[#2a2a4a] hover:bg-[#3a3a5a] text-white text-xs font-semibold py-2 px-4 rounded-lg transition">
              Airtable ↗
            </a>
            <a href="https://github.com/originaonxi/cockroach-court" target="_blank"
              className="bg-[#e94560] hover:bg-[#d63850] text-white text-xs font-semibold py-2 px-4 rounded-lg transition">
              Edit on GitHub ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}