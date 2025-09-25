import React, { useState } from 'react';
import styled from 'styled-components';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const PanelContainer = styled.div`
  position: absolute;
  top: 20px;
  right: 20px;
  width: 400px;
  max-height: 80vh;
  background: rgba(0, 0, 0, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  color: white;
  overflow: hidden;
  z-index: 200;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const Header = styled.div`
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  h2 {
    margin: 0 0 5px 0;
    color: var(--accent);
    font-size: 1.2rem;
  }
  
  .type {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
    margin-bottom: 10px;
  }
  
  .status {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: bold;
    background: ${props => props.status === 'Safe' ? 'var(--success)' : 'var(--danger)'};
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 15px;
  right: 15px;
  width: 30px;
  height: 30px;
  border: none;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const TabContainer = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Tab = styled.button`
  flex: 1;
  padding: 12px;
  border: none;
  background: ${props => props.$active ? 'rgba(0, 229, 255, 0.12)' : 'transparent'};
  color: ${props => props.$active ? 'var(--accent)' : 'rgba(255, 255, 255, 0.7)'};
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    background: rgba(0, 229, 255, 0.08);
  }
`;

const Content = styled.div`
  padding: 20px;
  max-height: 400px;
  overflow-y: auto;
`;

const DataRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  
  .label {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
  }
  
  .value {
    color: white;
    font-weight: 500;
    font-size: 0.9rem;
  }
`;

const ChartContainer = styled.div`
  height: 200px;
  margin-top: 20px;
`;

export default function InfoPanel({ asteroid, onClose }) {
  const [activeTab, setActiveTab] = useState('details');

  if (!asteroid) return null;

  const formatNumber = (num) => {
    if (num === undefined || num === null) return 'N/A';
    return typeof num === 'number' ? num.toLocaleString() : num;
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === 'Invalid Date') return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return 'Unknown';
    }
  };

  // Mock orbital data for visualization
  const generateOrbitData = () => {
    const data = [];
    const labels = [];
    const period = asteroid.orbit?.period || 365;
    
    for (let i = 0; i <= 24; i++) {
      labels.push(`${i}h`);
      // Simulate orbital distance variation
      const angle = (i / 24) * 2 * Math.PI;
      const baseDistance = asteroid.orbit?.semiMajorAxis || 10;
      const eccentricity = asteroid.orbit?.eccentricity || 0.1;
      const distance = baseDistance * (1 + eccentricity * Math.cos(angle));
      data.push(distance);
    }
    
    return { labels, data };
  };

  const chartData = generateOrbitData();

  const orbitChartData = {
    labels: chartData.labels,
    datasets: [
      {
        label: 'Distance from Earth (AU)',
        data: chartData.data,
        borderColor: '#4ecdc4',
        backgroundColor: 'rgba(78, 205, 196, 0.1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: 'white',
        },
      },
    },
    scales: {
      x: {
        ticks: { color: 'rgba(255, 255, 255, 0.7)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      y: {
        ticks: { color: 'rgba(255, 255, 255, 0.7)' },
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
      },
    },
  };

  return (
    <PanelContainer status={asteroid.status}>
      <Header status={asteroid.status}>
        <h2>{asteroid.name}</h2>
        <div className="type">{asteroid.type}</div>
        <div className="status">{asteroid.status}</div>
      </Header>
      
      <CloseButton onClick={onClose}>×</CloseButton>
      
      <TabContainer>
        <Tab 
          $active={activeTab === 'details'} 
          onClick={() => setActiveTab('details')}
        >
          Details
        </Tab>
        <Tab 
          $active={activeTab === 'orbital'} 
          onClick={() => setActiveTab('orbital')}
        >
          Orbital Data
        </Tab>
      </TabContainer>
      
      <Content>
        {activeTab === 'details' && (
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
              <span className="value">{asteroid.isPotentiallyHazardous ? 'Yes' : 'No'}</span>
            </DataRow>
          </>
        )}
        
        {activeTab === 'orbital' && (
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
  );
}
