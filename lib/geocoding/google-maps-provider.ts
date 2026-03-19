
import { GeocodingProvider, type GeocodingResult } from "./geocoding-provider"

export class GoogleMapsProvider extends GeocodingProvider {
  private apiKey: string

  constructor(apiKey?: string) {
    super()
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""
  }

  async geocode(address: string): Promise<GeocodingResult> {
    if (!this.apiKey) {
      console.warn("[v0] Google Maps API key not configured, using mock data")
      return this.mockGeocode(address)
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address,
      )}&key=${this.apiKey}`

      const response = await fetch(url)
      const data = await response.json()

      if (data.status !== "OK" || !data.results[0]) {
        throw new Error(`Geocoding failed: ${data.status}`)
      }

      const result = data.results[0]
      return {
        address: result.formatted_address,
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        placeId: result.place_id,
      }
    } catch (error) {
      console.error("[v0] Geocoding error:", error)
      return this.mockGeocode(address)
    }
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<GeocodingResult> {
    if (!this.apiKey) {
      return this.mockReverseGeocode(latitude, longitude)
    }

    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${this.apiKey}`

      const response = await fetch(url)
      const data = await response.json()

      if (data.status !== "OK" || !data.results[0]) {
        throw new Error(`Reverse geocoding failed: ${data.status}`)
      }

      const result = data.results[0]
      return {
        address: result.formatted_address,
        latitude,
        longitude,
        placeId: result.place_id,
      }
    } catch (error) {
      console.error("[v0] Reverse geocoding error:", error)
      return this.mockReverseGeocode(latitude, longitude)
    }
  }

  private mockGeocode(address: string): GeocodingResult {

    return {
      address,
      latitude: 40.7128 + Math.random() * 0.01,
      longitude: -74.006 + Math.random() * 0.01,
    }
  }

  private mockReverseGeocode(latitude: number, longitude: number): GeocodingResult {
    return {
      address: "Mock Address, Campus Building",
      latitude,
      longitude,
    }
  }
}
