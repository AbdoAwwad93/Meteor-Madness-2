import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { asteroidService } from '../services/asteroidService';

const DataContext = createContext();

const initialState = {
  satellites: [],
  climateData: {
    temperature: null,
    co2: null,
    seaLevel: null,
    iceSheet: null,
    methane: null
  },
  loading: false,
  error: null,
  lastUpdated: null
};

function dataReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_SATELLITES':
      return { ...state, satellites: action.payload, loading: false };
    case 'SET_CLIMATE_DATA':
      return { 
        ...state, 
        climateData: { ...state.climateData, ...action.payload },
        loading: false,
        lastUpdated: new Date()
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

export function DataProvider({ children }) {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  const loadSatellites = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' }); // Clear previous errors
      
      const asteroids = await asteroidService.getAsteroids();

      if (asteroids.length === 0) {
        throw new Error('No asteroids with real orbital data found. All API calls failed.');
      }

      dispatch({ type: 'SET_SATELLITES', payload: asteroids });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: `Failed to load real asteroid data: ${error.message}` });
      dispatch({ type: 'SET_SATELLITES', payload: [] }); // Clear asteroids on error
    }
  };

  // Removed climate data loading since we're focusing on asteroids

  useEffect(() => {
    loadSatellites();
    
    // Only refresh if we successfully loaded asteroids initially
    let interval;
    const setupInterval = () => {
      if (state.satellites.length > 0 && !state.error) {
        interval = setInterval(() => {
          loadSatellites();
        }, 5 * 60 * 1000); // 5 minutes
      }
    };
    
    // Set up interval after initial load
    const timeout = setTimeout(setupInterval, 2000);
    
    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [state.satellites.length, state.error]);

  const value = {
    ...state,
    loadSatellites,
    clearError: () => dispatch({ type: 'CLEAR_ERROR' })
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
