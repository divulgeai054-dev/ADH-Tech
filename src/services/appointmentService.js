/**
 * appointmentService.js
 *
 * All appointment-related API calls.
 * Uses real endpoints when VITE_API_URL is set, otherwise mocks with localStorage.
 */

const BASE = import.meta.env.VITE_API_URL || ''
const APPT_KEY = 'divulgeai_appointments'

// ── Helper ───────────────────────────────────────────────────────────────────
async function request(path, options = {}) {
  const token = localStorage.getItem('divulgeai_token')
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || `Error ${res.status}`)
  return data
}

// ── Mock helpers ─────────────────────────────────────────────────────────────
function getStored() { try { return JSON.parse(localStorage.getItem(APPT_KEY)) || [] } catch { return [] } }
function saveStored(list) { localStorage.setItem(APPT_KEY, JSON.stringify(list)) }

// ── Public API ────────────────────────────────────────────────────────────────

/** Get all appointments for the current user. */
export async function getAppointments() {
  if (BASE) return request('/api/appointments')
  const user = JSON.parse(localStorage.getItem('divulgeai_user') || '{}')
  return { appointments: getStored().filter(a => a.userId === user.id) }
}

/** Book a new appointment. */
export async function bookAppointment(payload) {
  if (BASE) return request('/api/appointments', { method: 'POST', body: JSON.stringify(payload) })

  const user  = JSON.parse(localStorage.getItem('divulgeai_user') || '{}')
  const list  = getStored()
  const appt  = {
    id:        'appt_' + Date.now(),
    userId:    user.id,
    ...payload,
    status:    'confirmed',
    createdAt: new Date().toISOString(),
    fee:       500,
  }
  list.push(appt)
  saveStored(list)
  return { appointment: appt }
}

/** Cancel an appointment by id. */
export async function cancelAppointment(id) {
  if (BASE) return request(`/api/appointments/${id}`, { method: 'DELETE' })
  const list    = getStored()
  const updated = list.map(a => a.id === id ? { ...a, status: 'cancelled' } : a)
  saveStored(updated)
  return { message: 'Appointment cancelled.' }
}

/** Reschedule an appointment. */
export async function rescheduleAppointment(id, payload) {
  if (BASE) return request(`/api/appointments/${id}`, { method: 'PATCH', body: JSON.stringify(payload) })
  const list    = getStored()
  const updated = list.map(a => a.id === id ? { ...a, ...payload } : a)
  saveStored(updated)
  return { appointment: updated.find(a => a.id === id) }
}

/** Get available time slots for a doctor on a given date. */
export async function getAvailableSlots(doctorId, date) {
  if (BASE) return request(`/api/appointments/slots?doctorId=${doctorId}&date=${date}`)
  // Mock: some slots are always booked
  const all    = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00']
  const booked = ['09:00', '10:30', '15:30']
  return {
    slots: all.map(t => ({ time: t, available: !booked.includes(t) })),
  }
}
