"use client"

import { useState } from "react"
import styled from "styled-components"
import { useData } from "../context/DataContext"

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

export default function AsteroidMovementControls({ onStartMovement, onStopMovement, isMoving, isOpen }) {
  const { satellites } = useData()
  const [showControls, setShowControls] = useState(false)
  const [selectedAsteroid, setSelectedAsteroid] = useState("")
  const [velocity, setVelocity] = useState("")

  const handleStartMovement = () => {
    if (!selectedAsteroid) return

    const asteroid = satellites.find((a) => a.id === selectedAsteroid)
    if (!asteroid) return

    const finalVelocity = velocity ? Number.parseFloat(velocity) : asteroid.velocity || 0.5

    onStartMovement(asteroid, finalVelocity)
    setShowControls(false)
  }

  const handleStopMovement = () => {
    onStopMovement()
    setShowControls(false)
    setSelectedAsteroid("")
    setVelocity("")
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

  return (
    <ControlsContainer $isOpen={isOpen}>
      <FormGroup>
        <label>Select Asteroid</label>
        <select value={selectedAsteroid} onChange={(e) => setSelectedAsteroid(e.target.value)}>
          <option value="">Select Asteroid...</option>
          {satellites.map((asteroid) => (
            <option key={asteroid.id} value={asteroid.id}>
              {asteroid.name} (Ø {asteroid.diameter?.toFixed(2)}km)
            </option>
          ))}
        </select>
      </FormGroup>

      <FormGroup>
        <label>Velocity Override</label>
        <input
          type="number"
          step="0.1"
          min="0.1"
          max="5"
          value={velocity}
          onChange={(e) => setVelocity(e.target.value)}
          placeholder={
            selectedAsteroid
              ? `Default: ${satellites.find((a) => a.id === selectedAsteroid)?.velocity || 0.5}`
              : "Use default velocity"
          }
        />
      </FormGroup>

      <SecondaryButton onClick={handleStartMovement} disabled={!selectedAsteroid}>
        <span className="icon"></span>
        Start
      </SecondaryButton>

      <SecondaryButton onClick={() => setShowControls(false)}>Cancel Mission</SecondaryButton>
    </ControlsContainer>
  )
}
