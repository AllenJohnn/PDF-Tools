interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  endpoint: string;
}

interface ToolsGridProps {
  onToolClick: (tool: Tool) => void;
}

const tools: Tool[] = [
  { id: "merge", name: "Merge PDFs", description: "Combine multiple PDFs into one", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", endpoint: "/api/pdf/merge" },
  { id: "split", name: "Split PDF", description: "Extract pages from PDF", icon: "M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4", endpoint: "/api/pdf/split" },
  { id: "compress", name: "Compress", description: "Reduce PDF file size", icon: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4", endpoint: "/api/pdf/compress" },
  { id: "info", name: "PDF Info", description: "View metadata & details", icon: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z", endpoint: "/api/pdf/info" },
  { id: "to-images", name: "PDF to Images", description: "Convert to PNG or JPEG", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", endpoint: "/api/pdf/convert-to-images" },
  { id: "to-text", name: "PDF to Text", description: "Extract text content", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", endpoint: "/api/pdf/convert-to-text" },
  { id: "ranges", name: "Split by Ranges", description: "Custom page splitting", icon: "M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12", endpoint: "/api/pdf/split-by-ranges" },
  { id: "images-to-pdf", name: "Images to PDF", description: "Create PDF from images", icon: "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z", endpoint: "/api/pdf/images-to-pdf" }
];

export default function ToolsGrid({ onToolClick }: ToolsGridProps) {
  return (
    <section id="tools" className="py-20 bg-gray-50 dark:bg-gray-950">
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold mb-3">Available Tools</h2>
          <p className="text-lg text-gray-600 dark:text-gray-400">Choose a tool to get started processing your PDFs</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {tools.map((tool, index) => (
            <button
              key={tool.id}
              onClick={() => onToolClick(tool)}
              style={{ animationDelay: `${index * 50}ms` }}
              className="group p-6 bg-white dark:bg-black border-2 border-gray-200 dark:border-gray-800 rounded-2xl hover:border-gray-900 dark:hover:border-gray-100 hover:shadow-xl transition-all text-left transform hover:-translate-y-1 animate-[fadeIn_0.5s_ease-out_forwards] opacity-0"
            >
              <div className="w-12 h-12 mb-4 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-900 group-hover:bg-black dark:group-hover:bg-white transition-all group-hover:scale-110">
                <svg className="w-6 h-6 text-gray-700 dark:text-gray-300 group-hover:text-white dark:group-hover:text-black transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tool.icon} />
                </svg>
              </div>
              <h3 className="font-semibold text-lg mb-2">
                {tool.name}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {tool.description}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
