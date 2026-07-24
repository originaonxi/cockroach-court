import './globals.css';

export const metadata = {
  title: 'The Cockroach Court — India Public Servants',
  description: 'Every minister. Every case. Every rupee. Tracked.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <header className="border-b border-[#2a2a4a] px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <a href="/" className="flex items-center gap-3 text-xl font-bold tracking-tight">
              <span className="text-[#e94560] text-2xl">⬡</span>
              <span className="text-white">Cockroach</span>
              <span className="text-[#f5c518]">Court</span>
            </a>
            <div className="flex items-center gap-4 text-sm text-[#888]">
              <span className="flex items-center gap-1">⬡ <span className="text-[#e94560] font-bold">30</span> ministers tracked</span>
              <span className="hidden sm:inline">·</span>
              <a href="https://airtable.com/appQsIke1wuAVOkpF" target="_blank" className="hover:text-white transition hidden sm:inline">Airtable Base</a>
            </div>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-6">
          {children}
        </main>
        <footer className="border-t border-[#2a2a4a] px-6 py-6 mt-12">
          <div className="max-w-7xl mx-auto text-center text-sm text-[#555]">
            <p>The Cockroach Court is a public accountability platform. Data sourced from eCourts, CAG, ECI, Lok Sabha, RTI Portal.</p>
            <p className="mt-1">Every data point links to an official government source.</p>
          </div>
        </footer>
      </body>
    </html>
  );
}