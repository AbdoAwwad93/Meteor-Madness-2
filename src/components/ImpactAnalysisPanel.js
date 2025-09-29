"use client"

import { useState, useEffect } from "react"
import styled from "styled-components"
import { calculateImpact, formatImpactAnalysis } from "../services/impactService"

const PanelContainer = styled.div`
  position: fixed;
  top: 80px;
  left: 20px;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  color: white;
  z-index: 1000;
  min-width: 350px;
  max-width: 450px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  transform: translateX(${props => props.$isVisible ? '0' : '-100%'});
  opacity: ${props => props.$isVisible ? '1' : '0'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: ${props => props.$isVisible ? 'auto' : 'none'};
  
  @media (max-width: 768px) {
    left: 10px;
    min-width: 300px;
    max-width: calc(100vw - 20px);
    padding: 15px;
  }
`

const Header = styled.div`
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid ${props => props.$severityColor || 'rgba(255, 255, 255, 0.1)'};
  
  .title {
    font-weight: 700;
    color: ${props => props.$severityColor || '#ffffff'};
    font-size: 18px;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin-bottom: 5px;
  }
  
  .subtitle {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.7);
    font-weight: 400;
  }
`

const SeverityBadge = styled.div`
  display: inline-block;
  padding: 6px 12px;
  background: ${props => props.$color || '#333'};
  color: white;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 15px;
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
`

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  text-align: center;
  
  .label {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 5px;
  }
  
  .value {
    font-size: 16px;
    font-weight: 600;
    color: ${props => props.$valueColor || '#ffffff'};
  }
`

const Section = styled.div`
  margin-bottom: 20px;
  
  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: #00e5ff;
    margin-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
`

const ImpactZone = styled.div`
  background: rgba(255, 0, 0, 0.1);
  border: 1px solid rgba(255, 0, 0, 0.3);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 15px;
  
  .zone-title {
    color: #ff4757;
    font-weight: 600;
    font-size: 13px;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .zone-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 8px;
    font-size: 12px;
    
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

const VolcanicInfo = styled.div`
  background: ${props => props.$isAffected ? 'rgba(255, 140, 0, 0.1)' : 'rgba(0, 255, 136, 0.1)'};
  border: 1px solid ${props => props.$isAffected ? 'rgba(255, 140, 0, 0.3)' : 'rgba(0, 255, 136, 0.3)'};
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 15px;
  
  .volcanic-title {
    color: ${props => props.$isAffected ? '#ff8c00' : '#00ff88'};
    font-weight: 600;
    font-size: 13px;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .volcanic-details {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
  }
`

const LocationInfo = styled.div`
  background: rgba(0, 102, 204, 0.1);
  border: 1px solid rgba(0, 102, 204, 0.3);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 15px;
  
  .location-title {
    color: #0066cc;
    font-weight: 600;
    font-size: 13px;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .location-details {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.8);
  }
`

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 20px;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    color: white;
    background: rgba(255, 255, 255, 0.1);
  }
`

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  
  .spinner {
    width: 30px;
    height: 30px;
    border: 3px solid rgba(255, 255, 255, 0.1);
    border-top: 3px solid #00e5ff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`

const ErrorMessage = styled.div`
  background: rgba(255, 71, 87, 0.1);
  border: 1px solid rgba(255, 71, 87, 0.3);
  border-radius: 8px;
  padding: 12px;
  color: #ff4757;
  font-size: 12px;
  text-align: center;
`

export default function ImpactAnalysisPanel({ 
  isVisible, 
  onClose, 
  asteroid, 
  targetPosition,
  onImpactDataChange
}) {
  const [impactAnalysis, setImpactAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isVisible && asteroid && targetPosition) {
      calculateImpactAnalysis()
    }
  }, [isVisible, asteroid, targetPosition])

  const calculateImpactAnalysis = async () => {
    if (!asteroid || !targetPosition) return

    setLoading(true)
    setError(null)

    try {
      const impactData = {
        diameter_m: (asteroid.diameter || 0.5) * 1000, // Convert km to m
        velocity_kms: (asteroid.velocity || 25000) / 1000, // Convert m/s to km/s
        lat: targetPosition.lat,
        lon: targetPosition.lng,
        delta_km: 1000 // Default search radius
      }

      const result = await calculateImpact(impactData)
      const formattedAnalysis = formatImpactAnalysis(result)
      setImpactAnalysis(formattedAnalysis)
      
      // Pass impact data to parent for visualization
      if (onImpactDataChange) {
        onImpactDataChange(formattedAnalysis)
      }
    } catch (err) {
      console.error('Failed to calculate impact:', err)
      setError('Failed to calculate impact analysis. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isVisible) return null

  return (
    <PanelContainer $isVisible={isVisible}>
      <CloseButton onClick={onClose}>×</CloseButton>
      
      <Header $severityColor={impactAnalysis?.severity?.color}>
        <div className="title">Impact Analysis</div>
        <div className="subtitle">
          {asteroid?.name} → {targetPosition?.name || 'Target Location'}
        </div>
      </Header>

      {loading && (
        <LoadingSpinner>
          <div className="spinner"></div>
        </LoadingSpinner>
      )}

      {error && (
        <ErrorMessage>{error}</ErrorMessage>
      )}

      {impactAnalysis && !loading && (
        <>
          <SeverityBadge $color={impactAnalysis.severity.color}>
            {impactAnalysis.severity.level} Impact
          </SeverityBadge>

          <StatsGrid>
            <StatCard $valueColor="#00e5ff">
              <div className="label">Energy Release</div>
              <div className="value">{impactAnalysis.energy.display}</div>
            </StatCard>
            <StatCard $valueColor="#ff4757">
              <div className="label">Crater Diameter</div>
              <div className="value">{impactAnalysis.summary.craterSize}</div>
            </StatCard>
            <StatCard $valueColor="#ff8800">
              <div className="label">Blast Radius</div>
              <div className="value">{impactAnalysis.summary.blastZone}</div>
            </StatCard>
            <StatCard $valueColor="#ffaa00">
              <div className="label">Earthquake</div>
              <div className="value">M{impactAnalysis.earthquake.magnitude.toFixed(1)}</div>
            </StatCard>
          </StatsGrid>

          <Section>
            <div className="section-title">Impact Zones</div>
            <ImpactZone>
              <div className="zone-title">Primary Impact Zone</div>
              <div className="zone-stats">
                <div className="stat">
                  <span className="label">Crater Diameter:</span>
                  <span className="value">{impactAnalysis.crater.diameterKm.toFixed(1)} km</span>
                </div>
                <div className="stat">
                  <span className="label">Blast Radius:</span>
                  <span className="value">{impactAnalysis.blast.radiusKm.toFixed(0)} km</span>
                </div>
                <div className="stat">
                  <span className="label">Earthquake Mag:</span>
                  <span className="value">{impactAnalysis.earthquake.magnitude.toFixed(1)}</span>
                </div>
                <div className="stat">
                  <span className="label">Energy:</span>
                  <span className="value">{impactAnalysis.energy.display}</span>
                </div>
              </div>
            </ImpactZone>
          </Section>

          <Section>
            <div className="section-title">Volcanic Activity</div>
            <VolcanicInfo $isAffected={impactAnalysis.volcanic.isAffected}>
              <div className="volcanic-title">
                {impactAnalysis.volcanic.isAffected ? 'Volcanic Trigger' : 'No Volcanic Activity'}
              </div>
              <div className="volcanic-details">
                {impactAnalysis.volcanic.isAffected 
                  ? `Volcanic activity triggered at ${impactAnalysis.volcanic.volcanoName}`
                  : 'Impact will not trigger volcanic activity'
                }
              </div>
            </VolcanicInfo>
          </Section>

          <Section>
            <div className="section-title">Impact Location</div>
            <LocationInfo>
              <div className="location-title">Target Details</div>
              <div className="location-details">
                <div>Location: {targetPosition.name}, {targetPosition.country}</div>
                <div>Coordinates: {targetPosition.lat.toFixed(4)}°, {targetPosition.lng.toFixed(4)}°</div>
                <div>Surface: {impactAnalysis.location.isWater ? 'Water' : 'Land'}</div>
                {impactAnalysis.location.elevation && (
                  <div>Elevation: {impactAnalysis.location.elevation} m</div>
                )}
              </div>
            </LocationInfo>
          </Section>
        </>
      )}
    </PanelContainer>
  )
}
