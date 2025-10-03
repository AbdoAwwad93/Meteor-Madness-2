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
  border-radius: 12px;
  padding: 30px;
  color: white;
  z-index: 10000;
  min-width: 400px;
  max-width: 500px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const Title = styled.h2`
  color: #00e5ff;
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: 600;
`;

const Description = styled.p`
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 20px;
  line-height: 1.5;
  font-size: 14px;
`;

const InputContainer = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 15px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: white;
  font-size: 14px;
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
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
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
`;

const LinkContainer = styled.div`
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
`;

const Link = styled.a`
  color: #00e5ff;
  text-decoration: none;
  font-size: 14px;
  
  &:hover {
    text-decoration: underline;
  }
`;

const InfoBox = styled.div`
  background: rgba(0, 229, 255, 0.1);
  border: 1px solid rgba(0, 229, 255, 0.3);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.9);
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
