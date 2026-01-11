interface Tool {
  id: string;
  name: string;
  icon: string;
  endpoint: string;
}

interface ToolsGridProps {
  onToolClick: (tool: Tool) => void;
}

const tools: Tool[] = [
  { id: 'merge', name: 'Merge PDF', icon: '📑', endpoint: '/api/pdf/merge' },
  { id: 'split', name: 'Split PDF', icon: '✂️', endpoint: '/api/pdf/split' },
  { id: 'compress', name: 'Compress PDF', icon: '🗜️', endpoint: '/api/pdf/compress' },
  { id: 'info', name: 'PDF Info', icon: 'ℹ️', endpoint: '/api/pdf/info' },
  { id: 'to-images', name: 'PDF to Images', icon: '🖼️', endpoint: '/api/pdf/convert-to-images' },
  { id: 'to-text', name: 'PDF to Text', icon: '📝', endpoint: '/api/pdf/convert-to-text' },
  { id: 'ranges', name: 'Split by Ranges', icon: '📊', endpoint: '/api/pdf/split-by-ranges' },
  { id: 'images-to-pdf', name: 'Images to PDF', icon: '🎨', endpoint: '/api/pdf/images-to-pdf' },
];

export default function ToolsGrid({ onToolClick }: ToolsGridProps) {
  return (
    <section id="tools" className="py-20 lg:py-32 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            8 Tools. Infinite Possibilities.
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400">
            Everything you need for PDF processing
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => onToolClick(tool)}
              className="group relative p-8 bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 hover:border-primary dark:hover:border-primary transition-all transform hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform">
                {tool.icon}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                {tool.name}
              </h3>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
