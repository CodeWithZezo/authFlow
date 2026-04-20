// ==================== src/lib/config.ts ====================
// Single source of truth for runtime configuration.
// All API URLs in the app must be built from these constants —
// never hardcode "localhost" or a domain anywhere else.
//
// How it works:
//   npm run dev   → Vite loads .env.development  → VITE_API_BASE_URL=""
//                   Vite proxy forwards /api/** → http://localhost:5000
//   npm run build → Vite loads .env.production   → VITE_API_BASE_URL="https://authflow-api.codewithzezo.site"
//                   fetch() calls go directly to the production server

export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? "";

// Convenience builders — keep URL construction consistent everywhere
export const apiUrl = (path: string): string =>
  `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
