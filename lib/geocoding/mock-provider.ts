
import { GeocodingProvider, type GeocodingResult } from "./geocoding-provider"

export class MockGeocodingProvider extends GeocodingProvider {
  async geocode(address: string): Promise<GeocodingResult> {

    await new Promise((resolve) => setTimeout(resolve, 100))

    return {
      address,
      latitude: 40.7128 + Math.random() * 0.01,
      longitude: -74.006 + Math.random() * 0.01,
      placeId: `mock-${Date.now()}`,
    }
  }

  async reverseGeocode(latitude: number, longitude: number): Promise<GeocodingResult> {
    await new Promise((resolve) => setTimeout(resolve, 100))

    return {
      address: "Mock Campus Location, Building A",
      latitude,
      longitude,
      placeId: `mock-${Date.now()}`,
    }
  }
}
