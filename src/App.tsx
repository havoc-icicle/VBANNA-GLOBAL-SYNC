import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { I18nProvider } from './contexts/I18nContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';
import { Home } from './pages/Home';
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { Services } from './pages/Services';
import { Orders } from './pages/Orders';
import { OrderDetails } from './pages/OrderDetails';
import { Profile } from './pages/Profile';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ServiceManagement } from './pages/admin/ServiceManagement';
import { UserManagement } from './pages/admin/UserManagement';
import { CountryManagement } from './pages/admin/CountryManagement';
import { IndustryManagement } from './pages/admin/IndustryManagement';
import { Reports } from './pages/Reports';
import { Questionnaire } from './pages/Questionnaire';
import { Documents } from './pages/Documents';
import { TradeLeads } from './pages/TradeLeads';
import { Payments } from './pages/Payments';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                }}
              />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Onboarding Route */}
                <Route 
                  path="/onboarding" 
                  element={
                    <ProtectedRoute>
                      <Onboarding />
                    </ProtectedRoute>
                  } 
                />
                
                {/* Protected Routes */}
                <Route 
                  path="/dashboard" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Dashboard />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/services" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Services />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/orders" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Orders />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/orders/:id" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <OrderDetails />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/questionnaire/:serviceId" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Questionnaire />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/documents" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Documents />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/trade-leads" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <TradeLeads />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/payments" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Payments />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/reports" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Reports />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/profile" 
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Profile />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                
                {/* Admin Routes */}
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                      <Layout>
                        <AdminDashboard />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/services" 
                  element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                      <Layout>
                        <ServiceManagement />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/users" 
                  element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                      <Layout>
                        <UserManagement />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/countries" 
                  element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                      <Layout>
                        <CountryManagement />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/admin/industries" 
                  element={
                    <ProtectedRoute allowedRoles={['Admin']}>
                      <Layout>
                        <IndustryManagement />
                      </Layout>
                    </ProtectedRoute>
                  } 
                />
              </Routes>
            </div>
          </Router>
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}

export default App;