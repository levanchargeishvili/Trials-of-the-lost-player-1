import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import BeeHiveGate from './pages/BeeHiveGate';
import LastHarvestPuzzle from './pages/LastHarvestPuzzle';
import LibraryGate from './pages/LibraryGate';
import EldenRingGate from './pages/EldenRingGate';
import Preloader from './components/Preloader';
import './App.css';

function App() {
  const [assetsLoaded, setAssetsLoaded] = useState(false);

  // Enable audio autoplay on first load
  useEffect(() => {
    const enableAudio = async () => {
      try {
        const silentAudio = new Audio('data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAADhAC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAA4Qw');
        await silentAudio.play().catch(() => {});
      } catch (e) {
        // Silent fail
      }
    };
    enableAudio();
  }, []);

  // Show Preloader to load assets
  if (!assetsLoaded) {
    return <Preloader onComplete={() => setAssetsLoaded(true)} />;
  }

  // Finally show the app
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/gate-1-library" element={<LibraryGate />} />
        <Route path="/gate-2-hive" element={<BeeHiveGate />} />
        <Route path="/gate-3-the-last-harvest" element={<LastHarvestPuzzle />} />
        <Route path="/gate-4-elden-ring" element={<EldenRingGate />} />
      </Routes>
    </Router>
  );
}

export default App;
