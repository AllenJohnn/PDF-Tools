export default function HowItWorks() {
  const steps = [
    { number: 1, title: 'Choose', desc: 'Pick your tool' },
    { number: 2, title: 'Upload', desc: 'Add your files' },
    { number: 3, title: 'Process', desc: "It's instant" },
    { number: 4, title: 'Download', desc: 'Get results' },
  ];

  return (
    <section id="how" className="py-20 lg:py-32 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-4xl lg:text-5xl font-bold text-center text-gray-900 dark:text-white mb-16">
          How It Works
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-primary text-white rounded-full flex items-center justify-center text-2xl font-bold mb-4 transform hover:scale-110 transition-transform">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {step.desc}
                </p>
              </div>
              
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-1/2 w-full h-0.5 bg-gray-300 dark:bg-gray-600" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
