
declare global {
  interface Window {
    google: typeof google;
  }
}

declare namespace google {
  namespace maps {
    class Map {
      constructor(element: HTMLElement, options: MapOptions);
      fitBounds(bounds: LatLngBounds): void;
    }

    class Marker {
      constructor(options: MarkerOptions);
      setMap(map: Map | null): void;
      addListener(event: string, handler: () => void): void;
    }

    class LatLngBounds {
      constructor();
      extend(point: LatLngLiteral): void;
    }

    interface MapOptions {
      center: LatLngLiteral;
      zoom: number;
      styles?: any[];
    }

    interface MarkerOptions {
      position: LatLngLiteral;
      map: Map;
      title?: string;
    }

    interface LatLngLiteral {
      lat: number;
      lng: number;
    }
  }
}

export {};
