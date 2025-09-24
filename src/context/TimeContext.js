import React, { createContext, useContext, useReducer, useEffect } from 'react';

const TimeContext = createContext();

const initialState = {
  currentTime: new Date(),
  isPlaying: false,
  playbackSpeed: 1,
  timeRange: {
    start: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
    end: new Date()
  }
};

function timeReducer(state, action) {
  switch (action.type) {
    case 'SET_TIME':
      return { ...state, currentTime: action.payload };
    case 'PLAY':
      return { ...state, isPlaying: true };
    case 'PAUSE':
      return { ...state, isPlaying: false };
    case 'SET_SPEED':
      return { ...state, playbackSpeed: action.payload };
    case 'SET_TIME_RANGE':
      return { ...state, timeRange: action.payload };
    case 'STEP_FORWARD':
      const newTime = new Date(state.currentTime.getTime() + (60000 * state.playbackSpeed));
      return { 
        ...state, 
        currentTime: newTime > state.timeRange.end ? state.timeRange.end : newTime 
      };
    case 'STEP_BACKWARD':
      const prevTime = new Date(state.currentTime.getTime() - (60000 * state.playbackSpeed));
      return { 
        ...state, 
        currentTime: prevTime < state.timeRange.start ? state.timeRange.start : prevTime 
      };
    default:
      return state;
  }
}

export function TimeProvider({ children }) {
  const [state, dispatch] = useReducer(timeReducer, initialState);

  useEffect(() => {
    let interval;
    if (state.isPlaying) {
      interval = setInterval(() => {
        dispatch({ type: 'STEP_FORWARD' });
      }, 100); // Update every 100ms for smooth animation
    }
    return () => clearInterval(interval);
  }, [state.isPlaying, state.playbackSpeed]);

  const value = {
    ...state,
    setTime: (time) => dispatch({ type: 'SET_TIME', payload: time }),
    play: () => dispatch({ type: 'PLAY' }),
    pause: () => dispatch({ type: 'PAUSE' }),
    setSpeed: (speed) => dispatch({ type: 'SET_SPEED', payload: speed }),
    setTimeRange: (range) => dispatch({ type: 'SET_TIME_RANGE', payload: range }),
    stepForward: () => dispatch({ type: 'STEP_FORWARD' }),
    stepBackward: () => dispatch({ type: 'STEP_BACKWARD' })
  };

  return (
    <TimeContext.Provider value={value}>
      {children}
    </TimeContext.Provider>
  );
}

export function useTime() {
  const context = useContext(TimeContext);
  if (!context) {
    throw new Error('useTime must be used within a TimeProvider');
  }
  return context;
}
