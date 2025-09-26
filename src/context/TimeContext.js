import React, { createContext, useContext, useState } from 'react';

const TimeContext = createContext();

export function TimeProvider({ children }) {
  const [currentTime, setCurrentTime] = useState(new Date());

  const value = {
    currentTime,
    setTime: setCurrentTime
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
