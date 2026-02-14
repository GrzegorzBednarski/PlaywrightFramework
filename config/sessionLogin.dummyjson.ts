import type { SessionLoginConfig } from '../utils/sessionManager/loginTypes';
import { resolveCreds } from '../utils/sessionManager/envCreds';

/**
 * Session login: dummyjson
 *
 * API-only login flow:
 * - Uses env creds: <USERKEY>_USERNAME / <USERKEY>_PASSWORD
 * - Calls POST /auth/login
 * - Saves token in session meta as:
 *   - authHeader: `Bearer <token>`
 */
export const sessionLoginConfig: SessionLoginConfig = {
  // ---------------------------------------------------------------------------
  // Session save options (what will be persisted in build/sessions/*.session.json)
  // ---------------------------------------------------------------------------

  saveCookies: false,
  saveLocalStorage: false,
  saveSessionStorage: false,

  // ---------------------------------------------------------------------------
  // Login flow (creates the authenticated state)
  // ---------------------------------------------------------------------------

  async loginFlow({ userKey, saveMeta }) {
    const { username, password } = resolveCreds(userKey);
    const baseUrl = process.env.API_URL;

    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    const json = await res.json();
    const token = json.token ?? json.accessToken;

    // ---------------------------------------------------------------------------
    // Save additional session data (session meta)
    // ---------------------------------------------------------------------------

    saveMeta({
      userKey,
      authHeader: `Bearer ${token}`,
    });
  },
};

void sessionLoginConfig;
