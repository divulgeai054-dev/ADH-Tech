/**
 * authService.js
 *
 * All authentication-related API calls.
 * Base URL is read from the VITE_API_URL env variable.
 * Falls back to localStorage-based mock so the UI works without a backend.
 */

const BASE = import.meta.env.VITE_API_URL || ''

// ── Helper ───────────────────────────────────────────────────────────────────
async function request(path, options = {}) {
  const token = localStorage.getItem('divulgeai_token')
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${BASE}${path}`, { ...options, headers })
  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`)
  }
  return data
}

// ── Mock helpers (used when VITE_API_URL is empty) ────────────────────────────
const USERS_KEY = 'divulgeai_users'

function getStoredUsers() {
  try { return JSON.parse(localStorage.getItem(USERS_KEY)) || [] } catch { return [] }
}
function saveStoredUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users))
}
function generateToken() {
  return 'tok_' + Math.random().toString(36).slice(2) + Date.now()
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Register a new user.
 * @param {{ name, email, password, clinic }} payload
 * @returns {{ user, token }}
 */
export async function registerUser(payload) {
  if (BASE) return request('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) })

  // ── Mock ──
  const users = getStoredUsers()
  if (users.find(u => u.email === payload.email)) {
    throw new Error('An account with this email already exists.')
  }

  const user = {
    id:       'usr_' + Date.now(),
    name:     payload.name,
    email:    payload.email,
    clinic:   payload.clinic || '',
    role:     'dentist',
    joinedAt: new Date().toISOString(),
    avatar:   null,
  }

  // store password hash (plain for mock – never do this in production)
  users.push({ ...user, password: payload.password })
  saveStoredUsers(users)

  const token = generateToken()
  return { user, token }
}

/**
 * Log in an existing user.
 * @param {{ email, password }} payload
 * @returns {{ user, token }}
 */
export async function loginUser(payload) {
  if (BASE) return request('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) })

  // ── Mock ──
  const users = getStoredUsers()
  const match = users.find(u => u.email === payload.email && u.password === payload.password)
  if (!match) throw new Error('Invalid email or password.')

  const { password: _pw, ...user } = match
  const token = generateToken()
  return { user, token }
}

/**
 * Fetch the currently authenticated user.
 * @returns {{ user }}
 */
export async function getMe() {
  if (BASE) return request('/api/auth/me')

  // ── Mock ──
  const raw = localStorage.getItem('divulgeai_user')
  if (!raw) throw new Error('Not authenticated')
  return { user: JSON.parse(raw) }
}

/**
 * Log out (server-side token invalidation when backend exists).
 */
export async function logoutUser() {
  if (BASE) {
    try { await request('/api/auth/logout', { method: 'POST' }) } catch { /* ignore */ }
  }
  // client-side cleanup is handled by AuthContext
}

/**
 * Request a password-reset email.
 * @param {{ email }} payload
 */
export async function forgotPassword(payload) {
  if (BASE) return request('/api/auth/forgot-password', { method: 'POST', body: JSON.stringify(payload) })
  // Mock – just pretend it worked
  return { message: 'Password reset link sent to your email.' }
}
