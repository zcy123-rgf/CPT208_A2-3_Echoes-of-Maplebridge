export const STORY_POINT_COORDINATES = [
  { name: 'Grand Canal Turning Point', lng: 120.56574, lat: 31.31628 },
  { name: 'Sealed Bridge at Night', lng: 120.56628, lat: 31.31688 },
  { name: 'Trade Streets and Everyday Memory', lng: 120.56672, lat: 31.31746 },
  { name: 'Night Mooring at Maple Bridge', lng: 120.56708, lat: 31.31805 },
];

export const STORY_POINT_FALLBACK_DISTANCES = ['120m', '350m', '580m', '720m'];

export function haversineDistanceMeters(
  from: { lng: number; lat: number },
  to: { lng: number; lat: number }
) {
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const earthRadius = 6371000;
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(from.lat)) * Math.cos(toRadians(to.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadius * Math.asin(Math.sqrt(a));
}

export function formatDistance(distanceMeters: number) {
  if (distanceMeters >= 1000) {
    return `${(distanceMeters / 1000).toFixed(1)}km`;
  }
  return `${Math.max(10, Math.round(distanceMeters / 10) * 10)}m`;
}

export function estimateWalkingMinutes(distanceMeters: number) {
  const averageWalkingSpeedMetersPerMinute = 75;
  return Math.max(1, Math.round(distanceMeters / averageWalkingSpeedMetersPerMinute));
}

export function parseDistanceTextToMeters(distanceText: string) {
  const value = Number.parseFloat(distanceText);
  if (Number.isNaN(value)) {
    return 120;
  }
  return distanceText.endsWith('km') ? value * 1000 : value;
}
