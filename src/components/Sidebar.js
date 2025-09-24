import React, { useState } from 'react';
import styled from 'styled-components';
import { useData } from '../context/DataContext';

const SidebarContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 320px;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  color: white;
  overflow-y: auto;
  z-index: 100;
  transition: transform 0.3s ease;
  transform: ${props => props.$collapsed ? 'translateX(-280px)' : 'translateX(0)'};
`;

const CollapseButton = styled.button`
  position: absolute;
  top: 20px;
  right: -40px;
  width: 40px;
  height: 40px;
  background: rgba(0, 0, 0, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0 8px 8px 0;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  
  &:hover {
    background: rgba(0, 0, 0, 0.9);
  }
`;

const Header = styled.div`
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  h1 {
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 5px;
  }
  
  p {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.7);
  }
`;

const Section = styled.div`
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  h3 {
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 15px;
    color: #4ecdc4;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
`;

const DataLayerButton = styled.button`
  width: 100%;
  padding: 12px 15px;
  margin-bottom: 8px;
  background: ${props => props.$active ? 'rgba(78, 205, 196, 0.2)' : 'rgba(255, 255, 255, 0.05)'};
  border: 1px solid ${props => props.$active ? '#4ecdc4' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 6px;
  color: white;
  cursor: pointer;
  text-align: left;
  font-size: 0.85rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(78, 205, 196, 0.1);
    border-color: #4ecdc4;
  }
  
  .layer-name {
    font-weight: 500;
    display: block;
  }
  
  .layer-desc {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.6);
    margin-top: 4px;
  }
`;

const SatelliteItem = styled.div`
  padding: 12px 15px;
  margin-bottom: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.2);
  }
  
  .sat-name {
    font-weight: 500;
    font-size: 0.85rem;
    margin-bottom: 4px;
  }
  
  .sat-type {
    font-size: 0.75rem;
    color: #4ecdc4;
    margin-bottom: 2px;
  }
  
  .sat-status {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.6);
  }
`;

const StatusIndicator = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.$status === 'Active' ? '#4ecdc4' : '#eb4d4b'};
  margin-right: 6px;
`;

const dataLayers = [
  {
    id: 'temperature',
    name: 'Surface Temperature',
    description: 'Global temperature anomalies'
  },
  {
    id: 'co2',
    name: 'Atmospheric CO₂',
    description: 'Carbon dioxide concentrations'
  },
  {
    id: 'seaLevel',
    name: 'Sea Level',
    description: 'Global mean sea level changes'
  },
  {
    id: 'iceSheet',
    name: 'Ice Sheet Mass',
    description: 'Greenland and Antarctic ice mass'
  },
  {
    id: 'methane',
    name: 'Methane Levels',
    description: 'Atmospheric methane concentrations'
  }
];

export default function Sidebar({ onSatelliteSelect }) {
  const [collapsed, setCollapsed] = useState(false);
  const { satellites, loading } = useData();

  return (
    <SidebarContainer $collapsed={collapsed}>
      <CollapseButton onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? '→' : '←'}
      </CollapseButton>
      
      <Header>
        <h1>Asteroid Tracker</h1>
        <p>Near Earth Objects & Asteroids</p>
      </Header>

      <Section>
        <h3>Asteroids ({satellites.length})</h3>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            Loading asteroids...
          </div>
        ) : (
          satellites.map(asteroid => (
            <SatelliteItem
              key={asteroid.id}
              onClick={() => onSatelliteSelect(asteroid)}
            >
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
  );
}
