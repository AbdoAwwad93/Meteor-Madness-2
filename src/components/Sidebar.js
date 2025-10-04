"use client"

import { useMemo, useState } from "react"
import styled from "styled-components"
import { useData } from "../context/DataContext"

const SidebarContainer = styled.div`
  position: fixed;
  top: var(--navbar-height);
  left: 0;
  width: var(--sidebar-width);
  height: calc(100vh - var(--navbar-height));
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(15px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 100;
  box-shadow: var(--shadow-lg);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  transform: translateX(${props => props.$isOpen ? '0' : '-100%'});
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  @media (max-width: 768px) {
    width: var(--sidebar-width-mobile);
  }

  @media (max-width: 480px) {
    width: 100vw;
  }
`


const Header = styled.div`
  padding: var(--spacing-lg);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.3);
  
  h1 {
    font-size: var(--font-lg);
    font-weight: 700;
    margin-bottom: var(--spacing-xs);
    letter-spacing: -0.02em;
    color: white;

    @media (max-width: 768px) {
      font-size: var(--font-base);
    }
  }
  
  p {
    font-size: var(--font-xs);
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.4;

    @media (max-width: 768px) {
      font-size: var(--font-xs);
    }
  }

  @media (max-width: 768px) {
    padding: var(--spacing-md);
  }

  @media (max-width: 480px) {
    padding: var(--spacing-sm);
  }
`

const Section = styled.div`
  padding: var(--spacing-lg);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  h3 {
    font-size: var(--font-xs);
    font-weight: 600;
    margin-bottom: var(--spacing-md);
    color: #0066cc;
    text-transform: uppercase;
    letter-spacing: 1px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  @media (max-width: 768px) {
    padding: var(--spacing-md);
  }

  @media (max-width: 480px) {
    padding: var(--spacing-sm);
  }
`

const SearchBar = styled.input`
  width: 100%;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius);
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(0, 0, 0, 0.3);
  color: white;
  font-size: var(--font-sm);
  outline: none;
  transition: all 0.2s ease;
  font-family: inherit;

  &::placeholder { 
    color: rgba(255, 255, 255, 0.5); 
  }

  &:focus {
    border-color: #0066cc;
    box-shadow: 0 0 0 2px rgba(0, 102, 204, 0.2);
    background: rgba(0, 0, 0, 0.5);
  }

  @media (max-width: 768px) {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-xs);
  }
`

const RefreshButton = styled.button`
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.8);
  padding: var(--spacing-xs) var(--spacing-md);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: var(--font-xs);
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-family: inherit;
  
  &:hover {
    background: rgba(0, 102, 204, 0.2);
    border-color: #0066cc;
    color: #0066cc;
  }

  @media (max-width: 768px) {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-xs);
  }
`

const SatelliteItem = styled.div`
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(0, 102, 204, 0.1);
    border-color: #0066cc;
    transform: translateY(-1px);
    box-shadow: var(--shadow);
  }
  
  .sat-name {
    font-weight: 600;
    font-size: var(--font-sm);
    margin-bottom: var(--spacing-xs);
    color: white;

    @media (max-width: 768px) {
      font-size: var(--font-xs);
    }
  }
  
  .sat-type {
    font-size: var(--font-xs);
    color: #0066cc;
    margin-bottom: var(--spacing-xs);
    font-weight: 500;

    @media (max-width: 768px) {
      font-size: var(--font-xs);
    }
  }
  
  .sat-status {
    font-size: var(--font-xs);
    color: rgba(255, 255, 255, 0.6);
    display: flex;
    align-items: center;

    @media (max-width: 768px) {
      font-size: var(--font-xs);
    }
  }

  @media (max-width: 768px) {
    padding: var(--spacing-sm);
    margin-bottom: var(--spacing-xs);
  }
`

const StatusIndicator = styled.span`
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${(props) => (props.$status === "Active" ? "#00aa44" : "#ff4757")};
  margin-right: 8px;
  box-shadow: 0 0 6px ${(props) => (props.$status === "Active" ? "#00aa44" : "#ff4757")};
`

const LoadingState = styled.div`
  text-align: center;
  padding: var(--spacing-xl) var(--spacing-lg);
  color: rgba(255, 255, 255, 0.6);
  
  .spinner {
    width: 24px;
    height: 24px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-top: 2px solid #0066cc;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto var(--spacing-md);
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @media (max-width: 768px) {
    padding: var(--spacing-lg) var(--spacing-md);
    
    .spinner {
      width: 20px;
      height: 20px;
    }
  }

  @media (max-width: 480px) {
    padding: var(--spacing-md) var(--spacing-sm);
    
    .spinner {
      width: 18px;
      height: 18px;
    }
  }
`

const ErrorState = styled.div`
  text-align: center;
  padding: var(--spacing-xl) var(--spacing-lg);
  
  .error-icon {
    font-size: var(--font-2xl);
    margin-bottom: var(--spacing-md);
    color: #ff4757;

    @media (max-width: 768px) {
      font-size: var(--font-xl);
    }
  }
  
  .error-title {
    font-weight: 600;
    color: #ff4757;
    margin-bottom: var(--spacing-sm);
    font-size: var(--font-base);

    @media (max-width: 768px) {
      font-size: var(--font-sm);
    }
  }
  
  .error-message {
    font-size: var(--font-xs);
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: var(--spacing-md);
    line-height: 1.4;
  }

  @media (max-width: 768px) {
    padding: var(--spacing-lg) var(--spacing-md);
  }

  @media (max-width: 480px) {
    padding: var(--spacing-md) var(--spacing-sm);
  }
`

const RetryButton = styled.button`
  background: transparent;
  border: 1px solid rgba(255, 71, 87, 0.3);
  color: #ff4757;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: var(--font-xs);
  font-weight: 500;
  transition: all 0.2s ease;
  font-family: inherit;

  &:hover {
    background: rgba(255, 71, 87, 0.1);
    border-color: #ff4757;
  }

  @media (max-width: 768px) {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-xs);
  }
`

/* const dataLayers = [
  {
    id: "temperature",
    name: "Surface Temperature",
    description: "Global temperature anomalies",
  },
  {
    id: "co2",
    name: "Atmospheric CO₂",
    description: "Carbon dioxide concentrations",
  },
  {
    id: "seaLevel",
    name: "Sea Level",
    description: "Global mean sea level changes",
  },
  {
    id: "iceSheet",
    name: "Ice Sheet Mass",
    description: "Greenland and Antarctic ice mass",
  },
  {
    id: "methane",
    name: "Methane Levels",
    description: "Atmospheric methane concentrations",
  },
] */

export default function Sidebar({ onSatelliteSelect, isOpen }) {
  const [query, setQuery] = useState("")
  const { satellites, loading, error } = useData()

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return satellites
    return satellites.filter(
      (a) => (a.name || "").toLowerCase().includes(q) || (a.type || "").toLowerCase().includes(q),
    )
  }, [satellites, query])

  return (
    <SidebarContainer $isOpen={isOpen}>
        <Header>
          <h1>Mission Control</h1>
          <p>Near-Earth Object Tracking System</p>
        </Header>

      <Section>
        <SearchBar
            placeholder="Search asteroids by name or type..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search asteroids"
        />
      </Section>

            <Section>
          <h3>
            <span>Tracked Objects ({filtered.length})</span>
            <RefreshButton onClick={() => window.location.reload()}>
              <span>🔄</span>
              Refresh
            </RefreshButton>
          </h3>

              {loading ? (
            <LoadingState>
              <div className="spinner"></div>
              <div>Loading asteroid data...</div>
            </LoadingState>
              ) : error ? (
            <ErrorState>
              <div className="error-icon">⚠️</div>
              <div className="error-title">Connection Error</div>
              <div className="error-message">{error}</div>
              <RetryButton onClick={() => window.location.reload()}>Retry Connection</RetryButton>
            </ErrorState>
          ) : (
            filtered.map((asteroid) => (
              <SatelliteItem key={asteroid.id} onClick={() => onSatelliteSelect(asteroid)}>
              <div className="sat-name">{asteroid.name}</div>
              <div className="sat-type">{asteroid.type}</div>
              <div className="sat-status">
                <StatusIndicator $status={asteroid.status} />
                {asteroid.status} • Ø {asteroid.diameter?.toFixed(2)}km
              </div>
            </SatelliteItem>
          ))
        )}
      </Section>
    </SidebarContainer>
  )
}
