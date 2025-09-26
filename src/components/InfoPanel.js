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

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

const PanelContainer = styled.div`
  position: absolute;
  top: 50%; /* Center vertically */
  right: 20px; /* Position on right side */
  transform: translateY(-50%); /* Center vertically */
  width: 380px; /* Match image width */
  max-height: calc(100vh - 100px); /* Account for navbar and margins */
  background: rgba(15, 15, 15, 0.75);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--text);
  overflow: hidden;
  z-index: 200;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.6);
`

const Header = styled.div`
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(25, 25, 25, 0.7);
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  .title-section {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .asteroid-icon {
    width: 24px;
    height: 24px;
    background: rgba(255, 255, 255, 0.9);
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    color: #000;
    font-weight: bold;
  }
  
  h2 {
    margin: 0;
    color: white;
    font-size: 1.125rem;
    font-weight: 600;
    letter-spacing: -0.01em;
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
    font-size: 16px;
    border-radius: 50%;
    transition: all 0.2s ease;
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }
  }
`


const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(25, 25, 25, 0.7);
`

const Tab = styled.button`
  flex: 1;
  padding: 16px 20px;
  border: none;
  background: transparent;
  color: ${(props) => (props.$active ? "white" : "rgba(255, 255, 255, 0.6)")};
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  border-bottom: 2px solid ${(props) => (props.$active ? "white" : "transparent")};
  position: relative;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    color: ${(props) => (props.$active ? "white" : "rgba(255, 255, 255, 0.8)")};
  }
`

const Content = styled.div`
  padding: 24px;
  max-height: 400px;
  overflow-y: auto;
`

const DataRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
  
  .label {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.875rem;
    font-weight: 500;
  }
  
  .value {
    color: white;
    font-weight: 600;
    font-size: 0.875rem;
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  }
`

const ChartContainer = styled.div`
  height: 180px;
  margin-top: 16px;
  padding: 12px;
  background: rgba(25, 25, 25, 0.7);
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`

const PaginationContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(25, 25, 25, 0.7);
`

const PaginationDots = styled.div`
  display: flex;
  gap: 8px;
`

const Dot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(props) => (props.$active ? "white" : "rgba(255, 255, 255, 0.3)")};
  transition: all 0.2s ease;
`

const NextButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 8px 12px;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
  
  .arrow {
    font-size: 12px;
    transition: transform 0.2s ease;
  }
  
  &:hover .arrow {
    transform: translateX(2px);
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
    const period = asteroid.orbit?.period || 365

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
                  <span className="value">{formatNumber(asteroid.diameter?.toFixed(2))} km</span>
                </DataRow>

                <DataRow>
                  <span className="label">Velocity:</span>
                  <span className="value">{formatNumber(asteroid.velocity?.toFixed(0))} km/h</span>
                </DataRow>

                <DataRow>
                  <span className="label">Distance:</span>
                  <span className="value">{formatNumber((asteroid.distance / 1000000)?.toFixed(2))} million km</span>
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
