import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Layout from './components/layout/Layout'
import AuthPage from './features/auth/AuthPage'
import UnifiedDashboard from './features/UnifiedDashboard'
import HealthDashboard from './features/health/HealthDashboard'
import FinanceDashboard from './features/finance/FinanceDashboard'
import { ProductivityDashboard } from './features/productivity/components/ProductivityDashboard'
import { Toaster } from './components/ui/toaster'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<UnifiedDashboard />} />
          <Route path="health" element={<HealthDashboard />} />
          <Route path="finance" element={<FinanceDashboard />} />
          <Route path="productivity" element={<ProductivityDashboard />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </AuthProvider>
  )
}