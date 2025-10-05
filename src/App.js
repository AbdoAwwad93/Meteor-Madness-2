"use client"

import { useState, Component, useRef } from "react"
import styled, { createGlobalStyle } from "styled-components"
import EarthVisualization from "./components/EarthVisualization"
import Sidebar from "./components/Sidebar"
import InfoPanel from "./components/InfoPanel"
import Navbar from "./components/Navbar"
import { DataProvider } from "./context/DataContext"
import { TimeProvider } from "./context/TimeContext"
import AsteroidMovementControls from "./components/AsteroidMovementControls"
import GeminiConfig from "./components/GeminiConfig"

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
  padding-top: var(--navbar-height);
  background: transparent;
  
  @media (max-width: 768px) {
    padding-top: var(--navbar-height);
  }
  
  @media (max-width: 480px) {
    padding-top: var(--navbar-height);
  }
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
    
    /* Responsive breakpoints */
    --mobile: 480px;
    --tablet: 768px;
    --desktop: 1024px;
    --large-desktop: 1440px;
    
    /* Responsive spacing */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    
    /* Responsive font sizes */
    --font-xs: 0.75rem;
    --font-sm: 0.875rem;
    --font-base: 1rem;
    --font-lg: 1.125rem;
    --font-xl: 1.25rem;
    --font-2xl: 1.5rem;
    
    /* Responsive component sizes */
    --navbar-height: 60px;
    --sidebar-width: 320px;
    --sidebar-width-mobile: 280px;
    --panel-width: 380px;
    --panel-width-mobile: calc(100vw - 2rem);
    --controls-width: 260px;
    --controls-width-mobile: calc(100vw - 1rem);
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

  /* Responsive media queries */
  @media (max-width: 768px) {
    :root {
      --navbar-height: 56px;
      --sidebar-width: var(--sidebar-width-mobile);
      --panel-width: var(--panel-width-mobile);
      --controls-width: var(--controls-width-mobile);
      --font-xs: 0.7rem;
      --font-sm: 0.8rem;
      --font-base: 0.9rem;
      --font-lg: 1rem;
      --font-xl: 1.125rem;
      --font-2xl: 1.25rem;
    }
    
    body {
      font-size: var(--font-sm);
    }
  }

  @media (max-width: 480px) {
    :root {
      --navbar-height: 52px;
      --spacing-xs: 0.125rem;
      --spacing-sm: 0.25rem;
      --spacing-md: 0.75rem;
      --spacing-lg: 1rem;
      --spacing-xl: 1.5rem;
    }
  }

  @media (min-width: 1440px) {
    :root {
      --navbar-height: 64px;
      --sidebar-width: 360px;
      --panel-width: 420px;
      --controls-width: 300px;
    }
  }
`

const BackToEarthButton = styled.button`
  position: absolute;
  bottom: var(--spacing-lg);
  left: var(--spacing-lg);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: rgba(0, 0, 0, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius);
  color: rgba(255, 255, 255, 0.8);
  font-size: var(--font-sm);
  font-weight: 500;
  cursor: pointer;
  z-index: 1000;
  transition: all 0.2s ease;
  backdrop-filter: blur(15px);
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  box-shadow: var(--shadow);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

  &:hover {
    background: rgba(0, 102, 204, 0.2);
    border-color: #0066cc;
    color: #0066cc;
    transform: translateY(-1px);
    box-shadow: var(--shadow-lg);
  }

  &:active {
    transform: translateY(0);
  }

  .icon {
    font-size: var(--font-base);
    transition: transform 0.2s ease;
  }

  &:hover .icon {
    transform: translateX(-2px);
  }

  @media (max-width: 768px) {
    bottom: var(--spacing-md);
    left: var(--spacing-md);
    padding: var(--spacing-xs) var(--spacing-md);
    font-size: var(--font-xs);
    
    .icon {
      font-size: var(--font-sm);
    }
  }

  @media (max-width: 480px) {
    bottom: var(--spacing-sm);
    left: var(--spacing-sm);
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-xs);
    gap: var(--spacing-xs);
  }
`

const ImpactWarning = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(255, 0, 0, 0.9);
  border: 2px solid #ff4757;
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl) var(--spacing-xl);
  color: white;
  text-align: center;
  z-index: 2000;
  backdrop-filter: blur(15px);
  box-shadow: var(--shadow-lg);
  animation: pulse 1s infinite;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  max-width: 400px;
  margin: 0 var(--spacing-lg);

  @keyframes pulse {
    0% { transform: translate(-50%, -50%) scale(1); }
    50% { transform: translate(-50%, -50%) scale(1.05); }
    100% { transform: translate(-50%, -50%) scale(1); }
  }

  .title {
    font-size: var(--font-2xl);
    font-weight: 700;
    margin-bottom: var(--spacing-sm);
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .subtitle {
    font-size: var(--font-base);
    opacity: 0.9;
    margin-bottom: var(--spacing-md);
  }

  .countdown {
    font-size: var(--font-lg);
    font-weight: 600;
    color: #ffcc00;
  }

  @media (max-width: 768px) {
    padding: var(--spacing-lg);
    max-width: calc(100vw - 2rem);
    margin: 0 var(--spacing-md);
    
    .title {
      font-size: var(--font-xl);
    }
    
    .subtitle {
      font-size: var(--font-sm);
    }
    
    .countdown {
      font-size: var(--font-base);
    }
  }

  @media (max-width: 480px) {
    padding: var(--spacing-md);
    max-width: calc(100vw - 1rem);
    margin: 0 var(--spacing-sm);
    
    .title {
      font-size: var(--font-lg);
      margin-bottom: var(--spacing-xs);
    }
    
    .subtitle {
      font-size: var(--font-xs);
      margin-bottom: var(--spacing-sm);
    }
    
    .countdown {
      font-size: var(--font-sm);
    }
  }
`

// Error Boundary Component
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    if (this.props.onError) {
      this.props.onError()
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          color: 'white',
          textAlign: 'center'
        }}>
          <div>
            <h2>Error loading asteroids</h2>
            <p>Please refresh the page</p>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

function App() {
  const [selectedSatellite, setSelectedSatellite] = useState(null)
  const [isFocusedMode, setIsFocusedMode] = useState(false)
  const [movingAsteroid, setMovingAsteroid] = useState(null)
  const [movementProgress, setMovementProgress] = useState(0)
  const [movementAnimationId, setMovementAnimationId] = useState(null)
  const [activeTab, setActiveTab] = useState('asteroid-watch')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [movementControlsOpen, setMovementControlsOpen] = useState(false)
  const [cameraReachedAsteroid, setCameraReachedAsteroid] = useState(false)
  const [showImpactWarning, setShowImpactWarning] = useState(false)
  const [showInfoPanel, setShowInfoPanel] = useState(false)
  const [showGeminiConfig, setShowGeminiConfig] = useState(false)

  // Add error boundary state
  const [hasError, setHasError] = useState(false)
  
  // Camera reset ref
  const cameraResetRef = useRef()
  
  // Add a flag to prevent camera movement during reset
  const [isResettingCamera, setIsResettingCamera] = useState(false)

  const handleAsteroidSelect = (asteroid) => {
    setSelectedSatellite(asteroid)
    setIsFocusedMode(true)
    setShowInfoPanel(true)
    // Only reset camera reached state if selecting a different asteroid
    if (selectedSatellite && selectedSatellite.id !== asteroid.id) {
      setCameraReachedAsteroid(false)
    }
  }

  const handleBackToEarth = () => {
    // Set resetting flag first to prevent camera controller from interfering
    setIsResettingCamera(true)
    
    // Clear state
    setIsFocusedMode(false)
    setSelectedSatellite(null)
    setCameraReachedAsteroid(false)
    setShowInfoPanel(false)
    
    // Reset camera to default position
    if (cameraResetRef.current) {
      cameraResetRef.current.resetToDefault()
    }
  }

  const handleCloseInfoPanel = () => {
    setShowInfoPanel(false)
  }

  const handleStartMovement = (asteroid, velocity) => {
    // Stop any existing movement
    if (movementAnimationId) {
      cancelAnimationFrame(movementAnimationId)
    }

    setMovingAsteroid(asteroid)
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
        
        // Navigate to map page when asteroid reaches Earth with reduced delay
        setTimeout(() => {
          // Pass city data via URL parameters
          const cityData = asteroid.targetCity
          if (cityData) {
            const params = new URLSearchParams({
              city: cityData.name,
              lat: (cityData.coordinates?.lat || cityData.lat || 0).toString(),
              lng: (cityData.coordinates?.lng || cityData.lng || 0).toString(),
              country: cityData.country || '',
              asteroidName: asteroid.name || '',
              asteroidDiameter: (asteroid.diameter || 0.5).toString(),
              asteroidVelocity: ((asteroid.velocity || 25000) / 1000).toString()
            })
            window.location.href = `/Map/map_page.html?${params.toString()}`
          } else {
            window.location.href = '/Map/map_page.html'
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
    const newMovementControlsOpen = !movementControlsOpen
    
    // If opening movement controls and an asteroid is currently focused, reset camera to main view
    if (newMovementControlsOpen && isFocusedMode && selectedSatellite) {
      // Set resetting flag first to prevent camera controller from interfering
      setIsResettingCamera(true)
      
      // Clear focus state
      setIsFocusedMode(false)
      setSelectedSatellite(null)
      setCameraReachedAsteroid(false)
      setShowInfoPanel(false)
      
      // Reset camera to default position
      if (cameraResetRef.current) {
        cameraResetRef.current.resetToDefault()
      }
    }
    
    setMovementControlsOpen(newMovementControlsOpen)
  }

  const handleGeminiConfigSave = (apiKey) => {
    // Store the API key globally for the session
    window.geminiApiKey = apiKey;
  }

  // Error boundary fallback
  if (hasError) {
    return (
      <AppContainer>
        <GlobalStyle />
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          color: 'white',
          textAlign: 'center',
          padding: '20px'
        }}>
          <h1>🌍 Meteor Madness</h1>
          <h2>Something went wrong while loading asteroids</h2>
          <p>Please refresh the page to try again.</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              padding: '10px 20px',
              background: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Refresh Page
          </button>
        </div>
      </AppContainer>
    )
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
            <ErrorBoundary onError={() => setHasError(true)}>
              <EarthVisualization
                selectedSatellite={selectedSatellite}
                onSatelliteSelect={handleAsteroidSelect}
                isFocusedMode={isFocusedMode}
                movingAsteroid={movingAsteroid}
                movementProgress={movementProgress}
                onCameraReachedAsteroid={() => setCameraReachedAsteroid(true)}
                resetCameraRef={cameraResetRef}
                isResettingCamera={isResettingCamera}
                onResetComplete={() => setIsResettingCamera(false)}
              />
              <Sidebar onSatelliteSelect={setSelectedSatellite} isOpen={sidebarOpen} />
              {selectedSatellite && cameraReachedAsteroid && showInfoPanel && <InfoPanel asteroid={selectedSatellite} onClose={handleCloseInfoPanel} />}
            </ErrorBoundary>
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
            {showGeminiConfig && (
              <GeminiConfig
                onClose={() => setShowGeminiConfig(false)}
                onSave={handleGeminiConfigSave}
              />
            )}
          </MainContent>
        </AppContainer>
      </TimeProvider>
    </DataProvider>
  )
}

export default App
