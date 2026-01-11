export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-light via-white to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
              Transform PDFs{' '}
              <span className="text-primary">Instantly</span>
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Powerful PDF tools at your fingertips. Merge, split, compress, and more — all in your browser.
            </p>
            <button
              onClick={() => document.getElementById('tools')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-primary-dark text-white font-semibold rounded-xl transition-all transform hover:scale-105 hover:shadow-xl"
            >
              Get Started Free
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </button>
          </div>

          {/* Right Features */}
          <div className="space-y-4">
            {[
              { icon: '🔒', title: '100% Secure', desc: 'All processing happens locally' },
              { icon: '⚡', title: 'Lightning Fast', desc: 'Process files in seconds' },
              { icon: '∞', title: 'Unlimited Use', desc: 'No limits, completely free' },
            ].map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-6 bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
              >
                <div className="flex-shrink-0 w-14 h-14 bg-primary-light dark:bg-primary/20 rounded-xl flex items-center justify-center text-2xl">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{feature.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
