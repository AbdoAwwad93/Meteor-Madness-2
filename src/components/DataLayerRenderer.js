import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useData } from '../context/DataContext';

function TemperatureLayer() {
  const meshRef = useRef();
  const { climateData } = useData();

  const temperatureTexture = useMemo(() => {
    // Create a procedural texture for temperature anomalies
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    // Create temperature gradient
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % canvas.width;
      const y = Math.floor((i / 4) / canvas.width);
      
      // Simulate temperature anomaly data
      const lat = (y / canvas.height) * 180 - 90;
      const lon = (x / canvas.width) * 360 - 180;
      
      // Create temperature pattern based on latitude and some noise
      const temp = Math.cos(lat * Math.PI / 180) * 0.5 + 
                   Math.sin(lon * Math.PI / 180 * 3) * 0.3 +
                   (Math.random() - 0.5) * 0.2;
      
      // Map temperature to color (blue = cold, red = hot)
      if (temp > 0) {
        data[i] = Math.min(255, 255 * temp * 2);     // Red
        data[i + 1] = Math.max(0, 255 * (1 - temp)); // Green
        data[i + 2] = 0;                              // Blue
      } else {
        data[i] = 0;                                  // Red
        data[i + 1] = Math.max(0, 255 * (1 + temp)); // Green
        data[i + 2] = Math.min(255, 255 * -temp * 2); // Blue
      }
      data[i + 3] = 128; // Alpha
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }, [climateData.temperature]);

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[6371 * 1.002, 64, 32]} />
      <meshBasicMaterial
        map={temperatureTexture}
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function CO2Layer() {
  const meshRef = useRef();
  const { climateData } = useData();

  const co2Texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % canvas.width;
      const y = Math.floor((i / 4) / canvas.width);
      
      // Simulate CO2 concentration patterns
      const lat = (y / canvas.height) * 180 - 90;
      const lon = (x / canvas.width) * 360 - 180;
      
      // Higher concentrations in industrial areas (simplified)
      const concentration = Math.abs(lat) < 60 ? 
        0.7 + Math.sin(lon * Math.PI / 180 * 2) * 0.2 + Math.random() * 0.1 :
        0.4 + Math.random() * 0.1;
      
      // Green to yellow to red gradient for CO2
      data[i] = Math.min(255, concentration * 255);     // Red
      data[i + 1] = Math.min(255, concentration * 200); // Green
      data[i + 2] = 0;                                  // Blue
      data[i + 3] = concentration * 100;                // Alpha
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }, [climateData.co2]);

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[6371 * 1.003, 64, 32]} />
      <meshBasicMaterial
        map={co2Texture}
        transparent
        opacity={0.5}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function SeaLevelLayer() {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      // Animate sea level changes
      meshRef.current.material.opacity = 0.4 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[6371 * 1.001, 32, 16]} />
      <meshBasicMaterial
        color={0x0077be}
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

function IceSheetLayer() {
  const meshRef = useRef();

  const iceTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % canvas.width;
      const y = Math.floor((i / 4) / canvas.width);
      
      const lat = (y / canvas.height) * 180 - 90;
      
      // Ice coverage at poles
      const iceIntensity = Math.abs(lat) > 60 ? 
        (Math.abs(lat) - 60) / 30 + Math.random() * 0.2 : 0;
      
      if (iceIntensity > 0) {
        data[i] = 200 + iceIntensity * 55;     // Red (white ice)
        data[i + 1] = 220 + iceIntensity * 35; // Green
        data[i + 2] = 255;                     // Blue
        data[i + 3] = iceIntensity * 150;      // Alpha
      } else {
        data[i] = data[i + 1] = data[i + 2] = data[i + 3] = 0;
      }
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }, []);

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[6371 * 1.004, 64, 32]} />
      <meshBasicMaterial
        map={iceTexture}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}

function MethaneLayer() {
  const meshRef = useRef();

  const methaneTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    const imageData = ctx.createImageData(canvas.width, canvas.height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      const x = (i / 4) % canvas.width;
      const y = Math.floor((i / 4) / canvas.width);
      
      // Simulate methane hotspots
      const concentration = Math.random() > 0.9 ? 
        0.5 + Math.random() * 0.5 : Math.random() * 0.2;
      
      // Purple to orange gradient for methane
      data[i] = Math.min(255, concentration * 255 + 100);   // Red
      data[i + 1] = Math.min(255, concentration * 100);     // Green
      data[i + 2] = Math.min(255, concentration * 200 + 55); // Blue
      data[i + 3] = concentration * 80;                     // Alpha
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  }, []);

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[6371 * 1.005, 64, 32]} />
      <meshBasicMaterial
        map={methaneTexture}
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}

export default function DataLayerRenderer({ activeDataLayer }) {
  const renderLayer = () => {
    switch (activeDataLayer) {
      case 'temperature':
        return <TemperatureLayer />;
      case 'co2':
        return <CO2Layer />;
      case 'seaLevel':
        return <SeaLevelLayer />;
      case 'iceSheet':
        return <IceSheetLayer />;
      case 'methane':
        return <MethaneLayer />;
      default:
        return null;
    }
  };

  return <group>{renderLayer()}</group>;
}
