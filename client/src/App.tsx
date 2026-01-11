import { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ToolsGrid from './components/ToolsGrid';
import HowItWorks from './components/HowItWorks';
import Footer from './components/Footer';
import ProcessingModal from './components/ProcessingModal';
import ResultsModal from './components/ResultsModal';

function App() {
  const [isDark, setIsDark] = useState(false);
  const [showProcessingModal, setShowProcessingModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [selectedTool, setSelectedTool] = useState<any>(null);

  const handleToolClick = (tool: any) => {
    setSelectedTool(tool);
    setShowProcessingModal(true);
  };

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
        <Navbar isDark={isDark} toggleTheme={() => setIsDark(!isDark)} />
        <Hero />
        <ToolsGrid onToolClick={handleToolClick} />
        <HowItWorks />
        <Footer />
        
        {showProcessingModal && (
          <ProcessingModal
            tool={selectedTool}
            onClose={() => setShowProcessingModal(false)}
            onComplete={() => {
              setShowProcessingModal(false);
              setShowResultsModal(true);
            }}
          />
        )}
        
        {showResultsModal && (
          <ResultsModal onClose={() => setShowResultsModal(false)} />
        )}
      </div>
    </div>
  );
}

export default App;
