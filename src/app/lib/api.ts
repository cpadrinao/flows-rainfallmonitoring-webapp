/**
 * F.L.O.W.S. — Frontend API Client (Step 10)
 * Fetches live data from the FastAPI backend and maps it to the ZoneData shape
 * used throughout the dashboard. Falls back gracefully if the API is unreachable.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ─── API Response Types ───────────────────────────────────────────────────────

export interface ApiZone {
  id: string;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  alert_level: 'GREEN' | 'YELLOW' | 'ORANGE' | 'RED';
  is_active: boolean;
}

export interface ApiWeatherLog {
  id?: string;
  zone_id: string;
  fetched_at: string;
  forecast_time: string;
  precipitation_mm: number | null;
  precipitation_prob: number | null;
  temperature_c: number | null;
  relative_humidity: number | null;
  weather_code: number | null;
  cloud_cover_pct: number | null;
  wind_speed_kmh: number | null;
  wind_direction_deg: number | null;
  visibility_m: number | null;
  validation_status?: string;
}

export interface ApiWeatherSummaryItem {
  zone: ApiZone;
  latest_log: ApiWeatherLog | null;
  hourly_precip: number[];
}

// ─── Dashboard ZoneData Shape ─────────────────────────────────────────────────

export interface ZoneData {
  id: string;
  name: string;
  purok: string;
  status: 'Heavy Rain' | 'Moderate Rain' | 'Light Rain' | 'Cloudy' | 'Clear';
  alertLevel: 'Red' | 'Orange' | 'Yellow' | 'Green';
  alertText: string;
  advisoryText: string;
  amount: number;
  amountTrend: string;
  duration: string;
  humidity: number;
  trend: number[];
  riskLevel: 'Critical' | 'Warning' | 'Monitor' | 'Safe';
  evacuationRecommended: boolean;
  fetchedAt?: string | null;
  forecastTime?: string | null;
  precipProb: number;
  tempC: number;
  windSpeed: number;
  windDir: number;
  cloudCover: number;
  visibility: number;
}

// ─── Mapping Helpers ──────────────────────────────────────────────────────────

function weatherCodeToStatus(code: number | null): ZoneData['status'] {
  if (code === null || code === undefined) return 'Cloudy';
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Cloudy';
  if (code <= 48) return 'Cloudy';   // fog
  if (code <= 57) return 'Light Rain'; // drizzle
  if (code === 61) return 'Light Rain';
  if (code === 63) return 'Moderate Rain';
  if (code >= 64 && code <= 67) return 'Heavy Rain';
  if (code === 80) return 'Light Rain';
  if (code === 81) return 'Moderate Rain';
  if (code >= 82) return 'Heavy Rain';
  if (code >= 95) return 'Heavy Rain';  // thunderstorm
  return 'Cloudy';
}

function mapAlertLevel(level: string): ZoneData['alertLevel'] {
  const normalized = level?.toLowerCase();
  if (normalized === 'red')    return 'Red';
  if (normalized === 'orange') return 'Orange';
  if (normalized === 'yellow') return 'Yellow';
  return 'Green';
}

function getAlertText(level: ZoneData['alertLevel']): string {
  switch (level) {
    case 'Red':    return 'Critical Flood Risk (Evacuate Now)';
    case 'Orange': return 'High Alert (Evacuation Standby)';
    case 'Yellow': return 'Monitor Closely (Prepare)';
    case 'Green':  return 'Normal (Safe Level)';
  }
}

function getAdvisoryText(level: ZoneData['alertLevel']): string {
  switch (level) {
    case 'Red':
      return 'CRITICAL: Extreme rainfall recorded. Immediate evacuation is strongly advised for residents in flood-prone areas. Proceed to Barangay Rizal Multipurpose Gym immediately.';
    case 'Orange':
      return 'Heavy rainfall detected. Evacuation standby is now active. Move valuables to higher ground, pack emergency bags, and await instructions from Barangay officials.';
    case 'Yellow':
      return 'Moderate rainfall detected. Residents are advised to monitor updates closely, charge devices, and prepare emergency kits in case conditions worsen.';
    case 'Green':
      return 'Weather conditions are currently normal. No immediate action required. Continue regular monitoring and stay updated via the F.L.O.W.S. system.';
  }
}

function getRiskLevel(level: ZoneData['alertLevel']): ZoneData['riskLevel'] {
  switch (level) {
    case 'Red':    return 'Critical';
    case 'Orange': return 'Warning';
    case 'Yellow': return 'Monitor';
    case 'Green':  return 'Safe';
  }
}

function calcDuration(hourlyPrecip: number[]): string {
  let count = 0;
  for (let i = hourlyPrecip.length - 1; i >= 0; i--) {
    if (hourlyPrecip[i] > 0) count++;
    else break;
  }
  if (count === 0) return 'No Rain';
  const h = Math.floor(count);
  return h > 0 ? `${h}h` : 'Active';
}

function calcAmountTrend(hourlyPrecip: number[]): string {
  if (hourlyPrecip.length < 2) return 'No trend data';
  const last = hourlyPrecip[hourlyPrecip.length - 1] ?? 0;
  const prev = hourlyPrecip[hourlyPrecip.length - 2] ?? 0;
  const diff = last - prev;
  const sign = diff >= 0 ? '+' : '';
  return `${sign}${diff.toFixed(1)} mm from last hour`;
}

function buildTrend(hourlyPrecip: number[]): number[] {
  // Pad to 24 entries (oldest first), then sample every 2hrs → 12 bars
  const padded = [...Array(24 - hourlyPrecip.length).fill(0), ...hourlyPrecip];
  const result: number[] = [];
  for (let i = 0; i < 24; i += 2) {
    result.push(padded[i] ?? 0);
  }
  return result.slice(0, 12);
}

function parseZoneName(fullName: string): { name: string; purok: string } {
  // e.g. "Zone 1 - Riverside" → name: "Zone 1", purok: "Riverside"
  const parts = fullName.split(' - ');
  return {
    name: parts[0]?.trim() || fullName,
    purok: parts[1]?.trim() || fullName,
  };
}

// ─── Main Mapper ──────────────────────────────────────────────────────────────

export function mapSummaryToZoneData(
  item: ApiWeatherSummaryItem
): [string, ZoneData] {
  const { zone, latest_log, hourly_precip } = item;
  const { name, purok } = parseZoneName(zone.name);
  const alertLevel = mapAlertLevel(zone.alert_level);
  const precip = latest_log?.precipitation_mm ?? 0;
  const humidity = latest_log?.relative_humidity ?? 0;
  const weatherCode = latest_log?.weather_code ?? null;

  const zoneData: ZoneData = {
    id: zone.id,
    name,
    purok,
    status: weatherCodeToStatus(weatherCode),
    alertLevel,
    alertText: getAlertText(alertLevel),
    advisoryText: getAdvisoryText(alertLevel),
    amount: Math.round(precip * 10) / 10,
    amountTrend: calcAmountTrend(hourly_precip),
    duration: calcDuration(hourly_precip),
    humidity,
    trend: buildTrend(hourly_precip),
    riskLevel: getRiskLevel(alertLevel),
    evacuationRecommended: alertLevel === 'Red',
    fetchedAt: latest_log?.fetched_at || null,
    forecastTime: latest_log?.forecast_time || null,
    precipProb: latest_log?.precipitation_prob ?? 0,
    tempC: latest_log?.temperature_c ?? 27.5,
    windSpeed: latest_log?.wind_speed_kmh ?? 0,
    windDir: latest_log?.wind_direction_deg ?? 0,
    cloudCover: latest_log?.cloud_cover_pct ?? 0,
    visibility: latest_log?.visibility_m ?? 10000,
  };

  // Use UUID as key for live data so zone selects work
  return [zone.id, zoneData];
}

// ─── Fetch Functions ──────────────────────────────────────────────────────────

export async function fetchWeatherSummary(): Promise<Record<string, ZoneData>> {
  const res = await fetch(`${API_BASE}/weather/summary`, {
    next: { revalidate: 0 },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`API error ${res.status}`);
  const data: ApiWeatherSummaryItem[] = await res.json();
  return Object.fromEntries(data.map(mapSummaryToZoneData));
}

export async function triggerPipeline(): Promise<void> {
  await fetch(`${API_BASE}/pipeline/trigger`, { method: 'POST' });
}

export interface SystemHealth {
  status: string;
  open_meteo: {
    status: 'healthy' | 'unreachable';
    latency_ms: number | null;
    endpoint: string;
  };
}

export async function fetchSystemHealth(): Promise<SystemHealth> {
  try {
    const res = await fetch(`${API_BASE}/health`, {
      next: { revalidate: 0 },
      cache: 'no-store',
    });
    if (!res.ok) {
      return {
        status: 'degraded',
        open_meteo: {
          status: 'unreachable',
          latency_ms: null,
          endpoint: 'https://api.open-meteo.com/v1/forecast'
        }
      };
    }
    return await res.json();
  } catch (err) {
    return {
      status: 'offline',
      open_meteo: {
        status: 'unreachable',
        latency_ms: null,
        endpoint: 'https://api.open-meteo.com/v1/forecast'
      }
    };
  }
}

export async function fetchWeatherLogs(limit = 20): Promise<ApiWeatherLog[]> {
  try {
    const res = await fetch(`${API_BASE}/weather/logs?limit=${limit}`, {
      next: { revalidate: 0 },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (err) {
    return [];
  }
}

// ─── Backend Zones CRUD Operations ──────────────────────────────────────────

export async function fetchZones(): Promise<ApiZone[]> {
  const res = await fetch(`${API_BASE}/zones`, {
    next: { revalidate: 0 },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`Failed to fetch zones: ${res.status}`);
  return await res.json();
}

export async function createZone(zoneData: {
  name: string;
  latitude: number;
  longitude: number;
  description?: string;
}): Promise<any> {
  const res = await fetch(`${API_BASE}/zones/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(zoneData),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to create zone: ${errText || res.statusText}`);
  }
  return await res.json();
}

export async function updateZone(
  zoneId: string,
  zoneData: {
    name?: string;
    latitude?: number;
    longitude?: number;
    description?: string;
    is_active?: boolean;
    alert_level?: string;
  }
): Promise<any> {
  const res = await fetch(`${API_BASE}/zones/${zoneId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(zoneData),
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to update zone: ${errText || res.statusText}`);
  }
  return await res.json();
}

export async function deleteZone(zoneId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/zones/${zoneId}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Failed to delete zone: ${errText || res.statusText}`);
  }
  return await res.json();
}
