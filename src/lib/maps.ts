export type RouteResult = {
  distanceKm: number;
  durationMin: number;
};

export async function calculateRoute(
  origin: string,
  destination: string
): Promise<RouteResult | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;

  try {
    const params = new URLSearchParams({
      origins: origin,
      destinations: destination,
      key: apiKey,
      language: "ru",
      units: "metric",
    });

    const res = await fetch(
      `https://maps.googleapis.com/maps/api/distancematrix/json?${params}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) return null;

    const data = await res.json();
    const element = data.rows?.[0]?.elements?.[0];

    if (!element || element.status !== "OK") return null;

    return {
      distanceKm: Math.round((element.distance.value / 1000) * 10) / 10,
      durationMin: Math.ceil(element.duration.value / 60),
    };
  } catch {
    return null;
  }
}

export async function geocodeAddress(
  address: string
): Promise<{ lat: number; lng: number } | null> {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) return null;

  try {
    const params = new URLSearchParams({
      address,
      key: apiKey,
      language: "ru",
    });

    const res = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?${params}`
    );

    if (!res.ok) return null;

    const data = await res.json();
    const location = data.results?.[0]?.geometry?.location;

    if (!location) return null;

    return { lat: location.lat, lng: location.lng };
  } catch {
    return null;
  }
}
