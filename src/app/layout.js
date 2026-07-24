import './globals.css';

export const metadata = {
  title: 'The Public Trust Layer — India Public Servants Confidence Score',
  description: 'Every minister. Every case. Every rupee. Evidence-based public confidence tracking.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="border-b border-[#2a2a4a] px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <a href="/" className="flex items-center gap-3 text-xl font-bold tracking-tight">
              <span className="text-[#e94560] text-2xl">⬡</span>
              <span className="text-white">Public</span>
              <span className="text-[#f5c518]">Trust Layer</span>
            </a>
            <div className="flex items-center gap-4 text-sm text-[#888]">
              <span className="flex items-center gap-1">⬡ <span className="text-[#e94560] font-bold">30</span> ministers tracked</span>
              <span className="hidden sm:inline">·</span>
              <span className="hidden sm:inline text-[#555]">Evidence-based · Verifiable · Transparent</span>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-6">
          {children}
        </main>
        <footer className="border-t border-[#2a2a4a] px-6 py-6 mt-12">
          <div className="max-w-7xl mx-auto text-center text-sm text-[#555]">
            <p>The Public Trust Layer tracks public confidence scores for every Indian government servant using verified, evidence-based data from official sources.</p>
            <p className="mt-1">Not a court. Not a verdict. A transparency layer for Indian democracy.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}