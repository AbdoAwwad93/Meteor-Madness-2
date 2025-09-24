import React, { useState } from 'react';
import styled from 'styled-components';
import { useTime } from '../context/TimeContext';

const ControlsContainer = styled.div`
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 15px 25px;
  display: flex;
  align-items: center;
  gap: 15px;
  z-index: 100;
  min-width: 500px;
`;

const PlayButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.$isPlaying ? '#eb4d4b' : '#4ecdc4'};
  border: none;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  transition: all 0.2s ease;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(78, 205, 196, 0.3);
  }
`;

const StepButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.2);
  }
`;

const TimeSlider = styled.input`
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  outline: none;
  -webkit-appearance: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #4ecdc4;
    cursor: pointer;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  }
  
  &::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: #4ecdc4;
    cursor: pointer;
    border: none;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  }
`;

const TimeDisplay = styled.div`
  color: white;
  font-size: 0.85rem;
  font-weight: 500;
  min-width: 120px;
  text-align: center;
`;

const SpeedControl = styled.select`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  padding: 6px 10px;
  font-size: 0.8rem;
  cursor: pointer;
  
  option {
    background: #000;
    color: white;
  }
`;

const DatePicker = styled.input`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: white;
  padding: 6px 10px;
  font-size: 0.8rem;
  cursor: pointer;
  
  &::-webkit-calendar-picker-indicator {
    filter: invert(1);
  }
`;

export default function TimeControls() {
  const {
    currentTime,
    isPlaying,
    playbackSpeed,
    timeRange,
    setTime,
    play,
    pause,
    setSpeed,
    stepForward,
    stepBackward
  } = useTime();

  const [showDatePicker, setShowDatePicker] = useState(false);

  const formatTime = (date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'UTC'
    }) + ' UTC';
  };

  const getSliderValue = () => {
    const total = timeRange.end.getTime() - timeRange.start.getTime();
    const current = currentTime.getTime() - timeRange.start.getTime();
    return (current / total) * 100;
  };

  const handleSliderChange = (e) => {
    const percentage = parseFloat(e.target.value);
    const total = timeRange.end.getTime() - timeRange.start.getTime();
    const newTime = new Date(timeRange.start.getTime() + (total * percentage / 100));
    setTime(newTime);
  };

  const handleDateChange = (e) => {
    const newDate = new Date(e.target.value);
    setTime(newDate);
    setShowDatePicker(false);
  };

  return (
    <ControlsContainer>
      <StepButton onClick={stepBackward} title="Step Backward">
        ⏮
      </StepButton>
      
      <PlayButton 
        $isPlaying={isPlaying}
        onClick={isPlaying ? pause : play}
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? '⏸' : '▶'}
      </PlayButton>
      
      <StepButton onClick={stepForward} title="Step Forward">
        ⏭
      </StepButton>
      
      <TimeSlider
        type="range"
        min="0"
        max="100"
        step="0.1"
        value={getSliderValue()}
        onChange={handleSliderChange}
      />
      
      <TimeDisplay onClick={() => setShowDatePicker(!showDatePicker)}>
        {formatTime(currentTime)}
      </TimeDisplay>
      
      {showDatePicker && (
        <DatePicker
          type="datetime-local"
          value={currentTime.toISOString().slice(0, 16)}
          onChange={handleDateChange}
          onBlur={() => setShowDatePicker(false)}
          autoFocus
        />
      )}
      
      <SpeedControl
        value={playbackSpeed}
        onChange={(e) => setSpeed(parseFloat(e.target.value))}
      >
        <option value={0.1}>0.1x</option>
        <option value={0.5}>0.5x</option>
        <option value={1}>1x</option>
        <option value={2}>2x</option>
        <option value={5}>5x</option>
        <option value={10}>10x</option>
        <option value={50}>50x</option>
      </SpeedControl>
    </ControlsContainer>
  );
}
