import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import geminiService from '../services/geminiService';

const AnalysisContainer = styled.div`
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  color: white;
  min-width: 350px;
  max-width: 500px;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const Header = styled.div`
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
`;

const Title = styled.div`
  font-weight: 700;
  color: #ffffff;
  font-size: 18px;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 5px;
`;

const Subtitle = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 400;
`;

const TabContainer = styled.div`
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const Tab = styled.button`
  flex: 1;
  padding: 10px 15px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.6);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;

  &.active {
    color: #00e5ff;
    border-bottom-color: #00e5ff;
  }

  &:hover {
    color: rgba(255, 255, 255, 0.8);
  }
`;

const ContentArea = styled.div`
  line-height: 1.6;
`;

const Section = styled.div`
  margin-bottom: 20px;
`;

const SectionTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #00e5ff;
  margin-bottom: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SectionContent = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.9);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 15px;
`;

const RiskBadge = styled.div`
  display: inline-block;
  padding: 6px 12px;
  background: ${props => {
    switch (props.level) {
      case 'Low': return '#00ff88';
      case 'Moderate': return '#ffaa00';
      case 'High': return '#ff8800';
      case 'Extreme': return '#ff0000';
      default: return '#666';
    }
  }};
  color: white;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 15px;
`;

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
`;

const ErrorMessage = styled.div`
  background: rgba(255, 71, 87, 0.1);
  border: 1px solid rgba(255, 71, 87, 0.3);
  border-radius: 8px;
  padding: 12px;
  color: #ff4757;
  font-size: 12px;
  text-align: center;
`;

const ComparisonList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
`;

const ComparisonItem = styled.div`
  background: rgba(0, 229, 255, 0.1);
  border: 1px solid rgba(0, 229, 255, 0.3);
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  color: #00e5ff;
`;

const KeyFindingsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const KeyFindingItem = styled.li`
  background: rgba(255, 255, 255, 0.05);
  border-left: 3px solid #00e5ff;
  padding: 10px 15px;
  margin-bottom: 8px;
  border-radius: 0 6px 6px 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
`;

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
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
  margin-bottom: 20px;
`;

const StatCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 12px;
  text-align: center;
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: rgba(255, 255, 255, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 5px;
`;

const StatValue = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
`;

const AccessibleImpactAnalysis = ({ 
  impactData, 
  asteroidData, 
  cityData, 
  onClose,
  visible = true 
}) => {
  const [activeTab, setActiveTab] = useState('public');
  const [geminiAnalysis, setGeminiAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (visible && impactData && asteroidData && cityData) {
      generateGeminiAnalysis();
    }
  }, [visible, impactData, asteroidData, cityData]);

  const generateGeminiAnalysis = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const analysis = await geminiService.generateImpactAnalysis(
        impactData,
        asteroidData,
        cityData
      );
      setGeminiAnalysis(analysis);
    } catch (err) {
      console.error('Failed to generate Gemini analysis:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatEnergy = (joules) => {
    const tntEquivalent = joules / (4.184e9);
    if (tntEquivalent >= 1e6) {
      return `${(tntEquivalent / 1e6).toFixed(1)} Megatons TNT`;
    } else if (tntEquivalent >= 1e3) {
      return `${(tntEquivalent / 1e3).toFixed(1)} Kilotons TNT`;
    } else {
      return `${tntEquivalent.toFixed(1)} Tons TNT`;
    }
  };

  const getSeverityColor = (energy) => {
    if (energy > 1e20) return '#ff0000';
    if (energy > 1e19) return '#ff8800';
    if (energy > 1e18) return '#ffaa00';
    return '#00ff88';
  };

  if (!visible) return null;

  return (
    <AnalysisContainer>
      <CloseButton onClick={onClose}>×</CloseButton>
      
      <Header>
        <Title>Impact Analysis</Title>
        <Subtitle>
          {asteroidData?.name || 'Asteroid'} → {cityData?.name || 'Target'}
        </Subtitle>
      </Header>

      <TabContainer>
        <Tab 
          className={activeTab === 'public' ? 'active' : ''}
          onClick={() => setActiveTab('public')}
        >
          Public
        </Tab>
        <Tab 
          className={activeTab === 'scientific' ? 'active' : ''}
          onClick={() => setActiveTab('scientific')}
        >
          Scientific
        </Tab>
        <Tab 
          className={activeTab === 'technical' ? 'active' : ''}
          onClick={() => setActiveTab('technical')}
        >
          Technical
        </Tab>
      </TabContainer>

      <ContentArea>
        {loading && (
          <LoadingSpinner>
            <div className="spinner"></div>
          </LoadingSpinner>
        )}

        {error && (
          <ErrorMessage>
            {error}
          </ErrorMessage>
        )}

        {!loading && !error && geminiAnalysis && (
          <>
            {activeTab === 'public' && (
              <div>
                <RiskBadge level={geminiAnalysis.riskLevel}>
                  {geminiAnalysis.riskLevel} Risk
                </RiskBadge>
                
                <Section>
                  <SectionTitle>🌍 Public Impact Assessment</SectionTitle>
                  <SectionContent>
                    {geminiAnalysis.publicImpact}
                  </SectionContent>
                </Section>

                <Section>
                  <SectionTitle>🛡️ Safety & Response</SectionTitle>
                  <SectionContent>
                    {geminiAnalysis.safetyResponse}
                  </SectionContent>
                </Section>

                <Section>
                  <SectionTitle>📊 Key Findings</SectionTitle>
                  <KeyFindingsList>
                    {geminiAnalysis.keyFindings?.map((finding, index) => (
                      <KeyFindingItem key={index}>
                        {finding}
                      </KeyFindingItem>
                    ))}
                  </KeyFindingsList>
                </Section>

                {geminiAnalysis.comparisonEvents && (
                  <Section>
                    <SectionTitle>🔍 Similar Events</SectionTitle>
                    <ComparisonList>
                      {geminiAnalysis.comparisonEvents.map((event, index) => (
                        <ComparisonItem key={index}>
                          {event}
                        </ComparisonItem>
                      ))}
                    </ComparisonList>
                  </Section>
                )}
              </div>
            )}

            {activeTab === 'scientific' && (
              <div>
                <Section>
                  <SectionTitle>🔬 Scientific Summary</SectionTitle>
                  <SectionContent>
                    {geminiAnalysis.scientificSummary}
                  </SectionContent>
                </Section>

                <Section>
                  <SectionTitle>📚 Scientific Context</SectionTitle>
                  <SectionContent>
                    {geminiAnalysis.scientificContext}
                  </SectionContent>
                </Section>

                <Section>
                  <SectionTitle>📊 Key Findings</SectionTitle>
                  <KeyFindingsList>
                    {geminiAnalysis.keyFindings?.map((finding, index) => (
                      <KeyFindingItem key={index}>
                        {finding}
                      </KeyFindingItem>
                    ))}
                  </KeyFindingsList>
                </Section>
              </div>
            )}

            {activeTab === 'technical' && impactData && (
              <div>
                <StatsGrid>
                  <StatCard>
                    <StatLabel>Energy Release</StatLabel>
                    <StatValue style={{ color: '#00e5ff' }}>
                      {formatEnergy(impactData.results.energy_joules)}
                    </StatValue>
                  </StatCard>
                  <StatCard>
                    <StatLabel>Crater Diameter</StatLabel>
                    <StatValue style={{ color: '#ff4757' }}>
                      {impactData.results.crater_diameter_km.toFixed(1)} km
                    </StatValue>
                  </StatCard>
                  <StatCard>
                    <StatLabel>Blast Radius</StatLabel>
                    <StatValue style={{ color: '#ff8800' }}>
                      {impactData.results.blast_radius_km.toFixed(0)} km
                    </StatValue>
                  </StatCard>
                  <StatCard>
                    <StatLabel>Earthquake</StatLabel>
                    <StatValue style={{ color: '#ffaa00' }}>
                      M{impactData.results.earthquake_magnitude.toFixed(1)}
                    </StatValue>
                  </StatCard>
                </StatsGrid>

                <Section>
                  <SectionTitle>🎯 Impact Parameters</SectionTitle>
                  <SectionContent>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Asteroid Size:</strong> {asteroidData?.diameter || 0.5} km diameter
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Velocity:</strong> {((asteroidData?.velocity || 25000) / 1000).toFixed(1)} km/s
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Target:</strong> {cityData?.name}, {cityData?.country}
                    </div>
                    <div style={{ marginBottom: '10px' }}>
                      <strong>Coordinates:</strong> {cityData?.lat?.toFixed(4)}°, {cityData?.lng?.toFixed(4)}°
                    </div>
                    <div>
                      <strong>Surface:</strong> {impactData.location?.is_water ? 'Water' : 'Land'}
                    </div>
                  </SectionContent>
                </Section>

                {impactData.volcanic_impact && (
                  <Section>
                    <SectionTitle>🌋 Volcanic Activity</SectionTitle>
                    <SectionContent>
                      {impactData.volcanic_impact.is_affected ? (
                        <div>
                          <div style={{ color: '#ff8c00', marginBottom: '8px' }}>
                            <strong>Volcanic Trigger Detected</strong>
                          </div>
                          <div>Volcano: {impactData.volcanic_impact.volcano_name}</div>
                          <div>Impact Level: {impactData.volcanic_impact.impact_level}</div>
                        </div>
                      ) : (
                        <div style={{ color: '#00ff88' }}>
                          No volcanic activity triggered
                        </div>
                      )}
                    </SectionContent>
                  </Section>
                )}
              </div>
            )}
          </>
        )}
      </ContentArea>
    </AnalysisContainer>
  );
};

export default AccessibleImpactAnalysis;
