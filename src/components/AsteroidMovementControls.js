"use client"

import { useState, useEffect } from "react"
import styled from "styled-components"
import { useData } from "../context/DataContext"
import { cityService } from "../services/cityService"

const ControlsContainer = styled.div`
  position: fixed;
  top: calc(var(--navbar-height) + var(--spacing-lg));
  right: var(--spacing-sm);
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  color: white;
  z-index: 1000;
  min-width: var(--controls-width);
  max-width: 320px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  transform: translateX(${props => props.$isOpen ? '0' : '100%'});
  opacity: ${props => props.$isOpen ? '1' : '0'};
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: ${props => props.$isOpen ? 'auto' : 'none'};
  
  @media (max-width: 768px) {
    right: var(--spacing-xs);
    top: calc(var(--navbar-height) + var(--spacing-md));
    min-width: var(--controls-width-mobile);
    max-width: calc(100vw - var(--spacing-md));
    padding: var(--spacing-sm);
    max-height: calc(100vh - 100px);
  }

  @media (max-width: 480px) {
    right: var(--spacing-xs);
    left: var(--spacing-xs);
    min-width: auto;
    max-width: none;
    top: auto;
    bottom: var(--spacing-lg);
    max-height: 60vh;
  }
`

const PrimaryButton = styled.button`
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  background: #0066cc;
  border: 1px solid #0088ff;
  border-radius: var(--radius);
  color: white;
  font-size: var(--font-xs);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-bottom: var(--spacing-sm);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  font-family: inherit;

  &:hover {
    background: #0088ff;
    border-color: #00aaff;
    transform: translateY(-1px);
    box-shadow: var(--shadow);
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
    font-size: var(--font-sm);
  }

  @media (max-width: 768px) {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-xs);
    margin-bottom: var(--spacing-xs);
  }

  @media (max-width: 480px) {
    padding: var(--spacing-xs);
    font-size: var(--font-xs);
  }
`

const FormGroup = styled.div`
  margin-bottom: var(--spacing-md);
  
  label {
    display: block;
    margin-bottom: var(--spacing-xs);
    font-size: var(--font-xs);
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  select, input {
    width: 100%;
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--radius-sm);
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(0, 0, 0, 0.3);
    color: white;
    font-size: var(--font-xs);
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
    padding: var(--spacing-xs);
  }

  @media (max-width: 768px) {
    margin-bottom: var(--spacing-sm);
    
    label {
      font-size: var(--font-xs);
    }
    
    select, input {
      padding: var(--spacing-xs) var(--spacing-sm);
      font-size: var(--font-xs);
    }
  }

  @media (max-width: 480px) {
    margin-bottom: var(--spacing-xs);
  }
`


const SecondaryButton = styled.button`
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius);
  color: rgba(255, 255, 255, 0.8);
  font-size: var(--font-xs);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  font-family: inherit;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: #0066cc;
    color: #0066cc;
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-xs);
  }
`

const DangerButton = styled.button`
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  background: transparent;
  border: 1px solid rgba(255, 71, 87, 0.3);
  border-radius: var(--radius);
  color: #ff4757;
  font-size: var(--font-xs);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  font-family: inherit;

  &:hover {
    background: rgba(255, 71, 87, 0.1);
    border-color: #ff4757;
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-xs);
  }
`




const Header = styled.div`
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  .title {
    font-weight: 600;
    color: #0066cc;
    font-size: var(--font-xs);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .subtitle {
    font-size: var(--font-xs);
    color: rgba(255, 255, 255, 0.6);
    margin-top: var(--spacing-xs);
  }

  @media (max-width: 768px) {
    margin-bottom: var(--spacing-sm);
    
    .title {
      font-size: var(--font-xs);
    }
    
    .subtitle {
      font-size: var(--font-xs);
    }
  }
`

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: var(--spacing-md);

  @media (max-width: 768px) {
    margin-bottom: var(--spacing-sm);
  }
`

const SearchInput = styled.input`
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.3);
  color: white;
  font-size: var(--font-sm);
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

  @media (max-width: 768px) {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-xs);
  }
`

const SearchResults = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-sm);
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  margin-top: var(--spacing-xs);
`

const SearchResultItem = styled.div`
  padding: var(--spacing-sm) var(--spacing-md);
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
    font-size: var(--font-sm);
  }
  
  .city-country {
    color: rgba(255, 255, 255, 0.6);
    font-size: var(--font-xs);
    margin-top: var(--spacing-xs);
  }

  @media (max-width: 768px) {
    padding: var(--spacing-xs) var(--spacing-sm);
    
    .city-name {
      font-size: var(--font-xs);
    }
    
    .city-country {
      font-size: var(--font-xs);
    }
  }
`

const SelectedCityInfo = styled.div`
  margin-bottom: var(--spacing-sm);
  padding: var(--spacing-xs);
  background: rgba(0, 102, 204, 0.1);
  border: 1px solid rgba(0, 102, 204, 0.3);
  border-radius: var(--radius-sm);
  font-size: var(--font-xs);
  
  .city-name {
    font-weight: 600;
    color: #0066cc;
    margin-bottom: var(--spacing-xs);
  }
  
  .city-details {
    color: rgba(255, 255, 255, 0.7);
    display: flex;
    justify-content: space-between;
  }

  @media (max-width: 768px) {
    margin-bottom: var(--spacing-xs);
    padding: var(--spacing-xs);
    font-size: var(--font-xs);
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

  // Load cities data from API
  useEffect(() => {
    const loadCities = async () => {
      try {
        const cities = await cityService.getMajorCities()
        setCitiesData(cities)
      } catch (error) {
        console.error('Failed to load cities data:', error)
        // Fallback to empty array if API fails
        setCitiesData([])
      }
    }
    loadCities()
  }, [])

  // Handle city search
  const handleSearchChange = (e) => {
    const query = e.target.value
    setSearchQuery(query)
    
    if (query.length > 2) {
      // Use API search for better results
      cityService.searchCities(query).then(results => {
        setSearchResults(results) // Show ALL results, no limits
        setShowSearchResults(true)
      }).catch(error => {
        console.error('Search failed:', error)
        // Fallback to local search
        const localResults = citiesData.filter(city => 
          city.name.toLowerCase().includes(query.toLowerCase())
        )
        setSearchResults(localResults)
        setShowSearchResults(true)
      })
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
        lat: city.coordinates.lat,
        lng: city.coordinates.lng,
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
        lat: selectedCity.coordinates.lat,
        lng: selectedCity.coordinates.lng,
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
            <span>Lat: {selectedCity.coordinates?.lat?.toFixed(2)}°</span>
            <span>Lng: {selectedCity.coordinates?.lng?.toFixed(2)}°</span>
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
