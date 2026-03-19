
import type { IGeocodingProvider } from "./geocoding-provider"
import { GoogleMapsProvider } from "./google-maps-provider"
import { MockGeocodingProvider } from "./mock-provider"

export type GeocodingProviderType = "google-maps" | "mock"

export class GeocodingFactory {
  static createProvider(type?: GeocodingProviderType): IGeocodingProvider {
    const providerType = type || this.getDefaultProvider()

    switch (providerType) {
      case "google-maps":
        return new GoogleMapsProvider()
      case "mock":
        return new MockGeocodingProvider()
      default:
        return new MockGeocodingProvider()
    }
  }

  private static getDefaultProvider(): GeocodingProviderType {

    if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      return "google-maps"
    }
    return "mock"
  }
}


let geocodingProvider: IGeocodingProvider | null = null

export function getGeocodingProvider(): IGeocodingProvider {
  if (!geocodingProvider) {
    geocodingProvider = GeocodingFactory.createProvider()
  }
  return geocodingProvider
}
