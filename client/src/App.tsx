import { useState, useEffect } from "react";
import { useUIStore, useToolStore } from "./store";
import { ErrorBoundary } from "./components/ErrorBoundary";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import ToolsGrid from "./components/ToolsGrid";
import Footer from "./components/Footer";
import ProcessingModal from "./components/ProcessingModal";
import ResultsModal from "./components/ResultsModal";

function App() {
  const { showProcessing, showResults, setShowProcessing, setShowResults } = useUIStore();
  const { selectTool, selectedTool } = useToolStore();
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const handleToolClick = (tool: any) => {
    selectTool(tool);
    setShowProcessing(true);
  };

  return (
    <ErrorBoundary>
      <div>
        <div className="min-h-screen bg-white dark:bg-black text-black dark:text-white">
          <div className="max-w-6xl mx-auto px-6 pb-16">
            <Navbar isDark={isDark} onToggleTheme={() => setIsDark(!isDark)} />
            <Hero onPrimaryCta={() => document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" })} />
            <ToolsGrid onToolClick={handleToolClick} />
            <Footer />
          </div>

          {showProcessing && (
            <ProcessingModal
              tool={selectedTool}
              onClose={() => setShowProcessing(false)}
              onComplete={() => {
                setShowProcessing(false);
                setShowResults(true);
              }}
            />
          )}

          {showResults && <ResultsModal onClose={() => setShowResults(false)} />}
        </div>
      </div>
    </ErrorBoundary>
  );
}

export default App;
