"use client";

import { useEffect, useRef, useState } from "react";
import { groupTitle, type SessionSearchResult } from "@/lib/types";
import { Card } from "@/components/ui/card";

declare global {
  interface Window {
    googleMapsLoaded?: boolean;
    googleMapsCallbacks?: (() => void)[];
  }
}

interface SessionMapProps {
  sessions: SessionSearchResult[];
  onSessionClick?: (sessionId: string) => void;
  focusedSessionId?: string | null;
  /** When true, map expands in a flex parent (split discover layout) */
  fillHeight?: boolean;
  className?: string;
  mapClassName?: string;
}

const MAP_STYLES = [
  {
    elementType: "geometry",
    stylers: [{ color: "#f5f5f5" }],
  },
  {
    elementType: "labels.icon",
    stylers: [{ visibility: "off" }],
  },
  {
    elementType: "labels.text.fill",
    stylers: [{ color: "#616161" }],
  },
  {
    elementType: "labels.text.stroke",
    stylers: [{ color: "#f5f5f5" }],
  },
  {
    featureType: "administrative.land_parcel",
    elementType: "labels.text.fill",
    stylers: [{ color: "#bdbdbd" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#eeeeee" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#e5e5e5" }],
  },
  {
    featureType: "poi.park",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#ffffff" }],
  },
  {
    featureType: "road.arterial",
    elementType: "labels.text.fill",
    stylers: [{ color: "#757575" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#dadada" }],
  },
  {
    featureType: "road.highway",
    elementType: "labels.text.fill",
    stylers: [{ color: "#616161" }],
  },
  {
    featureType: "road.local",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
  {
    featureType: "transit.line",
    elementType: "geometry",
    stylers: [{ color: "#e5e5e5" }],
  },
  {
    featureType: "transit.station",
    elementType: "geometry",
    stylers: [{ color: "#eeeeee" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#c9c9c9" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9e9e9e" }],
  },
];

/** Same-address meetups stack on the map; nudge markers in a ring so each stays clickable. */
function markerDisplayLatLng(
  sessions: SessionSearchResult[]
): Map<string, { lat: number; lng: number }> {
  const byKey = new Map<string, SessionSearchResult[]>();
  for (const s of sessions) {
    const key = `${s.location.latitude.toFixed(6)},${s.location.longitude.toFixed(6)}`;
    const group = byKey.get(key) ?? [];
    group.push(s);
    byKey.set(key, group);
  }
  const out = new Map<string, { lat: number; lng: number }>();
  const radius = 0.00025;
  for (const group of byKey.values()) {
    if (group.length === 1) {
      const s = group[0];
      out.set(s.id, { lat: s.location.latitude, lng: s.location.longitude });
      continue;
    }
    group.forEach((s, i) => {
      const angle = (2 * Math.PI * i) / group.length;
      out.set(s.id, {
        lat: s.location.latitude + Math.cos(angle) * radius,
        lng: s.location.longitude + Math.sin(angle) * radius,
      });
    });
  }
  return out;
}

export function SessionMap({
  sessions,
  onSessionClick,
  focusedSessionId,
  fillHeight = false,
  className,
  mapClassName,
}: SessionMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    }
  }, []);

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      setMapError("Google Maps API key not configured");
      return;
    }

    let cancelled = false;

    const tryInit = () => {
      if (cancelled || !mapRef.current || !window.google?.maps) return;
      initializeMap();
      // Flex/split layouts often give the map div height after first paint; force resize.
      const map = (mapRef.current as unknown as { mapInstance?: google.maps.Map })
        .mapInstance;
      if (map) {
        requestAnimationFrame(() => {
          window.google?.maps.event.trigger(map, "resize");
        });
      }
    };

    const scheduleInit = () => {
      requestAnimationFrame(() => tryInit());
    };

    if (window.google?.maps) {
      scheduleInit();
      return () => {
        cancelled = true;
      };
    }

    if (window.googleMapsLoaded === undefined) {
      window.googleMapsLoaded = false;
      window.googleMapsCallbacks = [];
      const script = document.createElement("script");
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        window.googleMapsLoaded = true;
        window.googleMapsCallbacks?.forEach((cb) => cb());
        window.googleMapsCallbacks = [];
      };
      script.onerror = () => {
        if (!cancelled) setMapError("Failed to load Google Maps");
      };
      document.head.appendChild(script);
    }

    const onReady = () => {
      if (!cancelled) scheduleInit();
    };

    if (window.googleMapsCallbacks) {
      window.googleMapsCallbacks.push(onReady);
    } else if (window.googleMapsLoaded) {
      onReady();
    }

    return () => {
      cancelled = true;
      if (window.googleMapsCallbacks?.length) {
        const idx = window.googleMapsCallbacks.indexOf(onReady);
        if (idx >= 0) window.googleMapsCallbacks.splice(idx, 1);
      }
    };
  }, []);

  useEffect(() => {
    if (window.google && mapRef.current) {
      updateMarkers();
    }
  }, [sessions, userLocation]);

  useEffect(() => {
    if (!focusedSessionId || !mapRef.current || !window.google) return;

    const session = sessions.find((s) => s.id === focusedSessionId);
    if (session) {
      const map = (mapRef.current as any).mapInstance;
      if (map) {
        const position = {
          lat: session.location.latitude,
          lng: session.location.longitude,
        };
        map.panTo(position);
        map.setZoom(16);

        // Find and trigger click on the marker to open info window
        const markers = (mapRef.current as any).markers;
        if (markers) {
          // We need to find the marker corresponding to this session
          // Since we recreate markers on update, we can rely on index if consistent,
          // but better to store session ID on marker.
          // For now, let's just pan and zoom.
          // Ideally, we would also open the info window.
        }
      }
    }
  }, [focusedSessionId, sessions]);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    const el = mapRef.current as unknown as { mapInstance?: google.maps.Map };
    if (el.mapInstance) {
      updateMarkers();
      return;
    }

    const map = new window.google.maps.Map(mapRef.current, {
      center: userLocation || { lat: 43.2609, lng: -79.9192 },
      zoom: 15,
      styles: MAP_STYLES,
      disableDefaultUI: false,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
    });

    el.mapInstance = map;
    updateMarkers();
  };

  const updateMarkers = () => {
    if (!mapRef.current || !window.google) return;

    const map = (mapRef.current as any).mapInstance;
    if (!map) return;

    if ((mapRef.current as any).markers) {
      (mapRef.current as any).markers.forEach((marker: any) =>
        marker.setMap(null)
      );
    }

    const markers: google.maps.Marker[] = [];
    const infoWindow = new window.google.maps.InfoWindow({
      disableAutoPan: true,
    });
    const displayLatLng = markerDisplayLatLng(sessions);

    if (userLocation) {
      const userMarker = new window.google.maps.Marker({
        position: userLocation,
        map,
        title: "You are here",
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#3b82f6", // Blue-500
          fillOpacity: 1,
          strokeColor: "white",
          strokeWeight: 2,
        },
        zIndex: 999,
      });

      new window.google.maps.Marker({
        position: userLocation,
        map,
        clickable: false,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 20,
          fillColor: "#3b82f6",
          fillOpacity: 0.2,
          strokeWeight: 0,
        },
        zIndex: 998,
      });

      markers.push(userMarker);
    }

    const sessionMarkers = sessions.map((session) => {
      const pos =
        displayLatLng.get(session.id) ?? {
          lat: session.location.latitude,
          lng: session.location.longitude,
        };
      const marker = new window.google.maps.Marker({
        position: pos,
        map,
        title: groupTitle(session),
        animation: window.google.maps.Animation.DROP,
        icon: {
          path: "M12 0C7.58 0 4 3.58 4 8c0 5.25 8 13 8 13s8-7.75 8-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z",
          fillColor: "#ef4444", // Red-500
          fillOpacity: 1,
          strokeWeight: 1.5,
          strokeColor: "#ffffff",
          scale: 1.8,
          anchor: new window.google.maps.Point(12, 21),
        },
      });

      const contentString = `
        <div style="padding: 12px; min-width: 220px; font-family: inherit;">
          <h3 style="margin: 0 0 8px 0; color: #111827; font-weight: 600; font-size: 16px; line-height: 1.2;">${groupTitle(session)}</h3>
          <div style="display: flex; align-items: center; gap: 6px; color: #4b5563; font-size: 13px; margin-bottom: 4px;">
            <span>📍</span> <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px;">${session.location.address}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 6px; color: #4b5563; font-size: 13px; margin-bottom: 8px;">
            <span>🕒</span> <span>${new Date(session.date).toLocaleDateString()} ${session.startTime}</span>
          </div>
          <div style="display: flex; flex-wrap: wrap; gap: 4px;">
            ${session.tags.map(tag => `<span style="background: #f3f4f6; color: #374151; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: 500;">#${tag}</span>`).join('')}
          </div>
        </div>
      `;

      marker.addListener("mouseover", () => {
        infoWindow.setContent(contentString);
        infoWindow.open(map, marker);
      });

      marker.addListener("mouseout", () => {
        infoWindow.close();
      });

      marker.addListener("click", () => {
        onSessionClick?.(session.id);
      });

      return marker;
    });

    markers.push(...sessionMarkers);
    (mapRef.current as any).markers = markers;

    if (sessions.length > 0 && !focusedSessionId) {
      const bounds = new window.google.maps.LatLngBounds();
      if (userLocation) {
        bounds.extend(userLocation);
      }
      sessions.forEach((session) => {
        bounds.extend({
          lat: session.location.latitude,
          lng: session.location.longitude,
        });
      });
      map.fitBounds(bounds);

      const listener = window.google.maps.event.addListener(map, "idle", () => {
        if (map.getZoom()! > 16) map.setZoom(16);
        window.google.maps.event.removeListener(listener);
      });
    } else if (userLocation && !focusedSessionId) {
      map.setCenter(userLocation);
      map.setZoom(15);
    }
  };

  if (mapError) {
    return (
      <Card
        className={`flex items-center justify-center bg-muted/50 ${
          fillHeight ? "min-h-[280px] flex-1 h-full" : "h-[400px]"
        } ${className ?? ""}`}
      >
        <div className="text-center p-6">
          <p className="text-muted-foreground mb-2 font-medium">{mapError}</p>
          <p className="text-sm text-muted-foreground">
            Please check your API key configuration
          </p>
        </div>
      </Card>
    );
  }

  const cardStyles = fillHeight
    ? "h-full min-h-0 flex flex-col overflow-hidden rounded-2xl border border-border/60 bg-card shadow-2xl ring-1 ring-black/5 dark:ring-white/10"
    : "overflow-hidden border-primary/20 shadow-lg rounded-xl";

  const mapStyles = fillHeight
    ? "w-full flex-1 min-h-[max(280px,min(40dvh,480px))] bg-muted/20"
    : "w-full h-[500px] bg-muted/20";

  return (
    <Card className={`${cardStyles} ${className ?? ""}`}>
      <div
        ref={mapRef}
        className={`${mapStyles} ${mapClassName ?? ""}`}
      />
    </Card>
  );
}
