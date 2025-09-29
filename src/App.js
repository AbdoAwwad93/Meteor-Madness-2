"use client"

import { useState } from "react"
import styled, { createGlobalStyle } from "styled-components"
import EarthVisualization from "./components/EarthVisualization"
import Sidebar from "./components/Sidebar"
import InfoPanel from "./components/InfoPanel"
import Navbar from "./components/Navbar"
import { DataProvider } from "./context/DataContext"
import { TimeProvider } from "./context/TimeContext"
import AsteroidMovementControls from "./components/AsteroidMovementControls"

const AppContainer = styled.div`
  width: 100vw;
  height: 100vh;
  background: transparent;
  position: relative;
  overflow: hidden;
`

const MainContent = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
  overflow-x: hidden;
  padding-top: 60px; /* Account for navbar height */
  background: transparent;
`

const GlobalStyle = createGlobalStyle`
  :root {
    --bg: #0a0a0a;
    --bg-secondary: #111111;
    --panel: rgba(15, 15, 15, 0.95);
    --panel-secondary: rgba(25, 25, 25, 0.9);
    --border: rgba(255, 255, 255, 0.08);
    --border-active: rgba(0, 229, 255, 0.3);
    --text: #ffffff;
    --text-secondary: rgba(255, 255, 255, 0.8);
    --text-dim: rgba(255, 255, 255, 0.6);
    --text-muted: rgba(255, 255, 255, 0.4);
    --accent: #00e5ff; /* NASA mission control cyan */
    --accent-secondary: #0099cc; /* darker cyan */
    --accent-tertiary: #4ecdc4; /* complementary teal */
    --success: #00ff88; /* bright green for active states */
    --warning: #ffaa00; /* amber for warnings */
    --danger: #ff4757; /* red for errors/danger */
    --info: #5352ed; /* blue for information */
    --radius: 0.5rem;
    --radius-sm: 0.25rem;
    --radius-lg: 0.75rem;
    --shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    --shadow-lg: 0 8px 40px rgba(0, 0, 0, 0.6);
  }

  * { 
    box-sizing: border-box; 
    margin: 0;
    padding: 0;
  }

  html, body, #root { height: 100%; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    font-weight: 400;
    line-height: 1.5;
    letter-spacing: -0.01em;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  html, body { overflow-x: hidden; }

  ::selection { 
    background: rgba(0, 229, 255, 0.25); 
    color: white;
  }

  /* Professional scrollbars */
  *::-webkit-scrollbar { 
    width: 8px; 
    height: 8px; 
  }
  *::-webkit-scrollbar-track { 
    background: var(--bg-secondary); 
    border-radius: 4px;
  }
  *::-webkit-scrollbar-thumb { 
    background: rgba(255, 255, 255, 0.2); 
    border-radius: 4px;
    border: 1px solid var(--bg-secondary);
  }
  *::-webkit-scrollbar-thumb:hover { 
    background: rgba(255, 255, 255, 0.3); 
  }

  /* Focus styles for accessibility */
  button:focus-visible,
  input:focus-visible,
  select:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }

  /* Force navbar transparency */
  nav.transparent-navbar,
  .transparent-navbar,
  nav[class*="transparent"] {
    background: transparent !important;
    background-color: transparent !important;
    backdrop-filter: none !important;
    border: none !important;
    box-shadow: none !important;
  }

  /* Override any styled-components */
  nav {
    background: transparent !important;
    background-color: transparent !important;
  }
`

const BackToEarthButton = styled.button`
  position: absolute;
  bottom: 20px;
  left: 20px;
  padding: 12px 20px;
  background: rgba(0, 0, 0, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  z-index: 1000;
  transition: all 0.2s ease;
  backdrop-filter: blur(15px);
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

  &:hover {
    background: rgba(0, 102, 204, 0.2);
    border-color: #0066cc;
    color: #0066cc;
    transform: translateY(-1px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
  }

  &:active {
    transform: translateY(0);
  }

  .icon {
    font-size: 1rem;
    transition: transform 0.2s ease;
  }

  &:hover .icon {
    transform: translateX(-2px);
  }
`

const ImpactWarning = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 0, 0, 0.9);
  border: 2px solid #ff4757;
  border-radius: 12px;
  padding: 30px 40px;
  color: white;
  text-align: center;
  z-index: 2000;
  backdrop-filter: blur(15px);
  box-shadow: 0 20px 60px rgba(255, 0, 0, 0.5);
  animation: pulse 1s infinite;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  max-width: 400px;

  @keyframes pulse {
    0% { transform: translate(-50%, -50%) scale(1); }
    50% { transform: translate(-50%, -50%) scale(1.05); }
    100% { transform: translate(-50%, -50%) scale(1); }
  }

  .title {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .subtitle {
    font-size: 16px;
    opacity: 0.9;
    margin-bottom: 15px;
  }

  .countdown {
    font-size: 18px;
    font-weight: 600;
    color: #ffcc00;
  }
`
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
`

function App() {
  const [selectedSatellite, setSelectedSatellite] = useState(null)
  const [isFocusedMode, setIsFocusedMode] = useState(false)
  const [movingAsteroid, setMovingAsteroid] = useState(null)
  const [movementProgress, setMovementProgress] = useState(0)
  const [movementVelocity, setMovementVelocity] = useState(0.5)
  const [movementAnimationId, setMovementAnimationId] = useState(null)
  const [activeTab, setActiveTab] = useState('asteroid-watch')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [movementControlsOpen, setMovementControlsOpen] = useState(false)
  const [cameraReachedAsteroid, setCameraReachedAsteroid] = useState(false)
  const [showImpactWarning, setShowImpactWarning] = useState(false)

  const handleAsteroidSelect = (asteroid) => {
    setSelectedSatellite(asteroid)
    setIsFocusedMode(true)
    // Only reset camera reached state if selecting a different asteroid
    if (selectedSatellite && selectedSatellite.id !== asteroid.id) {
      setCameraReachedAsteroid(false)
    }
  }

  const handleBackToEarth = () => {
    setIsFocusedMode(false)
    setSelectedSatellite(null)
    setCameraReachedAsteroid(false)
  }

  const handleStartMovement = (asteroid, velocity) => {
    // Stop any existing movement
    if (movementAnimationId) {
      cancelAnimationFrame(movementAnimationId)
    }

    setMovingAsteroid(asteroid)
    setMovementVelocity(velocity)
    setMovementProgress(0)

    const startTime = Date.now()
    const animate = () => {
      const elapsed = Date.now() - startTime
      // Increased speed multiplier for faster movement
      const progress = Math.min((elapsed / 1000) * velocity * 0.000002, 1)

      setMovementProgress(progress)

      // Show impact warning when progress is above 90%
      if (progress > 0.9 && !showImpactWarning) {
        setShowImpactWarning(true)
      }

      if (progress < 1) {
        const animId = requestAnimationFrame(animate)
        setMovementAnimationId(animId)
      } else {
        setMovementAnimationId(null)
        console.log("[v0] Asteroid movement completed - Impact!")
        
        // Navigate to map page when asteroid reaches Earth with reduced delay
        setTimeout(() => {
          // Pass city data via URL parameters
          const cityData = asteroid.targetCity
          if (cityData) {
            const params = new URLSearchParams({
              city: cityData.name,
              lat: cityData.lat.toString(),
              lng: cityData.lng.toString(),
              country: cityData.country || '',
              asteroidName: asteroid.name || '',
              asteroidDiameter: (asteroid.diameter || 0.5).toString(),
              asteroidVelocity: ((asteroid.velocity || 25000) / 1000).toString()
            })
            window.location.href = `/map_page.html?${params.toString()}`
          } else {
            window.location.href = '/map_page.html'
          }
        }, 500) // Reduced delay from 1000ms to 500ms
      }
    }

    const animId = requestAnimationFrame(animate)
    setMovementAnimationId(animId)
  }

  const handleStopMovement = () => {
    if (movementAnimationId) {
      cancelAnimationFrame(movementAnimationId)
      setMovementAnimationId(null)
    }
    setMovingAsteroid(null)
    setMovementProgress(0)
    setShowImpactWarning(false)
  }


  const handleTabChange = (tab) => {
    setActiveTab(tab)
    if (tab === 'asteroid-watch') {
      setSidebarOpen(true)
    }
  }

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const handleToggleMovement = () => {
    setMovementControlsOpen(!movementControlsOpen)
  }

  return (
    <DataProvider>
      <TimeProvider>
        <AppContainer>
          <GlobalStyle />
          <Navbar 
            activeTab={activeTab}
            onTabChange={handleTabChange}
            onToggleSidebar={handleToggleSidebar}
            onToggleMovement={handleToggleMovement}
            sidebarOpen={sidebarOpen}
            movementControlsOpen={movementControlsOpen}
          />
          <MainContent>
            <EarthVisualization
              selectedSatellite={selectedSatellite}
              onSatelliteSelect={handleAsteroidSelect}
              isFocusedMode={isFocusedMode}
              movingAsteroid={movingAsteroid}
              movementProgress={movementProgress}
              onCameraReachedAsteroid={() => setCameraReachedAsteroid(true)}
            />
            <Sidebar onSatelliteSelect={setSelectedSatellite} isOpen={sidebarOpen} />
            {selectedSatellite && cameraReachedAsteroid && <InfoPanel asteroid={selectedSatellite} onClose={() => setSelectedSatellite(null)} />}
            {isFocusedMode && (
              <BackToEarthButton onClick={handleBackToEarth}>
                <span className="icon">←</span>
                Back to Earth
              </BackToEarthButton>
            )}
            {showImpactWarning && (
              <ImpactWarning>
                <div className="title">⚠️ IMPACT IMMINENT</div>
                <div className="subtitle">Asteroid approaching Earth!</div>
                <div className="countdown">Redirecting to impact analysis...</div>
              </ImpactWarning>
            )}
            <AsteroidMovementControls
              onStartMovement={handleStartMovement}
              onStopMovement={handleStopMovement}
              isMoving={!!movingAsteroid}
              isOpen={movementControlsOpen}
            />
          </MainContent>
        </AppContainer>
      </TimeProvider>
    </DataProvider>
  )
}

export default App
