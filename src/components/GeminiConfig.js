import React, { useState } from 'react';
import styled from 'styled-components';

const ConfigContainer = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  color: white;
  z-index: 10000;
  min-width: 400px;
  max-width: 500px;
  box-shadow: var(--shadow-lg);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

  @media (max-width: 768px) {
    min-width: 320px;
    max-width: calc(100vw - 2rem);
    padding: var(--spacing-lg);
    margin: var(--spacing-md);
  }

  @media (max-width: 480px) {
    min-width: auto;
    max-width: calc(100vw - 1rem);
    padding: var(--spacing-md);
    margin: var(--spacing-sm);
  }
`;

const Title = styled.h2`
  color: #00e5ff;
  margin-bottom: var(--spacing-md);
  font-size: var(--font-lg);
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: var(--font-base);
    margin-bottom: var(--spacing-sm);
  }
`;

const Description = styled.p`
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: var(--spacing-lg);
  line-height: 1.5;
  font-size: var(--font-sm);

  @media (max-width: 768px) {
    font-size: var(--font-xs);
    margin-bottom: var(--spacing-md);
  }
`;

const InputContainer = styled.div`
  margin-bottom: var(--spacing-lg);

  @media (max-width: 768px) {
    margin-bottom: var(--spacing-md);
  }
`;

const Label = styled.label`
  display: block;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: var(--spacing-sm);
  font-size: var(--font-sm);
  font-weight: 500;

  @media (max-width: 768px) {
    font-size: var(--font-xs);
  }
`;

const Input = styled.input`
  width: 100%;
  padding: var(--spacing-md) var(--spacing-lg);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-lg);
  color: white;
  font-size: var(--font-sm);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #00e5ff;
    background: rgba(255, 255, 255, 0.15);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  @media (max-width: 768px) {
    padding: var(--spacing-sm) var(--spacing-md);
    font-size: var(--font-xs);
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: var(--spacing-sm);
  justify-content: flex-end;

  @media (max-width: 768px) {
    gap: var(--spacing-xs);
    flex-direction: column;
  }
`;

const Button = styled.button`
  padding: var(--spacing-sm) var(--spacing-lg);
  border: none;
  border-radius: var(--radius);
  font-size: var(--font-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;

  &.primary {
    background: #00e5ff;
    color: black;
    
    &:hover {
      background: #00b8cc;
    }
  }

  &.secondary {
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.2);
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }

  @media (max-width: 768px) {
    padding: var(--spacing-xs) var(--spacing-md);
    font-size: var(--font-xs);
  }
`;

const LinkContainer = styled.div`
  margin-top: var(--spacing-md);
  padding-top: var(--spacing-md);
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 768px) {
    margin-top: var(--spacing-sm);
    padding-top: var(--spacing-sm);
  }
`;

const Link = styled.a`
  color: #00e5ff;
  text-decoration: none;
  font-size: var(--font-sm);
  
  &:hover {
    text-decoration: underline;
  }

  @media (max-width: 768px) {
    font-size: var(--font-xs);
  }
`;

const InfoBox = styled.div`
  background: rgba(0, 229, 255, 0.1);
  border: 1px solid rgba(0, 229, 255, 0.3);
  border-radius: var(--radius-lg);
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
  font-size: var(--font-xs);
  color: rgba(255, 255, 255, 0.9);

  @media (max-width: 768px) {
    padding: var(--spacing-sm);
    margin-bottom: var(--spacing-md);
    font-size: var(--font-xs);
  }
`;

const GeminiConfig = ({ onClose, onSave }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSave = () => {
    if (apiKey.trim()) {
      // Store the API key in localStorage for this session
      localStorage.setItem('gemini_api_key', apiKey.trim());
      onSave(apiKey.trim());
    }
    onClose();
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <ConfigContainer>
      <Title>🔮 Gemini AI Configuration</Title>
      
      <Description>
        Configure Gemini AI to enhance impact analysis with accessible explanations for both scientists and the public.
      </Description>

      <InfoBox>
        <strong>Note:</strong> Your API key is stored locally in your browser and never sent to our servers. 
        Get your free API key from Google AI Studio.
      </InfoBox>

      <InputContainer>
        <Label htmlFor="apiKey">Gemini API Key</Label>
        <Input
          id="apiKey"
          type="password"
          placeholder="Enter your Gemini API key..."
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
        />
      </InputContainer>

      <LinkContainer>
        <Link 
          href="https://makersuite.google.com/app/apikey" 
          target="_blank" 
          rel="noopener noreferrer"
        >
          Get your free API key from Google AI Studio →
        </Link>
      </LinkContainer>

      <ButtonContainer>
        <Button className="secondary" onClick={handleSkip}>
          Skip for now
        </Button>
        <Button className="primary" onClick={handleSave}>
          Save & Enable
        </Button>
      </ButtonContainer>
    </ConfigContainer>
  );
};

export default GeminiConfig;

