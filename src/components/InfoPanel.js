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
  top: 20px;
  right: 20px;
  width: 420px;
  max-height: 85vh;
  background: var(--panel);
  backdrop-filter: blur(20px);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  color: var(--text);
  overflow: hidden;
  z-index: 200;
  box-shadow: var(--shadow-lg);
`

const Header = styled.div`
  padding: 24px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-secondary);
  
  h2 {
    margin: 0 0 8px 0;
    color: var(--text);
    font-size: 1.25rem;
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  
  .type {
    color: var(--text-secondary);
    font-size: 0.875rem;
    margin-bottom: 12px;
    font-weight: 500;
  }
  
  .status {
    display: inline-flex;
    align-items: center;
    padding: 6px 12px;
    border-radius: var(--radius);
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: ${(props) => (props.$status === "Safe" ? "rgba(0, 255, 136, 0.15)" : "rgba(255, 71, 87, 0.15)")};
    color: ${(props) => (props.$status === "Safe" ? "var(--success)" : "var(--danger)")};
    border: 1px solid ${(props) => (props.$status === "Safe" ? "rgba(0, 255, 136, 0.3)" : "rgba(255, 71, 87, 0.3)")};
  }
`

const CloseButton = styled.button`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 32px;
  height: 32px;
  border: none;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  border-radius: var(--radius);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--panel-secondary);
    color: var(--danger);
    transform: scale(1.05);
  }
`

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid var(--border);
  background: var(--bg-secondary);
`

const Tab = styled.button`
  flex: 1;
  padding: 16px;
  border: none;
  background: ${(props) => (props.$active ? "var(--panel)" : "transparent")};
  color: ${(props) => (props.$active ? "var(--accent)" : "var(--text-secondary)")};
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
  border-bottom: 2px solid ${(props) => (props.$active ? "var(--accent)" : "transparent")};
  
  &:hover {
    background: ${(props) => (props.$active ? "var(--panel)" : "var(--panel-secondary)")};
    color: ${(props) => (props.$active ? "var(--accent)" : "var(--text)")};
  }
`

const Content = styled.div`
  padding: 24px;
  max-height: 500px;
  overflow-y: auto;
`

const DataRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 0;
  border-bottom: 1px solid var(--border);
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }
  
  .label {
    color: var(--text-secondary);
    font-size: 0.875rem;
    font-weight: 500;
  }
  
  .value {
    color: var(--text);
    font-weight: 600;
    font-size: 0.875rem;
    font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', monospace;
  }
`

const ChartContainer = styled.div`
  height: 240px;
  margin-top: 24px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: var(--radius);
  border: 1px solid var(--border);
`

export default function InfoPanel({ asteroid, onClose }) {
  const [activeTab, setActiveTab] = useState("details")

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
        <h2>{asteroid.name}</h2>
        <div className="type">{asteroid.type}</div>
        <div className="status">{asteroid.status}</div>
      </Header>

      <CloseButton onClick={onClose}>×</CloseButton>

      <TabContainer>
        <Tab $active={activeTab === "details"} onClick={() => setActiveTab("details")}>
          Details
        </Tab>
        <Tab $active={activeTab === "orbital"} onClick={() => setActiveTab("orbital")}>
          Orbital Data
        </Tab>
      </TabContainer>

      <Content>
        {activeTab === "details" && (
          <>
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

            <DataRow>
              <span className="label">Magnitude:</span>
              <span className="value">{formatNumber(asteroid.magnitude?.toFixed(1))}</span>
            </DataRow>

            <DataRow>
              <span className="label">Discovery Date:</span>
              <span className="value">{formatDate(asteroid.discoveryDate)}</span>
            </DataRow>

            <DataRow>
              <span className="label">Potentially Hazardous:</span>
              <span className="value">{asteroid.isPotentiallyHazardous ? "Yes" : "No"}</span>
            </DataRow>
          </>
        )}

        {activeTab === "orbital" && (
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

            <ChartContainer>
              <Line data={orbitChartData} options={chartOptions} />
            </ChartContainer>
          </>
        )}
      </Content>
    </PanelContainer>
  )
}
