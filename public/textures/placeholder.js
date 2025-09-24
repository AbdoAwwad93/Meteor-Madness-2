// This script creates simple placeholder textures for development
// Run this in a browser console or use a canvas library to generate actual textures

function createPlaceholderTexture(width = 2048, height = 1024, type = 'earth') {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  
  switch (type) {
    case 'earth':
      // Blue background for oceans
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(0, 0, width, height);
      
      // Green/brown landmasses (simplified continents)
      ctx.fillStyle = '#16a34a';
      // North America
      ctx.fillRect(width * 0.15, height * 0.2, width * 0.25, height * 0.4);
      // Europe/Asia
      ctx.fillRect(width * 0.45, height * 0.15, width * 0.4, height * 0.35);
      // Africa
      ctx.fillRect(width * 0.48, height * 0.35, width * 0.15, height * 0.4);
      // South America
      ctx.fillRect(width * 0.25, height * 0.5, width * 0.12, height * 0.35);
      // Australia
      ctx.fillRect(width * 0.75, height * 0.65, width * 0.1, height * 0.15);
      break;
      
    case 'normal':
      // Gray normal map
      ctx.fillStyle = '#808080';
      ctx.fillRect(0, 0, width, height);
      break;
      
    case 'specular':
      // Black for land, white for water
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = '#ffffff';
      // Water areas (inverse of land)
      ctx.fillRect(0, 0, width * 0.15, height);
      ctx.fillRect(width * 0.4, 0, width * 0.05, height);
      break;
      
    case 'clouds':
      // Semi-transparent white clouds
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(0, 0, width, height);
      // Add some cloud patterns
      for (let i = 0; i < 50; i++) {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.5})`;
        ctx.fillRect(
          Math.random() * width,
          Math.random() * height,
          Math.random() * 200 + 50,
          Math.random() * 100 + 25
        );
      }
      break;
  }
  
  return canvas.toDataURL('image/jpeg', 0.8);
}

// Usage instructions:
console.log('To create placeholder textures:');
console.log('1. Open browser console');
console.log('2. Run this script');
console.log('3. Use createPlaceholderTexture() function');
console.log('4. Save the returned data URLs as image files');
