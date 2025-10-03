/**
 * Gemini AI Service for Impact Analysis
 * Transforms technical asteroid impact data into accessible content
 */

class GeminiService {
  constructor() {
    this.apiKey = process.env.REACT_APP_GEMINI_API_KEY || '';
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
  }

  /**
   * Generate accessible impact analysis using Gemini AI
   * @param {Object} impactData - Technical impact analysis data
   * @param {Object} asteroidData - Asteroid characteristics
   * @param {Object} cityData - Target city information
   * @returns {Promise<Object>} Accessible impact analysis
   */
  async generateImpactAnalysis(impactData, asteroidData, cityData) {
    try {
      if (!this.apiKey) {
        throw new Error('Gemini API key not configured. Please set REACT_APP_GEMINI_API_KEY environment variable.');
      }

      const prompt = this.buildAnalysisPrompt(impactData, asteroidData, cityData);
      
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.candidates || !result.candidates[0] || !result.candidates[0].content) {
        throw new Error('Invalid response from Gemini API');
      }

      const aiResponse = result.candidates[0].content.parts[0].text;
      
      return this.parseAIResponse(aiResponse, impactData);
    } catch (error) {
      console.error('Error generating impact analysis with Gemini:', error);
      throw error;
    }
  }

  /**
   * Build comprehensive prompt for Gemini AI
   */
  buildAnalysisPrompt(impactData, asteroidData, cityData) {
    const { results, volcanic_impact, location } = impactData;
    
    return `
You are a scientific communication expert specializing in making complex impact analysis data accessible to both scientists and the general public. 

**ASTEROID IMPACT DATA:**
- Asteroid: "${asteroidData.name || 'Unnamed Asteroid'}"
- Size: ${asteroidData.diameter || 0.5} km diameter
- Velocity: ${((asteroidData.velocity || 25000) / 1000).toFixed(1)} km/s
- Target: ${cityData.name}, ${cityData.country || 'Unknown Country'}

**TECHNICAL IMPACT ANALYSIS:**
- Energy Release: ${(results.energy_joules / 1e15).toFixed(2)} × 10¹⁵ Joules (${(results.energy_joules / (4.184e9) / 1e6).toFixed(1)} Megatons TNT)
- Crater Diameter: ${results.crater_diameter_km.toFixed(2)} km
- Blast Radius: ${results.blast_radius_km.toFixed(1)} km
- Earthquake Magnitude: ${results.earthquake_magnitude.toFixed(1)} Richter scale
- Impact Surface: ${location.is_water ? 'Water (Ocean/Sea)' : 'Land'}
- Volcanic Trigger: ${volcanic_impact.is_affected ? `Yes - ${volcanic_impact.volcano_name}` : 'No'}

**TASK:**
Transform this technical data into a comprehensive, accessible impact analysis with the following structure:

**SCIENTIFIC SUMMARY:** (for researchers and professionals)
- Precise technical details
- Comparative analysis with historical events
- Environmental and geological implications
- Research significance

**PUBLIC IMPACT ASSESSMENT:** (for general audience)
- Real-world consequences in simple terms
- Comparison to familiar events (wars, natural disasters, etc.)
- Regional and global effects
- Human impact and safety implications

**SCIENTIFIC CONTEXT:** (educational content)
- How this compares to other known impacts
- What scientists would study
- Long-term environmental effects
- Planetary defense implications

**SAFETY & RESPONSE:** (practical information)
- Immediate effects and timeline
- Evacuation considerations
- Infrastructure damage assessment
- Recovery implications

Please format your response as a JSON object with these exact keys:
{
  "scientificSummary": "Detailed technical analysis...",
  "publicImpact": "Accessible explanation...",
  "scientificContext": "Educational content...",
  "safetyResponse": "Practical information...",
  "comparisonEvents": ["Event 1", "Event 2", "Event 3"],
  "riskLevel": "Low|Moderate|High|Extreme",
  "keyFindings": ["Finding 1", "Finding 2", "Finding 3"]
}

Make the content engaging, accurate, and appropriate for both audiences. Use analogies and comparisons to help people understand the scale and implications.
    `.trim();
  }

  /**
   * Parse AI response and structure the data
   */
  parseAIResponse(aiResponse, originalImpactData) {
    try {
      // Extract JSON from the AI response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const parsedData = JSON.parse(jsonMatch[0]);
      
      // Validate required fields
      const requiredFields = ['scientificSummary', 'publicImpact', 'scientificContext', 'safetyResponse'];
      for (const field of requiredFields) {
        if (!parsedData[field]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }

      // Add original technical data for reference
      return {
        ...parsedData,
        originalData: originalImpactData,
        generatedAt: new Date().toISOString(),
        source: 'gemini-ai'
      };
    } catch (error) {
      console.error('Error parsing AI response:', error);
      // Fallback to structured response even if JSON parsing fails
      return this.createFallbackResponse(aiResponse, originalImpactData);
    }
  }

  /**
   * Create fallback response if JSON parsing fails
   */
  createFallbackResponse(aiResponse, originalImpactData) {
    return {
      scientificSummary: aiResponse.substring(0, 500) + '...',
      publicImpact: aiResponse.substring(500, 1000) + '...',
      scientificContext: aiResponse.substring(1000, 1500) + '...',
      safetyResponse: aiResponse.substring(1500) || 'Safety assessment not available.',
      comparisonEvents: ['Tunguska Event (1908)', 'Chicxulub Impact (65 MYA)'],
      riskLevel: 'Moderate',
      keyFindings: [
        'Impact analysis completed',
        'Technical data processed',
        'AI analysis generated'
      ],
      originalData: originalImpactData,
      generatedAt: new Date().toISOString(),
      source: 'gemini-ai-fallback'
    };
  }

  /**
   * Generate simplified summary for quick reference
   */
  async generateQuickSummary(impactData, asteroidData, cityData) {
    try {
      const prompt = `
Based on this asteroid impact data, provide a 2-sentence summary for public consumption:

Asteroid: ${asteroidData.diameter || 0.5}km diameter, ${((asteroidData.velocity || 25000) / 1000).toFixed(1)}km/s
Target: ${cityData.name}
Energy: ${(impactData.results.energy_joules / (4.184e9) / 1e6).toFixed(1)} Megatons TNT
Crater: ${impactData.results.crater_diameter_km.toFixed(1)}km diameter
Blast: ${impactData.results.blast_radius_km.toFixed(0)}km radius

Make it clear, concise, and relatable to the general public.
      `.trim();

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 100,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const result = await response.json();
      return result.candidates[0].content.parts[0].text.trim();
    } catch (error) {
      console.error('Error generating quick summary:', error);
      return `Asteroid impact analysis completed for ${cityData.name}. Technical assessment available in detailed report.`;
    }
  }
}

// Export singleton instance
export default new GeminiService();
