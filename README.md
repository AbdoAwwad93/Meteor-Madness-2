# NASA Eyes on Earth Clone

A fully functional clone of NASA's "Eyes on the Earth" visualization tool built with React and Three.js. This application provides real-time 3D Earth visualization with satellite tracking, climate data overlays, and interactive time controls.

![NASA Eyes on Earth Clone](https://via.placeholder.com/800x400/000000/FFFFFF?text=NASA+Eyes+on+Earth+Clone)

## 🌍 Features

### Core Visualization
- **3D Earth Globe** - Realistic Earth rendering with day/night textures
- **Real-time Satellite Tracking** - Live orbital positions and trajectories
- **Interactive Controls** - Zoom, rotate, and pan around Earth
- **Time Controls** - Play, pause, and scrub through time

### Data Layers
- **Surface Temperature** - Global temperature anomalies
- **Atmospheric CO₂** - Carbon dioxide concentration maps
- **Sea Level Changes** - Global mean sea level variations
- **Ice Sheet Mass** - Greenland and Antarctic ice coverage
- **Methane Levels** - Atmospheric methane concentrations

### Satellite Features
- **Orbital Visualization** - Real-time satellite positions and paths
- **Detailed Information** - Comprehensive satellite data panels
- **Live Telemetry** - Charts showing altitude, velocity, and status
- **Mission Details** - Launch dates, instruments, and descriptions

### User Interface
- **NASA-inspired Design** - Matches the look and feel of the original
- **Responsive Layout** - Works on desktop and mobile devices
- **Interactive Panels** - Collapsible sidebar and floating info cards
- **Performance Optimized** - Smooth 60 FPS rendering

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- NASA API key (free from https://api.nasa.gov/)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nasa-eyes-on-earth-clone
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your NASA API key:
   ```
   REACT_APP_NASA_API_KEY=your_nasa_api_key_here
   ```

4. **Download Earth textures** (Optional but recommended)
   - Download high-resolution Earth textures from NASA Visible Earth
   - Place them in `public/textures/` directory
   - See `public/textures/README.md` for specific files and sources

5. **Start the development server**
   ```bash
   npm start
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
src/
├── components/           # React components
│   ├── EarthVisualization.js    # Main 3D Earth component
│   ├── SatelliteRenderer.js     # Satellite visualization
│   ├── DataLayerRenderer.js     # Climate data overlays
│   ├── Sidebar.js               # Navigation sidebar
│   ├── TimeControls.js          # Time manipulation controls
│   └── InfoPanel.js             # Satellite detail panel
├── context/             # React context providers
│   ├── DataContext.js           # Global data state
│   └── TimeContext.js           # Time state management
├── services/            # API and data services
│   └── nasaAPI.js              # NASA API integration
└── App.js              # Main application component
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `REACT_APP_NASA_API_KEY` | NASA API key | `DEMO_KEY` |
| `REACT_APP_CACHE_DURATION` | API cache duration (ms) | `300000` |
| `REACT_APP_MAX_SATELLITES` | Maximum satellites to display | `50` |
| `REACT_APP_UPDATE_INTERVAL` | Data update interval (ms) | `5000` |

### NASA APIs Used

- **NASA Earth Imagery API** - Earth surface images
- **NASA Earthdata** - Climate and atmospheric data
- **NASA POWER** - Climate data services
- **JPL Horizons** - Satellite orbital elements
- **Celestrak** - TLE (Two-Line Element) data

## 🎮 Usage

### Navigation
- **Mouse Drag** - Rotate Earth
- **Mouse Wheel** - Zoom in/out
- **Right Click + Drag** - Pan view

### Time Controls
- **Play/Pause** - Start/stop time animation
- **Speed Control** - Adjust playback speed (0.1x to 50x)
- **Time Slider** - Scrub to specific time
- **Date Picker** - Jump to specific date/time

### Data Layers
- Click data layer buttons in sidebar to toggle overlays
- Each layer shows different climate data visualizations
- Layers can be combined for comprehensive analysis

### Satellite Interaction
- Click satellites in the sidebar to select them
- Selected satellites show orbital paths and info panels
- Info panels include telemetry charts and mission details

## 🔬 Data Sources

### Real-time Data
- Satellite positions from Celestrak TLE data
- Climate data from NASA Earthdata APIs
- Earth imagery from NASA Visible Earth

### Mock Data (Development)
- Procedurally generated climate patterns
- Simulated satellite telemetry
- Realistic orbital calculations

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Netlify
1. Build the project: `npm run build`
2. Deploy the `build` folder to Netlify
3. Set environment variables in Netlify dashboard

### Deploy to Vercel
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push

## 🎨 Customization

### Adding New Data Layers
1. Create new layer component in `DataLayerRenderer.js`
2. Add layer definition to `Sidebar.js`
3. Implement data fetching in `nasaAPI.js`

### Adding New Satellites
1. Update satellite data in `nasaAPI.js`
2. Add TLE data for accurate orbital calculations
3. Include mission-specific information

### Styling
- Modify styled-components in each component file
- Update color scheme in component styles
- Customize NASA branding as needed

## 🔧 Performance Optimization

- **Texture Compression** - Use compressed texture formats
- **Level of Detail** - Reduce geometry for distant objects
- **Frustum Culling** - Only render visible satellites
- **API Caching** - Cache NASA API responses
- **Lazy Loading** - Load textures and data on demand

## 🐛 Troubleshooting

### Common Issues

**Textures not loading**
- Ensure texture files are in `public/textures/`
- Check file names match exactly
- Verify file formats are supported (JPG, PNG)

**API rate limiting**
- Use your own NASA API key instead of DEMO_KEY
- Implement proper caching
- Reduce update frequency

**Performance issues**
- Lower texture resolution
- Reduce number of satellites displayed
- Disable data layers if not needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **NASA** for providing open APIs and Earth imagery
- **Three.js** for 3D rendering capabilities
- **React Three Fiber** for React integration
- **Celestrak** for satellite orbital data
- **NASA Eyes on the Earth** for inspiration and design reference

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For questions, issues, or contributions:
- Open an issue on GitHub
- Check existing documentation
- Review NASA API documentation

---

**Note**: This is an educational clone created for demonstration purposes. It is not affiliated with NASA or the official "Eyes on the Earth" project.
