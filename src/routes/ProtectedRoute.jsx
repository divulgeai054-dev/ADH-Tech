import { Navigate, useLocation } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import Loader from '../components/Loader'

/**
 * ProtectedRoute
 *
 * Wraps any route that requires authentication.
 * • While auth is hydrating from localStorage → shows full-page Loader.
 * • If not authenticated → redirects to /login, preserving the intended URL.
 * • If authenticated → renders children normally.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <Loader fullPage message="Loading your session…" />
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        state={{ from: location }}   // so Login can redirect back after auth
        replace
      />
    )
  }

  return children
}
