# Gemini AI Integration Setup

This document explains how to set up and configure the Gemini AI integration for accessible impact analysis.

## Overview

The Gemini AI integration transforms technical asteroid impact data into accessible content for both scientists and the general public. It provides:

- **Public Impact Assessment**: Easy-to-understand explanations with real-world comparisons
- **Scientific Summary**: Detailed technical analysis for researchers
- **Safety & Response**: Practical information about immediate effects and safety considerations
- **Scientific Context**: Educational content about similar events and research implications

## Setup Instructions

### 1. Get a Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Configure the API Key

#### For React App (Development/Production)

Create a `.env` file in the project root:

```bash
REACT_APP_GEMINI_API_KEY=your_actual_api_key_here
```

#### For Map Page (Client-side)

Edit `public/Map/js/map.js` and update the API key in the GeminiService constructor:

```javascript
class GeminiService {
  constructor() {
    this.apiKey = 'your_actual_api_key_here'; // Replace with your actual key
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  }
  // ... rest of the class
}
```

### 3. Security Considerations

**Important**: Never commit your actual API key to version control!

- Add `.env` to your `.gitignore` file
- Use environment variables in production
- Consider using a backend proxy for API calls in production to keep the key secure

### 4. Testing the Integration

1. Start your development server: `npm start`
2. Navigate to an asteroid and trigger an impact simulation
3. Check the impact analysis panel for the new tabbed interface
4. Verify that Gemini AI content appears in the "Public" and "Scientific" tabs

## Features

### Tabbed Interface

The enhanced impact analysis now includes three tabs:

1. **Public Tab**: 
   - Risk level assessment
   - Public impact explanation
   - Safety and response information
   - Key findings
   - Similar historical events

2. **Scientific Tab**:
   - Detailed scientific summary
   - Research context and implications
   - Comparative analysis with known impacts

3. **Technical Tab**:
   - Raw technical data
   - Impact parameters
   - Detailed measurements and calculations

### AI-Generated Content

The Gemini AI analyzes the technical impact data and generates:

- **Accessible explanations** using analogies and familiar comparisons
- **Risk assessments** with appropriate severity levels
- **Historical comparisons** to help understand the scale
- **Safety implications** for practical response planning
- **Scientific context** for educational purposes

## Error Handling

The system includes comprehensive error handling:

- Falls back to original technical display if Gemini API fails
- Shows loading states during AI processing
- Displays clear error messages for configuration issues
- Gracefully handles API rate limits and timeouts

## Customization

You can customize the AI prompts by editing the `buildAnalysisPrompt` method in:

- `src/services/geminiService.js` (React component)
- `public/Map/js/map.js` (Map page)

Adjust the prompt to focus on specific aspects or change the output format as needed.

## Troubleshooting

### Common Issues

1. **"Gemini API key not configured"**
   - Ensure the API key is set correctly in the appropriate file
   - Check that the key is valid and has proper permissions

2. **"Gemini API error: 403"**
   - Verify your API key is correct
   - Check if you have enabled the Gemini API in Google Cloud Console

3. **"Invalid response from Gemini API"**
   - The API might be temporarily unavailable
   - Check your internet connection
   - Verify the API endpoint is correct

4. **Content not appearing**
   - Check browser console for JavaScript errors
   - Ensure the API key is properly configured
   - Verify network requests are not being blocked

### Debug Mode

To enable debug logging, add this to your browser console:

```javascript
localStorage.setItem('debug', 'gemini');
```

This will show detailed logs of the Gemini API interactions.

## API Limits

Be aware of Gemini API usage limits:

- Free tier: 15 requests per minute
- Paid tier: Higher limits available
- Consider implementing caching for repeated analyses

## Support

For issues with the Gemini integration:

1. Check the browser console for error messages
2. Verify your API key configuration
3. Test with a simple API call to ensure connectivity
4. Review the Gemini API documentation for any changes

The integration is designed to be robust and will fall back gracefully if the AI service is unavailable, ensuring users always receive impact analysis data.
