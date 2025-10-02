const IMPACT_API_URL = process.env.REACT_APP_IMPACT_API_URL || 'https://nasaproject-production.up.railway.app/impact'

export const calculateImpact = async (impactData) => {
  try {
    const response = await fetch(IMPACT_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(impactData)
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error('Error calculating impact:', error)
    throw error
  }
}

export const formatImpactAnalysis = (impactResult) => {
  if (!impactResult) return null

  const { results, volcanic_impact, location, geojson } = impactResult

  // Determine impact severity based on energy and crater size
  const energyJoules = results.energy_joules
  const craterDiameterKm = results.crater_diameter_km
  const blastRadiusKm = results.blast_radius_km
  const earthquakeMagnitude = results.earthquake_magnitude

  let severity = 'Low'
  let severityColor = '#00ff88'
  let description = 'Minor local impact'

  if (energyJoules > 1e20) {
    severity = 'Extreme'
    severityColor = '#ff0000'
    description = 'Global catastrophic event'
  } else if (energyJoules > 1e19) {
    severity = 'High'
    severityColor = '#ff8800'
    description = 'Regional devastation'
  } else if (energyJoules > 1e18) {
    severity = 'Moderate'
    severityColor = '#ffaa00'
    description = 'Significant local damage'
  }

  // Format energy in more readable units
  const energyTNT = energyJoules / (4.184e9) // Convert to TNT equivalent
  let energyDisplay = ''
  if (energyTNT >= 1e6) {
    energyDisplay = `${(energyTNT / 1e6).toFixed(1)} Megatons TNT`
  } else if (energyTNT >= 1e3) {
    energyDisplay = `${(energyTNT / 1e3).toFixed(1)} Kilotons TNT`
  } else {
    energyDisplay = `${energyTNT.toFixed(1)} Tons TNT`
  }

  return {
    severity: {
      level: severity,
      color: severityColor,
      description: description
    },
    energy: {
      joules: energyJoules,
      tntEquivalent: energyTNT,
      display: energyDisplay
    },
    crater: {
      diameterKm: craterDiameterKm,
      diameterM: results.crater_diameter_m
    },
    blast: {
      radiusKm: blastRadiusKm
    },
    earthquake: {
      magnitude: earthquakeMagnitude
    },
    volcanic: {
      isAffected: volcanic_impact.is_affected,
      volcanoName: volcanic_impact.volcano_name,
      impactLevel: volcanic_impact.impact_level
    },
    location: {
      isWater: location.is_water,
      elevation: location.elevation_m,
      waterSource: location.is_water_source
    },
    geojson: geojson,
    summary: {
      craterSize: craterDiameterKm > 1 ? `${craterDiameterKm.toFixed(1)} km crater` : `${results.crater_diameter_m.toFixed(0)} m crater`,
      blastZone: `${blastRadiusKm.toFixed(0)} km blast radius`,
      earthquake: `Magnitude ${earthquakeMagnitude.toFixed(1)} earthquake`,
      volcanic: volcanic_impact.is_affected ? `Volcanic activity triggered at ${volcanic_impact.volcano_name}` : 'No volcanic activity triggered'
    }
  }
}


