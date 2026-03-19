


export interface GeocodingResult {
  address: string
  latitude: number
  longitude: number
  placeId?: string
}

export interface IGeocodingProvider {
  geocode(address: string): Promise<GeocodingResult>
  reverseGeocode(latitude: number, longitude: number): Promise<GeocodingResult>
}

export abstract class GeocodingProvider implements IGeocodingProvider {
  abstract geocode(address: string): Promise<GeocodingResult>
  abstract reverseGeocode(latitude: number, longitude: number): Promise<GeocodingResult>
}
