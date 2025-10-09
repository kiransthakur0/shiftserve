/**
 * Geocoding service using Nominatim (OpenStreetMap) API
 * Free and doesn't require an API key
 */

export interface GeocodingResult {
  lat: number;
  lng: number;
  displayName: string;
}

export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  if (!address || address.trim().length === 0) {
    return null;
  }

  try {
    const encodedAddress = encodeURIComponent(address);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodedAddress}&limit=1`,
      {
        headers: {
          'User-Agent': 'ShiftServe/1.0' // Nominatim requires a User-Agent header
        }
      }
    );

    if (!response.ok) {
      console.error('Geocoding API error:', response.statusText);
      return null;
    }

    const data = await response.json();

    if (data && data.length > 0) {
      const result = data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        displayName: result.display_name
      };
    }

    return null;
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
}

/**
 * Debounced geocoding function to avoid hammering the API
 */
export function createDebouncedGeocoder(delay: number = 1000) {
  let timeoutId: NodeJS.Timeout | null = null;

  return (address: string, callback: (result: GeocodingResult | null) => void) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(async () => {
      const result = await geocodeAddress(address);
      callback(result);
    }, delay);
  };
}
