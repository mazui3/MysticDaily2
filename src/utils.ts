/**
 * Simple hash function to generate a stable integer from a string seed.
 */
export function getDeterministicIndex(seed: string, max: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash) % max;
}

/**
 * Gets or creates a local device/visitor ID. Used as a stable fallback when IP lookup is unavailable.
 */
export function getFallbackVisitorId(): string {
  if (typeof window === "undefined") return "server_fallback";
  let id = localStorage.getItem("fortune_visitor_uuid");
  if (!id) {
    id = "client_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("fortune_visitor_uuid", id);
  }
  return id;
}

/**
 * Cleanly format any IP address for elegant display.
 * Strips technical parts if needed or masks it for privacy.
 */
export function maskIpAddress(ip: string): string {
  if (!ip) return "Unknown Channel";
  // If it's a generated ID, make it look friendly
  if (ip.startsWith("client_")) {
    return `Local ID: #${ip.substring(7, 13).toUpperCase()}`;
  }
  
  // Mask the last segment of IPv4/IPv6 for privacy and cleaner look
  if (ip.includes(".")) {
    const parts = ip.split(".");
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.***`;
    }
  } else if (ip.includes(":")) {
    const parts = ip.split(":");
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}:****:****`;
    }
  }
  return ip;
}
