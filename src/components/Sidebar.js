import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { useData } from '../context/DataContext';

const SidebarContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 320px;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  border-right: ${props => props.$collapsed ? 'none' : '1px solid rgba(255, 255, 255, 0.1)'};
  color: white;
  overflow-y: auto;
  overflow-x: hidden;
  z-index: 100;
  transition: transform 0.3s ease;
  transform: ${props => props.$collapsed ? 'translateX(-100%)' : 'translateX(0)'};
`;

const CollapseButton = styled.button`
  position: fixed;
  top: 20px;
  left: ${props => props.$collapsed ? '0px' : '320px'};
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
  z-index: 1002;
  
  &:hover {
    background: rgba(0, 0, 0, 0.9);
  }
`;

const Header = styled.div`
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  h1 {
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: 4px;
    letter-spacing: 0.5px;
  }
  
  p {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.65);
  }
`;

const Section = styled.div`
  padding: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  h3 {
    font-size: 0.9rem;
    font-weight: 600;
    margin-bottom: 15px;
    color: var(--accent);
    text-transform: uppercase;
    letter-spacing: 1px;
  }
`;

const SearchBar = styled.input`
  width: 100%;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(0, 0, 0, 0.5);
  color: #fff;
  font-size: 0.85rem;
  outline: none;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &::placeholder { color: rgba(255, 255, 255, 0.45); }

  &:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(0, 229, 255, 0.15);
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
    color: var(--accent);
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
  background: ${props => props.$status === 'Active' ? 'var(--accent)' : '#eb4d4b'};
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
  const [query, setQuery] = useState('');
  const { satellites, loading } = useData();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return satellites;
    return satellites.filter(a =>
      (a.name || '').toLowerCase().includes(q) ||
      (a.type || '').toLowerCase().includes(q)
    );
  }, [satellites, query]);

  return (
    <>
      <CollapseButton $collapsed={collapsed} onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? '→' : '←'}
      </CollapseButton>
      <SidebarContainer $collapsed={collapsed}>
      <Section>
        <SearchBar
          placeholder="Search by name or type"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search asteroids"
        />
      </Section>

      <Section>
        <h3>Asteroids ({filtered.length})</h3>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            Loading asteroids...
          </div>
        ) : (
          filtered.map(asteroid => (
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
    </>
  );
}
