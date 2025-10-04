"use client"

import { useState } from "react"
import styled from "styled-components"
import { Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { enhanceAsteroidData } from "../utils/asteroidCalculations"

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const PanelContainer = styled.div`
  position: absolute;
  top: 50%;
  right: var(--spacing-lg);
  transform: translateY(-50%);
  width: var(--panel-width);
  max-height: calc(100vh - 100px);
  background: rgba(15, 15, 15, 0.75);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  color: var(--text);
  overflow: hidden;
  z-index: 200;
  box-shadow: var(--shadow-lg);

  @media (max-width: 768px) {
    right: var(--spacing-md);
    width: var(--panel-width-mobile);
    max-height: calc(100vh - 80px);
  }

  @media (max-width: 480px) {
    right: var(--spacing-sm);
    left: var(--spacing-sm);
    width: auto;
    max-height: calc(100vh - 60px);
    top: auto;
    bottom: var(--spacing-lg);
    transform: none;
  }
`

const Header = styled.div`
  padding: var(--spacing-lg) var(--spacing-xl);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(25, 25, 25, 0.7);
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  .title-section {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
  }
  
  .asteroid-icon {
    width: 24px;
    height: 24px;
    background: rgba(255, 255, 255, 0.9);
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-xs);
    color: #000;
    font-weight: bold;

    @media (max-width: 768px) {
      width: 20px;
      height: 20px;
      font-size: var(--font-xs);
    }
  }
  
  h2 {
    margin: 0;
    color: white;
    font-size: var(--font-lg);
    font-weight: 600;
    letter-spacing: -0.01em;

    @media (max-width: 768px) {
      font-size: var(--font-base);
    }

    @media (max-width: 480px) {
      font-size: var(--font-sm);
    }
  }
  
  .back-arrow {
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    color: rgba(255, 255, 255, 0.7);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--font-base);
    border-radius: 50%;
    transition: all 0.2s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }

    @media (max-width: 768px) {
      width: 28px;
      height: 28px;
      font-size: var(--font-sm);
    }
  }

  @media (max-width: 768px) {
    padding: var(--spacing-md) var(--spacing-lg);
  }

  @media (max-width: 480px) {
    padding: var(--spacing-sm) var(--spacing-md);
  }
`


const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(25, 25, 25, 0.7);
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`

const Tab = styled.button`
  flex: 1;
  padding: var(--spacing-md) var(--spacing-lg);
  border: none;
  background: transparent;
  color: ${(props) => (props.$active ? "white" : "rgba(255, 255, 255, 0.6)")};
  cursor: pointer;
  font-size: var(--font-sm);
  font-weight: 500;
  transition: all 0.2s ease;
  border-bottom: 2px solid ${(props) => (props.$active ? "white" : "transparent")};
  position: relative;
  white-space: nowrap;
  min-width: max-content;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: ${(props) => (props.$active ? "white" : "rgba(255, 255, 255, 0.8)")};
  }

  @media (max-width: 768px) {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--font-xs);
    flex: 1 1 50%;
  }

  @media (max-width: 480px) {
    padding: var(--spacing-xs) var(--spacing-sm);
    font-size: var(--font-xs);
    flex: 1 1 100%;
  }
`

const Content = styled.div`
  padding: var(--spacing-xl);
  max-height: 400px;
  overflow-y: auto;

  @media (max-width: 768px) {
    padding: var(--spacing-lg);
    max-height: 300px;
  }

  @media (max-width: 480px) {
    padding: var(--spacing-md);
    max-height: 250px;
  }
`

const DataRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md) 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
  
  .label {
    color: rgba(255, 255, 255, 0.7);
    font-size: var(--font-sm);
    font-weight: 500;

    @media (max-width: 768px) {
      font-size: var(--font-xs);
    }
  }
  
  .value {
    color: white;
    font-weight: 600;
    font-size: var(--font-sm);
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
    text-align: right;

    @media (max-width: 768px) {
      font-size: var(--font-xs);
    }
  }

  @media (max-width: 768px) {
    margin-bottom: var(--spacing-sm);
    padding: var(--spacing-sm) 0;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-xs);

    .value {
      text-align: left;
    }
  }
`

const ChartContainer = styled.div`
  height: 180px;
  margin-top: var(--spacing-md);
  padding: var(--spacing-md);
  background: rgba(25, 25, 25, 0.7);
  border-radius: var(--radius);
  border: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 768px) {
    height: 150px;
    margin-top: var(--spacing-sm);
    padding: var(--spacing-sm);
  }

  @media (max-width: 480px) {
    height: 120px;
    margin-top: var(--spacing-xs);
    padding: var(--spacing-xs);
  }
`

const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md) var(--spacing-xl);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(25, 25, 25, 0.7);

  @media (max-width: 768px) {
    padding: var(--spacing-sm) var(--spacing-lg);
  }

  @media (max-width: 480px) {
    padding: var(--spacing-xs) var(--spacing-md);
  }
`

const PaginationDots = styled.div`
  display: flex;
  gap: var(--spacing-sm);

  @media (max-width: 768px) {
    gap: var(--spacing-xs);
  }
`

const Dot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(props) => (props.$active ? "white" : "rgba(255, 255, 255, 0.3)")};
  transition: all 0.2s ease;

  @media (max-width: 768px) {
    width: 6px;
    height: 6px;
  }
`

const NextButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  font-size: var(--font-sm);
  font-weight: 500;
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
  
  .arrow {
    font-size: var(--font-xs);
    transition: transform 0.2s ease;
  }
  
  &:hover .arrow {
    transform: translateX(2px);
  }

  @media (max-width: 768px) {
    font-size: var(--font-xs);
    padding: var(--spacing-xs) var(--spacing-sm);
    gap: var(--spacing-xs);

    .arrow {
      font-size: var(--font-xs);
    }
  }
`

const ImpactSection = styled.div`
  margin-bottom: var(--spacing-lg);
  padding: var(--spacing-md);
  background: rgba(255, 71, 87, 0.1);
  border: 1px solid rgba(255, 71, 87, 0.3);
  border-radius: var(--radius-lg);
  
  .title {
    color: #ff4757;
    font-size: var(--font-base);
    font-weight: 600;
    margin-bottom: var(--spacing-md);
    text-transform: uppercase;
    letter-spacing: 0.5px;

    @media (max-width: 768px) {
      font-size: var(--font-sm);
      margin-bottom: var(--spacing-sm);
    }
  }
  
  .impact-stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-md);
    font-size: var(--font-sm);
    
    .stat {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-xs);
      
      .label {
        color: rgba(255, 255, 255, 0.7);
        font-size: var(--font-xs);
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .value {
        color: #ff4757;
        font-weight: 600;
        font-size: var(--font-sm);

        @media (max-width: 768px) {
          font-size: var(--font-xs);
        }
      }
    }

    @media (max-width: 768px) {
      grid-template-columns: 1fr;
      gap: var(--spacing-sm);
      font-size: var(--font-xs);
    }
  }

  @media (max-width: 768px) {
    margin-bottom: var(--spacing-md);
    padding: var(--spacing-sm);
  }

  @media (max-width: 480px) {
    margin-bottom: var(--spacing-sm);
    padding: var(--spacing-xs);
  }
`

const SeverityBadge = styled.div`
  display: inline-block;
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--font-xs);
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${props => props.$color}20;
  color: ${props => props.$color};
  border: 1px solid ${props => props.$color}40;

  @media (max-width: 768px) {
    padding: var(--spacing-xs);
    font-size: var(--font-xs);
  }
`

export default function InfoPanel({ asteroid, onClose }) {
  const [activeTab, setActiveTab] = useState("essential-stats")
  const [currentPage, setCurrentPage] = useState(0)

  const handleTabChange = (tab) => {
    setActiveTab(tab)
    setCurrentPage(0) // Reset to first page when switching tabs
  }

  if (!asteroid) return null

  // Enhance asteroid data with calculated properties
  const enhancedAsteroid = enhanceAsteroidData(asteroid)

  const formatNumber = (num) => {
    if (num === undefined || num === null) return "N/A"
    return typeof num === "number" ? num.toLocaleString() : num
  }

  const formatDate = (dateString) => {
    if (!dateString || dateString === "Invalid Date") return "Unknown"
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return "Unknown"
    }
  }

  // Mock orbital data for visualization
  const generateOrbitData = () => {
    const data = []
    const labels = []

    for (let i = 0; i <= 24; i++) {
      labels.push(`${i}h`)
      // Simulate orbital distance variation
      const angle = (i / 24) * 2 * Math.PI
      const baseDistance = asteroid.orbit?.semiMajorAxis || 10
      const eccentricity = asteroid.orbit?.eccentricity || 0.1
      const distance = baseDistance * (1 + eccentricity * Math.cos(angle))
      data.push(distance)
    }

    return { labels, data }
  }

  const chartData = generateOrbitData()

  const orbitChartData = {
    labels: chartData.labels,
    datasets: [
      {
        label: "Distance from Earth (AU)",
        data: chartData.data,
        borderColor: "#4ecdc4",
        backgroundColor: "rgba(78, 205, 196, 0.1)",
        tension: 0.4,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: "white",
        },
      },
    },
    scales: {
      x: {
        ticks: { color: "rgba(255, 255, 255, 0.7)" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
      y: {
        ticks: { color: "rgba(255, 255, 255, 0.7)" },
        grid: { color: "rgba(255, 255, 255, 0.1)" },
      },
    },
  }

  return (
    <PanelContainer $status={asteroid.status}>
      <Header $status={asteroid.status}>
        <div className="title-section">
          <div className="asteroid-icon">◆</div>
          <h2>{asteroid.name || 'Unknown Asteroid'}</h2>
        </div>
        <button className="back-arrow" onClick={onClose}>←</button>
      </Header>

      <TabContainer>
        <Tab $active={activeTab === "essential-stats"} onClick={() => handleTabChange("essential-stats")}>
          Essential stats
        </Tab>
        <Tab $active={activeTab === "orbital-path"} onClick={() => handleTabChange("orbital-path")}>
          Orbital path
        </Tab>
        <Tab $active={activeTab === "close-approach"} onClick={() => handleTabChange("close-approach")}>
          Close approach
        </Tab>
        <Tab $active={activeTab === "impact-analysis"} onClick={() => handleTabChange("impact-analysis")}>
          Impact Analysis
        </Tab>
      </TabContainer>

      <Content>
        {activeTab === "essential-stats" && (
          <>
            {currentPage === 0 && (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ 
                    color: 'white', 
                    fontSize: '1rem', 
                    fontWeight: '600', 
                    marginBottom: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Discovery
                  </h3>
                  <p style={{ 
                    color: 'rgba(255, 255, 255, 0.8)', 
                    fontSize: '0.875rem', 
                    lineHeight: '1.5',
                    marginBottom: '20px'
                  }}>
                    {asteroid.type || 'Near Earth Object'} discovered on {formatDate(asteroid.discoveryDate)}. 
                    {asteroid.isPotentiallyHazardous ? ' This asteroid is classified as potentially hazardous.' : ' This asteroid poses no immediate threat to Earth.'}
                  </p>
                </div>

                <DataRow>
                  <span className="label">Diameter:</span>
                  <span className="value">{formatNumber(enhancedAsteroid.diameter?.toFixed(2))} km</span>
                </DataRow>

                <DataRow>
                  <span className="label">Velocity:</span>
                  <span className="value">{formatNumber((enhancedAsteroid.velocity / 1000)?.toFixed(1))} km/s</span>
                </DataRow>

                <DataRow>
                  <span className="label">Distance:</span>
                  <span className="value">{formatNumber((asteroid.distance / 1000000)?.toFixed(2))} million km</span>
                </DataRow>

                <DataRow>
                  <span className="label">Classification:</span>
                  <span className="value">{enhancedAsteroid.classification?.class}</span>
                </DataRow>

                <DataRow>
                  <span className="label">Composition:</span>
                  <span className="value">{enhancedAsteroid.composition}</span>
                </DataRow>
              </>
            )}

            {currentPage === 1 && (
              <>
                <DataRow>
                  <span className="label">Magnitude:</span>
                  <span className="value">{formatNumber(asteroid.magnitude?.toFixed(1))}</span>
                </DataRow>

                <DataRow>
                  <span className="label">Potentially Hazardous:</span>
                  <span className="value">{asteroid.isPotentiallyHazardous ? "Yes" : "No"}</span>
                </DataRow>

                <DataRow>
                  <span className="label">Discovery Date:</span>
                  <span className="value">{formatDate(asteroid.discoveryDate)}</span>
                </DataRow>

                <DataRow>
                  <span className="label">Status:</span>
                  <span className="value">{asteroid.status || "Unknown"}</span>
                </DataRow>
              </>
            )}
          </>
        )}

        {activeTab === "orbital-path" && (
          <>
            {currentPage === 0 && (
              <>
                <DataRow>
                  <span className="label">Semi-Major Axis:</span>
                  <span className="value">{formatNumber(asteroid.orbit?.semiMajorAxis?.toFixed(2))} AU</span>
                </DataRow>

                <DataRow>
                  <span className="label">Eccentricity:</span>
                  <span className="value">{formatNumber(asteroid.orbit?.eccentricity?.toFixed(3))}</span>
                </DataRow>

                <DataRow>
                  <span className="label">Inclination:</span>
                  <span className="value">{formatNumber(asteroid.orbit?.inclination?.toFixed(1))}°</span>
                </DataRow>

                <DataRow>
                  <span className="label">Orbital Period:</span>
                  <span className="value">{formatNumber((asteroid.orbit?.period / 365.25)?.toFixed(1))} years</span>
                </DataRow>
              </>
            )}

            {currentPage === 1 && (
              <ChartContainer>
                <Line data={orbitChartData} options={chartOptions} />
              </ChartContainer>
            )}
          </>
        )}

        {activeTab === "close-approach" && (
          <>
            {currentPage === 0 && (
              <>
                <DataRow>
                  <span className="label">Next Close Approach:</span>
                  <span className="value">{formatDate(asteroid.discoveryDate)}</span>
                </DataRow>

                <DataRow>
                  <span className="label">Minimum Distance:</span>
                  <span className="value">{formatNumber((asteroid.distance / 1000000)?.toFixed(2))} million km</span>
                </DataRow>

                <DataRow>
                  <span className="label">Relative Velocity:</span>
                  <span className="value">{formatNumber(asteroid.velocity?.toFixed(0))} km/h</span>
                </DataRow>
              </>
            )}

            {currentPage === 1 && (
              <>
                <DataRow>
                  <span className="label">Hazardous Classification:</span>
                  <span className="value">{asteroid.isPotentiallyHazardous ? "Potentially Hazardous" : "Not Hazardous"}</span>
                </DataRow>

                <DataRow>
                  <span className="label">Risk Level:</span>
                  <span className="value">{asteroid.isPotentiallyHazardous ? "High" : "Low"}</span>
                </DataRow>

                <DataRow>
                  <span className="label">Monitoring Status:</span>
                  <span className="value">{asteroid.isPotentiallyHazardous ? "Active Monitoring" : "Routine Tracking"}</span>
                </DataRow>
              </>
            )}
          </>
        )}

        {activeTab === "impact-analysis" && (
          <>
            {currentPage === 0 && (
              <>
                <ImpactSection>
                  <div className="title">Impact Assessment</div>
                  <div className="impact-stats">
                    <div className="stat">
                      <span className="label">Impact Energy</span>
                      <span className="value">{enhancedAsteroid.energyTNT?.toFixed(1)} tons TNT</span>
                    </div>
                    <div className="stat">
                      <span className="label">Crater Diameter</span>
                      <span className="value">{enhancedAsteroid.craterDiameter?.toFixed(1)} km</span>
                    </div>
                    <div className="stat">
                      <span className="label">Damage Radius</span>
                      <span className="value">{enhancedAsteroid.damageRadius?.toFixed(1)} km</span>
                    </div>
                    <div className="stat">
                      <span className="label">Severity Level</span>
                      <SeverityBadge $color={enhancedAsteroid.severity?.color}>
                        {enhancedAsteroid.severity?.level}
                      </SeverityBadge>
                    </div>
                  </div>
                </ImpactSection>

                <DataRow>
                  <span className="label">Mass:</span>
                  <span className="value">{formatNumber((enhancedAsteroid.mass / 1000)?.toFixed(1))} tons</span>
                </DataRow>

                <DataRow>
                  <span className="label">Kinetic Energy:</span>
                  <span className="value">{formatNumber((enhancedAsteroid.kineticEnergy / 1e12)?.toFixed(2))} TJ</span>
                </DataRow>

                <DataRow>
                  <span className="label">Density:</span>
                  <span className="value">{formatNumber(enhancedAsteroid.density)} kg/m³</span>
                </DataRow>

                <DataRow>
                  <span className="label">Albedo:</span>
                  <span className="value">{enhancedAsteroid.albedo?.toFixed(2)}</span>
                </DataRow>
              </>
            )}

            {currentPage === 1 && (
              <>
                <div style={{ marginBottom: '20px' }}>
                  <h3 style={{ 
                    color: 'white', 
                    fontSize: '1rem', 
                    fontWeight: '600', 
                    marginBottom: '12px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px'
                  }}>
                    Impact Effects
                  </h3>
                  <p style={{ 
                    color: 'rgba(255, 255, 255, 0.8)', 
                    fontSize: '0.875rem', 
                    lineHeight: '1.5',
                    marginBottom: '20px'
                  }}>
                    {enhancedAsteroid.severity?.description}
                  </p>
                </div>

                <DataRow>
                  <span className="label">Rotation Period:</span>
                  <span className="value">{enhancedAsteroid.rotationPeriod?.toFixed(1)} hours</span>
                </DataRow>

                <DataRow>
                  <span className="label">Surface Temperature:</span>
                  <span className="value">{enhancedAsteroid.temperature?.toFixed(0)} K</span>
                </DataRow>

                <DataRow>
                  <span className="label">Impact Angle:</span>
                  <span className="value">~45° (typical)</span>
                </DataRow>

                <DataRow>
                  <span className="label">Atmospheric Entry:</span>
                  <span className="value">{enhancedAsteroid.diameter > 0.1 ? "Yes" : "No"}</span>
                </DataRow>
              </>
            )}
          </>
        )}
      </Content>

      <PaginationContainer>
        <PaginationDots>
          <Dot $active={currentPage === 0} />
          <Dot $active={currentPage === 1} />
        </PaginationDots>
        <NextButton onClick={() => setCurrentPage((prev) => (prev + 1) % 2)}>
          Next
          <span className="arrow">→</span>
        </NextButton>
      </PaginationContainer>
    </PanelContainer>
  )
}
