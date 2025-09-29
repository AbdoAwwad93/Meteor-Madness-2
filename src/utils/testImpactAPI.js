// Simple test utility for the impact API
import { calculateImpact, formatImpactAnalysis } from '../services/impactService'

export const testImpactAPI = async () => {
  console.log('Testing Impact API...')
  
  const testData = {
    diameter_m: 500,
    velocity_kms: 20,
    lat: 30.0,
    lon: 31.0,
    delta_km: 1000
  }
  
  try {
    console.log('Sending test data:', testData)
    const result = await calculateImpact(testData)
    console.log('Raw API response:', result)
    
    const formatted = formatImpactAnalysis(result)
    console.log('Formatted analysis:', formatted)
    
    return { success: true, result, formatted }
  } catch (error) {
    console.error('API test failed:', error)
    return { success: false, error: error.message }
  }
}

// Auto-test when module loads (for development)
if (process.env.NODE_ENV === 'development') {
  // Uncomment the line below to auto-test on page load
  // testImpactAPI()
}
