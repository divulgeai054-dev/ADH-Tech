import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from '../routes/ProtectedRoute'

// Pages
import Landing     from '../pages/Landing'
import Login       from '../pages/Login'
import Register    from '../pages/Register'
import Dashboard   from '../pages/Dashboard'
import Appointment from '../pages/Appointment'
import Check       from '../pages/Check'
import Report      from '../pages/Report'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ── Public ──────────────────────────────────────────── */}
        <Route path="/"         element={<Landing />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ── Protected ───────────────────────────────────────── */}
        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />

        <Route path="/appointment" element={
          <ProtectedRoute><Appointment /></ProtectedRoute>
        } />

        <Route path="/check" element={
          <ProtectedRoute><Check /></ProtectedRoute>
        } />

        <Route path="/report/:id?" element={
          <ProtectedRoute><Report /></ProtectedRoute>
        } />

        {/* ── Fallback ─────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
