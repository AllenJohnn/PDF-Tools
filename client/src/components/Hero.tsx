interface HeroProps {
  onPrimaryCta: () => void;
}

export default function Hero({ onPrimaryCta }: HeroProps) {
  return (
    <section className="py-28">
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-full text-sm font-medium mb-8">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            100% Local Processing
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
            Professional PDF Tools for Modern Workflows
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
            Fast, secure, and entirely local. Process your PDFs without uploading to any server. Your privacy is guaranteed.
          </p>
          
          <div className="flex flex-wrap gap-4">
            <button
              onClick={onPrimaryCta}
              className="group inline-flex items-center gap-2 px-8 py-4 bg-black dark:bg-white text-white dark:text-black font-semibold rounded-xl hover:opacity-90 transition-all transform hover:scale-105"
            >
              Get Started
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>
            
            <a
              href="/api-docs"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-gray-900 text-black dark:text-white font-semibold rounded-xl border-2 border-gray-200 dark:border-gray-800 hover:border-gray-900 dark:hover:border-gray-100 transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              View API Docs
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
