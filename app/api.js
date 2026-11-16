// make.fun's public API: read-only GET requests, open to any origin (CORS).
// The full API is described at https://make.fun/api/openapi.json.
// Answers carry ETags bound to the minute: a cached answer younger than a
// minute is served from memory with no request at all, an older one is
// revalidated with If-None-Match and costs a 304 with no body.

const API = 'https://make.fun/api';

/** path -> { etag, body, at }. */
const cache = new Map();

/** Requests this visit: sent, served from memory, answered 304. Shown in the footer. */
export const netstat = { sent: 0, cached: 0, revalidated: 0 };

async function get(path) {
  const hit = cache.get(path);
  if (hit && Date.now() - hit.at < 60000) {
    netstat.cached += 1;
    return hit.body;
  }
  const headers = {};
  if (hit && hit.etag) headers['If-None-Match'] = hit.etag;
  const res = await fetch(API + path, { headers });
  netstat.sent += 1;
  if (res.status === 304 && hit) {
    netstat.revalidated += 1;
    hit.at = Date.now();
    return hit.body;
  }
  if (!res.ok) {
    const error = new Error(`make.fun answered ${res.status} for ${path}`);
    error.status = res.status;
    throw error;
  }
  const body = await res.json();
  cache.set(path, { etag: res.headers.get('etag'), body, at: Date.now() });
  return body;
}

/** The board: open bounties (activity=times keeps the payload small). */
export const getBounties = () => get('/competitions?status=open&activity=times');

/** One bounty, by its slug. */
export const getBounty = (slug) => get(`/competitions/${encodeURIComponent(slug)}`);

/** A bounty's leaderboard: ranked entries with their judge win rates. */
export const getLeaderboard = (slug) => get(`/competitions/${encodeURIComponent(slug)}/leaderboard`);

/** An account's public profile, by its handle. */
export const getProfile = (handle) => get(`/profiles/${encodeURIComponent(handle)}`);
