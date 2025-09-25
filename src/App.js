import React, { useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import EarthVisualization from './components/EarthVisualization';
import Sidebar from './components/Sidebar';
import TimeControls from './components/TimeControls';
import InfoPanel from './components/InfoPanel';
import { DataProvider } from './context/DataContext';
import { TimeProvider } from './context/TimeContext';

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background: #000;
  position: relative;
  overflow: hidden;
`;

const MainContent = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow-x: hidden;
`;

const GlobalStyle = createGlobalStyle`
  :root {
    --bg: #000000;
    --panel: rgba(0, 0, 0, 0.85);
    --border: rgba(255, 255, 255, 0.1);
    --text: #ffffff;
    --text-dim: rgba(255, 255, 255, 0.7);
    --accent: #00e5ff; /* NASA cyan */
    --accent-2: #4ecdc4; /* complementary */
    --danger: #eb4d4b;
    --success: #27ae60;
  }

  * { box-sizing: border-box; }

  html, body, #root { height: 100%; }

  body {
    margin: 0;
    background: var(--bg);
    color: var(--text);
    font-family: Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji";
    letter-spacing: 0.2px;
  }

  html, body { overflow-x: hidden; }

  ::selection { background: rgba(0, 229, 255, 0.3); }

  /* Sleek scrollbars */
  *::-webkit-scrollbar { width: 10px; height: 10px; }
  *::-webkit-scrollbar-track { background: transparent; }
  *::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.15); border-radius: 10px; }
  *::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.25); }
`;

const BackToEarthButton = styled.button`
  position: absolute;
  bottom: 20px;
  left: 20px;
  padding: 12px 24px;
  background: rgba(0, 0, 0, 0.8);
  border: 2px solid rgba(78, 205, 196, 0.5);
  border-radius: 25px;
  color: #4ecdc4;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  z-index: 1000;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);

  &:hover {
    background: rgba(78, 205, 196, 0.2);
    border-color: #4ecdc4;
    transform: translateY(-2px);
    box-shadow: 0 4px 15px rgba(78, 205, 196, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;
const LoadingScreen = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  
  h1 {
    color: #fff;
    font-size: 2rem;
    margin-bottom: 1rem;
  }
  
  .loader {
    width: 50px;
    height: 50px;
    border: 3px solid #333;
    border-top: 3px solid #0066cc;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

function App() {
  const [selectedSatellite, setSelectedSatellite] = useState(null);
  const [isFocusedMode, setIsFocusedMode] = useState(false);

  const handleAsteroidSelect = (asteroid) => {
    setSelectedSatellite(asteroid);
    setIsFocusedMode(true);
  };

  const handleBackToEarth = () => {
    setIsFocusedMode(false);
    setSelectedSatellite(null);
  };

  return (
    <DataProvider>
      <TimeProvider>
        <AppContainer>
          <GlobalStyle />
          <MainContent>
            <EarthVisualization 
              selectedSatellite={selectedSatellite}
              onSatelliteSelect={handleAsteroidSelect}
              isFocusedMode={isFocusedMode}
            />
            <Sidebar 
              onSatelliteSelect={setSelectedSatellite}
            />
            <TimeControls />
            {selectedSatellite && (
              <InfoPanel 
                asteroid={selectedSatellite}
                onClose={() => setSelectedSatellite(null)}
              />
            )}
            {/* Back to Earth button - only show in focused mode */}
            {isFocusedMode && (
              <BackToEarthButton onClick={handleBackToEarth}>
                ← Back to Earth
              </BackToEarthButton>
            )}
          </MainContent>
        </AppContainer>
      </TimeProvider>
    </DataProvider>
  );
}

export default App;
