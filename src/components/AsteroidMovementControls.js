"use client"

import { useState } from "react"
import styled from "styled-components"
import { useData } from "../context/DataContext"
import { enhanceAsteroidData, calculateTimeToImpact, formatTimeDuration } from "../utils/asteroidCalculations"

const ControlsContainer = styled.div`
  position: fixed;
  top: 80px;
  right: 20px;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 20px;
  color: white;
  z-index: 1000;
  min-width: 280px;
  max-width: 350px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  transform: translateX(${props => props.$isOpen ? '0' : '100%'});
  opacity: ${props => props.$isOpen ? '1' : '0'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: ${props => props.$isOpen ? 'auto' : 'none'};
`

const PrimaryButton = styled.button`
  width: 100%;
  padding: 12px 16px;
  background: #0066cc;
  border: 1px solid #0088ff;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;

  &:hover {
    background: #0088ff;
    border-color: #00aaff;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 102, 204, 0.4);
  }

  &:active {
    transform: translateY(0);
    background: #0052a3;
  }

  &:disabled {
    background: #333;
    border-color: #555;
    cursor: not-allowed;
    opacity: 0.6;
  }

  .icon {
    font-size: 1rem;
  }
`

const FormGroup = styled.div`
  margin-bottom: 16px;
  
  label {
    display: block;
    margin-bottom: 6px;
    font-size: 12px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  select, input {
    width: 100%;
    padding: 10px 12px;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(0, 0, 0, 0.3);
    color: white;
    font-size: 14px;
    font-family: inherit;
    transition: all 0.2s ease;
    
    &:focus {
      outline: none;
      border-color: #0066cc;
      box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
      background: rgba(0, 0, 0, 0.5);
    }

    &::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }
  }
  
  option {
    background: #1a1a1a;
    color: white;
    padding: 8px;
  }
`

const SuccessButton = styled.button`
  width: 100%;
  padding: 12px 16px;
  background: #00aa44;
  border: 1px solid #00cc55;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;

  &:hover {
    background: #00cc55;
    border-color: #00ee66;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 170, 68, 0.4);
  }

  &:disabled {
    background: #333;
    border-color: #555;
    cursor: not-allowed;
    opacity: 0.6;
    transform: none;
    box-shadow: none;
  }

  .icon {
    font-size: 1rem;
  }
`

const SecondaryButton = styled.button`
  width: 100%;
  padding: 10px 16px;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: inherit;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: #0066cc;
    color: #0066cc;
    transform: translateY(-1px);
  }
`

const DangerButton = styled.button`
  width: 100%;
  padding: 10px 16px;
  background: transparent;
  border: 1px solid rgba(255, 71, 87, 0.3);
  border-radius: 6px;
  color: #ff4757;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: inherit;

  &:hover {
    background: rgba(255, 71, 87, 0.1);
    border-color: #ff4757;
    transform: translateY(-1px);
  }
`

const StatusDisplay = styled.div`
  text-align: center;
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  border-left: 4px solid #00aa44;
  
  .title {
    color: #00aa44;
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .subtitle {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
  }
`

const ImpactPreview = styled.div`
  margin-bottom: 16px;
  padding: 12px;
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
  border-radius: 6px;
  
  .title {
    color: #ff4757;
    font-weight: 600;
    font-size: 12px;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .impact-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    font-size: 11px;
    
    .stat {
      display: flex;
      justify-content: space-between;
      color: rgba(255, 255, 255, 0.8);
      
      .label {
        color: rgba(255, 255, 255, 0.6);
      }
      
      .value {
        font-weight: 500;
        color: #ff4757;
      }
    }
  }
`

const TargetInfo = styled.div`
  margin-bottom: 12px;
  padding: 8px;
  background: rgba(0, 102, 204, 0.1);
  border: 1px solid rgba(0, 102, 204, 0.3);
  border-radius: 4px;
  font-size: 11px;
  
  .target-coords {
    font-weight: 600;
    color: #0066cc;
    margin-bottom: 2px;
  }
  
  .target-details {
    color: rgba(255, 255, 255, 0.7);
    display: flex;
    justify-content: space-between;
  }
`

const Header = styled.div`
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  .title {
    font-weight: 600;
    color: #0066cc;
    font-size: 14px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .subtitle {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.6);
    margin-top: 4px;
  }
`

export default function AsteroidMovementControls({ onStartMovement, onStopMovement, isMoving, isOpen, targetPosition, onTargetPositionChange, onSelectionModeChange }) {
  const { satellites } = useData()
  const [showControls, setShowControls] = useState(false)
  const [selectedAsteroid, setSelectedAsteroid] = useState("")
  const [velocity, setVelocity] = useState("")
  const [isSelectionMode, setIsSelectionMode] = useState(false)

  const handleStartMovement = () => {
    if (!selectedAsteroid || !targetPosition) return

    const asteroid = satellites.find((a) => a.id === selectedAsteroid)
    if (!asteroid) return

    const finalVelocity = velocity ? Number.parseFloat(velocity) : asteroid.velocity || 0.5

    // Enhance asteroid data with calculated properties
    const enhancedAsteroid = enhanceAsteroidData(asteroid)
    
    // Add target position information
    const asteroidWithTarget = {
      ...enhancedAsteroid,
      targetPosition: targetPosition
    }

    onStartMovement(asteroidWithTarget, finalVelocity)
    setShowControls(false)
    setIsSelectionMode(false)
    if (onSelectionModeChange) onSelectionModeChange(false)
  }

  const handleStopMovement = () => {
    onStopMovement()
    setShowControls(false)
    setSelectedAsteroid("")
    setVelocity("")
    setIsSelectionMode(false)
    if (onSelectionModeChange) onSelectionModeChange(false)
  }

  const handleAsteroidSelect = (asteroidId) => {
    setSelectedAsteroid(asteroidId)
    if (asteroidId) {
      setIsSelectionMode(true)
      if (onSelectionModeChange) onSelectionModeChange(true)
    } else {
      setIsSelectionMode(false)
      if (onSelectionModeChange) onSelectionModeChange(false)
    }
  }

  // Calculate impact preview when both asteroid and target are selected
  const getImpactPreview = () => {
    if (!selectedAsteroid || !targetPosition) return null

    const asteroid = satellites.find((a) => a.id === selectedAsteroid)
    if (!asteroid) return null

    const enhancedAsteroid = enhanceAsteroidData(asteroid)
    const timeToImpact = calculateTimeToImpact(asteroid.distance || 1000000, enhancedAsteroid.velocity / 1000)

    return {
      energyTNT: enhancedAsteroid.energyTNT,
      craterDiameter: enhancedAsteroid.craterDiameter,
      damageRadius: enhancedAsteroid.damageRadius,
      timeToImpact: formatTimeDuration(timeToImpact),
      severity: enhancedAsteroid.severity
    }
  }

  if (!showControls && !isMoving) {
    return (
      <ControlsContainer $isOpen={isOpen}>
        <SecondaryButton onClick={() => setShowControls(true)}>
          <span className="icon"></span>
          Simulate Movement
        </SecondaryButton>
      </ControlsContainer>
    )
  }

  if (isMoving) {
    return (
      <ControlsContainer $isOpen={isOpen}>
      
        <DangerButton onClick={handleStopMovement}>
          <span className="icon">⏹</span>
          Abort Mission
        </DangerButton>
      </ControlsContainer>
    )
  }

  const impactPreview = getImpactPreview()

  return (
    <ControlsContainer $isOpen={isOpen}>
      <Header>
        <div className="title">Asteroid Impact Simulation</div>
        <div className="subtitle">Select asteroid and click on Earth to target</div>
      </Header>

      <FormGroup>
        <label>Select Asteroid</label>
        <select value={selectedAsteroid} onChange={(e) => handleAsteroidSelect(e.target.value)}>
          <option value="">Select Asteroid...</option>
          {satellites.map((asteroid) => (
            <option key={asteroid.id} value={asteroid.id}>
              {asteroid.name} (Ø {asteroid.diameter?.toFixed(2)}km)
            </option>
          ))}
        </select>
      </FormGroup>

      {targetPosition && (
        <TargetInfo>
          <div className="target-coords">Target Selected</div>
          <div className="target-details">
            <span>Lat: {targetPosition.lat?.toFixed(2)}°</span>
            <span>Lng: {targetPosition.lng?.toFixed(2)}°</span>
          </div>
        </TargetInfo>
      )}

      {!targetPosition && selectedAsteroid && (
        <div style={{ 
          padding: '12px', 
          background: 'rgba(255, 193, 7, 0.1)', 
          border: '1px solid rgba(255, 193, 7, 0.3)', 
          borderRadius: '4px',
          fontSize: '12px',
          color: '#ffc107',
          textAlign: 'center',
          marginBottom: '12px'
        }}>
          Click anywhere on Earth to select target
        </div>
      )}

      {!selectedAsteroid && (
        <div style={{ 
          padding: '12px', 
          background: 'rgba(100, 100, 100, 0.1)', 
          border: '1px solid rgba(100, 100, 100, 0.3)', 
          borderRadius: '4px',
          fontSize: '12px',
          color: '#666666',
          textAlign: 'center',
          marginBottom: '12px'
        }}>
          Select an asteroid first to enable targeting
        </div>
      )}

      <FormGroup>
        <label>Velocity Override (km/s)</label>
        <input
          type="number"
          step="0.1"
          min="0.1"
          max="50"
          value={velocity}
          onChange={(e) => setVelocity(e.target.value)}
          placeholder={
            selectedAsteroid
              ? `Default: ${((satellites.find((a) => a.id === selectedAsteroid)?.velocity || 25000) / 1000).toFixed(1)}`
              : "Use default velocity"
          }
        />
      </FormGroup>

      {impactPreview && (
        <ImpactPreview>
          <div className="title">Impact Preview</div>
          <div className="impact-stats">
            <div className="stat">
              <span className="label">Energy:</span>
              <span className="value">{impactPreview.energyTNT.toFixed(1)} TNT</span>
            </div>
            <div className="stat">
              <span className="label">Crater:</span>
              <span className="value">{impactPreview.craterDiameter.toFixed(1)} km</span>
            </div>
            <div className="stat">
              <span className="label">Damage Radius:</span>
              <span className="value">{impactPreview.damageRadius.toFixed(1)} km</span>
            </div>
            <div className="stat">
              <span className="label">Time to Impact:</span>
              <span className="value">{impactPreview.timeToImpact}</span>
            </div>
            <div className="stat">
              <span className="label">Severity:</span>
              <span className="value" style={{ color: impactPreview.severity.color }}>
                {impactPreview.severity.level}
              </span>
            </div>
          </div>
        </ImpactPreview>
      )}

      <PrimaryButton 
        onClick={handleStartMovement} 
        disabled={!selectedAsteroid || !targetPosition}
        style={{ 
          background: impactPreview?.severity.color || '#0066cc',
          borderColor: impactPreview?.severity.color || '#0088ff'
        }}
      >
        <span className="icon">🚀</span>
        Launch Impact Simulation
      </PrimaryButton>

      <SecondaryButton onClick={() => setShowControls(false)}>Cancel Mission</SecondaryButton>
    </ControlsContainer>
  )
}
