"use client"

import { useState, useEffect } from "react"
import styled from "styled-components"
import { useData } from "../context/DataContext"

const ControlsContainer = styled.div`
  position: fixed;
  top: 80px;
  right: 10px;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  color: white;
  z-index: 1000;
  min-width: 260px;
  max-width: 320px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  transform: translateX(${props => props.$isOpen ? '0' : '100%'});
  opacity: ${props => props.$isOpen ? '1' : '0'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: ${props => props.$isOpen ? 'auto' : 'none'};
  
  @media (max-width: 768px) {
    right: 5px;
    top: 70px;
    min-width: 240px;
    max-width: calc(100vw - 20px);
    padding: 10px;
  }
`

const PrimaryButton = styled.button`
  width: 100%;
  padding: 10px 12px;
  background: #0066cc;
  border: 1px solid #0088ff;
  border-radius: 6px;
  color: white;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
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
    font-size: 0.9rem;
  }
`

const FormGroup = styled.div`
  margin-bottom: 12px;
  
  label {
    display: block;
    margin-bottom: 4px;
    font-size: 11px;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  select, input {
    width: 100%;
    padding: 8px 10px;
    border-radius: 4px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(0, 0, 0, 0.3);
    color: white;
    font-size: 13px;
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
    padding: 6px;
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




const Header = styled.div`
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  .title {
    font-weight: 600;
    color: #0066cc;
    font-size: 13px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .subtitle {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.6);
    margin-top: 3px;
  }
`

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 12px;
`

const SearchInput = styled.input`
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
`

const SearchResults = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  margin-top: 2px;
`

const SearchResultItem = styled.div`
  padding: 10px 12px;
  cursor: pointer;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: background-color 0.2s ease;
  
  &:hover {
    background: rgba(0, 102, 204, 0.2);
  }
  
  &:last-child {
    border-bottom: none;
  }
  
  .city-name {
    color: white;
    font-weight: 500;
    font-size: 14px;
  }
  
  .city-country {
    color: rgba(255, 255, 255, 0.6);
    font-size: 12px;
    margin-top: 2px;
  }
`

const SelectedCityInfo = styled.div`
  margin-bottom: 10px;
  padding: 6px;
  background: rgba(0, 102, 204, 0.1);
  border: 1px solid rgba(0, 102, 204, 0.3);
  border-radius: 4px;
  font-size: 10px;
  
  .city-name {
    font-weight: 600;
    color: #0066cc;
    margin-bottom: 2px;
  }
  
  .city-details {
    color: rgba(255, 255, 255, 0.7);
    display: flex;
    justify-content: space-between;
  }
`

export default function AsteroidMovementControls({ onStartMovement, onStopMovement, isMoving, isOpen, targetPosition, onTargetPositionChange, onSelectionModeChange }) {
  const { satellites } = useData()
  const [showControls, setShowControls] = useState(false)
  const [selectedAsteroid, setSelectedAsteroid] = useState("")
  const [velocity, setVelocity] = useState("")
  const [citiesData, setCitiesData] = useState([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState([])
  const [selectedCity, setSelectedCity] = useState(null)
  const [showSearchResults, setShowSearchResults] = useState(false)

  // Load cities data
  useEffect(() => {
    const loadCities = async () => {
      try {
        const response = await fetch('/data/cities.json')
        const data = await response.json()
        setCitiesData(data)
      } catch (error) {
        console.error('Failed to load cities data:', error)
      }
    }
    loadCities()
  }, [])

  // Handle city search
  const handleSearchChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    
    if (query.length > 2) {
      const results = citiesData.filter(city => 
        city.name.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 5) // Limit to 5 results
      setSearchResults(results)
      setShowSearchResults(true)
    } else {
      setSearchResults([])
      setShowSearchResults(false)
    }
  }

  // Handle city selection
  const handleCitySelect = (city) => {
    setSelectedCity(city)
    setSearchQuery(city.name)
    setShowSearchResults(false)
    
    // Update target position for compatibility
    if (onTargetPositionChange) {
      onTargetPositionChange({
        lat: city.lat,
        lng: city.lng,
        name: city.name,
        country: city.country
      })
    }
  }

  const handleStartMovement = () => {
    if (!selectedAsteroid || !selectedCity) return

    const asteroid = satellites.find((a) => a.id === selectedAsteroid)
    if (!asteroid) return

    const finalVelocity = velocity ? Number.parseFloat(velocity) : asteroid.velocity || 0.5

    // Add target city information
    const asteroidWithTarget = {
      ...asteroid,
      targetCity: selectedCity,
      targetPosition: {
        lat: selectedCity.lat,
        lng: selectedCity.lng,
        name: selectedCity.name,
        country: selectedCity.country
      }
    }

    onStartMovement(asteroidWithTarget, finalVelocity)
    setShowControls(false)
    if (onSelectionModeChange) onSelectionModeChange(false)
  }

  const handleStopMovement = () => {
    onStopMovement()
    setShowControls(false)
    setSelectedAsteroid("")
    setVelocity("")
    setSelectedCity(null)
    setSearchQuery("")
    setSearchResults([])
    setShowSearchResults(false)
    if (onSelectionModeChange) onSelectionModeChange(false)
  }

  const handleAsteroidSelect = (asteroidId) => {
    setSelectedAsteroid(asteroidId)
    setSelectedCity(null)
    setSearchQuery("")
    setSearchResults([])
    setShowSearchResults(false)
    if (asteroidId) {
      if (onSelectionModeChange) onSelectionModeChange(true)
    } else {
      if (onSelectionModeChange) onSelectionModeChange(false)
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

  return (
    <ControlsContainer $isOpen={isOpen}>
      <Header>
        <div className="title">Asteroid Impact Simulation</div>
        <div className="subtitle">Select asteroid and search for target city</div>
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

      {selectedAsteroid && (
        <SearchContainer>
          <label style={{ 
            display: 'block', 
            marginBottom: '6px', 
            fontSize: '12px', 
            fontWeight: '500', 
            color: 'rgba(255, 255, 255, 0.8)', 
            textTransform: 'uppercase', 
            letterSpacing: '0.5px' 
          }}>
            Search Target City
          </label>
          <SearchInput
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Type city name..."
          />
          {showSearchResults && searchResults.length > 0 && (
            <SearchResults>
              {searchResults.map((city) => (
                <SearchResultItem
                  key={city.id}
                  onClick={() => handleCitySelect(city)}
                >
                  <div className="city-name">{city.name}</div>
                  <div className="city-country">{city.country}</div>
                </SearchResultItem>
              ))}
            </SearchResults>
          )}
        </SearchContainer>
      )}

      {selectedCity && (
        <SelectedCityInfo>
          <div className="city-name">Target Selected: {selectedCity.name}</div>
          <div className="city-details">
            <span>Lat: {selectedCity.lat?.toFixed(2)}°</span>
            <span>Lng: {selectedCity.lng?.toFixed(2)}°</span>
          </div>
        </SelectedCityInfo>
      )}

      {!selectedCity && selectedAsteroid && (
        <div style={{ 
          padding: '8px', 
          background: 'rgba(255, 193, 7, 0.1)', 
          border: '1px solid rgba(255, 193, 7, 0.3)', 
          borderRadius: '4px',
          fontSize: '11px',
          color: '#ffc107',
          textAlign: 'center',
          marginBottom: '10px'
        }}>
          Search for a city to target
        </div>
      )}

      {!selectedAsteroid && (
        <div style={{ 
          padding: '8px', 
          background: 'rgba(100, 100, 100, 0.1)', 
          border: '1px solid rgba(100, 100, 100, 0.3)', 
          borderRadius: '4px',
          fontSize: '11px',
          color: '#666666',
          textAlign: 'center',
          marginBottom: '10px'
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

      <PrimaryButton 
        onClick={handleStartMovement} 
        disabled={!selectedAsteroid || !selectedCity}
      >
        <span className="icon">🚀</span>
        Launch Impact Simulation
      </PrimaryButton>

      <SecondaryButton onClick={() => setShowControls(false)}>Cancel Mission</SecondaryButton>
    </ControlsContainer>
  )
}
