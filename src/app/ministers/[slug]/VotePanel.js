'use client';

import { useState } from 'react';

export default function VotePanel({ ministerName, supportScore, resignScore }) {
  const [voted, setVoted] = useState(null);
  const [verified, setVerified] = useState(false);
  const [showDigiLocker, setShowDigiLocker] = useState(false);

  const handleVote = (type) => {
    if (!verified) {
      setShowDigiLocker(true);
      return;
    }
    setVoted(type);
    // TODO: POST /api/vote with DigiLocker nullifier
  };

  const handleDigiLockerVerify = () => {
    // TODO: Real DigiLocker OAuth flow
    // window.location.href = 'https://sandbox.digilocker.gov.in/oauth/authorize?client_id=...&redirect_uri=...';
    setVerified(true);
    setShowDigiLocker(false);
  };

  return (
    <div>
      {/* VOTING CARD */}
      <div className="minister-card p-6 mb-6">
        <h2 className="text-lg font-bold text-white mb-2">⬡ Cast Your Citizen Vote</h2>
        <p className="text-sm text-[#888] mb-5">
          Verify with DigiLocker (Aadhaar) to cast your vote. One person, one vote per minister.
          <span className="block text-xs text-[#555] mt-1">Your identity is protected via zero-knowledge proofs — we never store your Aadhaar number.</span>
        </p>

        {!verified ? (
          <div>
            <button
              onClick={() => setShowDigiLocker(true)}
              className="w-full bg-[#e94560] hover:bg-[#d63850] text-white font-semibold py-3 px-6 rounded-xl transition flex items-center justify-center gap-2"
            >
              <span>🔐</span> Verify with DigiLocker to Vote
            </button>

            {showDigiLocker && (
              <div className="mt-4 p-4 border border-[#2a2a4a] rounded-xl bg-[#12122a]">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-sm">DL</div>
                  <div>
                    <p className="text-white font-medium text-sm">DigiLocker Verification</p>
                    <p className="text-xs text-[#888]">Powered by Government of India</p>
                  </div>
                </div>
                <div className="space-y-2 mb-4 text-xs text-[#aaa]">
                  <p className="flex items-center gap-2">✓ Aadhaar e-KYC — we never see your number</p>
                  <p className="flex items-center gap-2">✓ Zero-Knowledge Proof — anonymous nullifier on-chain</p>
                  <p className="flex items-center gap-2">✓ One identity = one vote per minister, forever</p>
                </div>
                <button
                  onClick={handleDigiLockerVerify}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-lg transition text-sm"
                >
                  Continue with DigiLocker →
                </button>
              </div>
            )}
          </div>
        ) : voted ? (
          <div className="text-center py-4">
            <p className="text-2xl mb-2">{voted === 'support' ? '👍' : '📢'}</p>
            <p className="text-white font-semibold">
              You voted to <span className={voted === 'support' ? 'text-[#00c853]' : 'text-[#ff1744]'}>
                {voted === 'support' ? 'Confidence' : 'Low Confidence'} {ministerName}
              </span>
            </p>
            <p className="text-xs text-[#555] mt-2">This vote is cryptographically linked to your verified identity.</p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-[#00c853] mb-3 flex items-center gap-2">
              ✓ Verified via DigiLocker
            </p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleVote('support')}
                className="bg-[#00c85322] hover:bg-[#00c85344] border border-[#00c85344] text-white font-semibold py-4 px-6 rounded-xl transition text-center"
              >
                <div className="text-2xl mb-1">👍</div>
                <div className="text-sm">High Confidence</div>
                <div className="text-xs text-[#00c853] font-bold mt-1">{supportScore.toFixed(1)}</div>
              </button>
              <button
                onClick={() => handleVote('resign')}
                className="bg-[#ff174422] hover:bg-[#ff174444] border border-[#ff174444] text-white font-semibold py-4 px-6 rounded-xl transition text-center"
              >
                <div className="text-2xl mb-1">📢</div>
                <div className="text-sm">Low Confidence</div>
                <div className="text-xs text-[#ff1744] font-bold mt-1">{resignScore.toFixed(1)}</div>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* HOW VOTING WORKS */}
      <div className="text-xs text-[#555] mb-6 p-4 border border-[#2a2a4a] rounded-xl">
        <p className="font-semibold text-[#888] mb-1">⚡ How the scoring works</p>
        <p>Scores use Quadratic Voting — your voting power adjusts based on how many verified reports you've submitted. One person = one base vote. Submit verified RTI responses or court case links to earn Civic Reputation weight.</p>
      </div>
    </div>
  );
}