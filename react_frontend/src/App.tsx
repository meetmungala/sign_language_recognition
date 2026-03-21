import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth.tsx';
import Layout from './components/Layout.tsx';
import Home from './pages/Home.tsx';
import Login from './pages/Login.tsx';
import Register from './pages/Register.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Recognition from './pages/Recognition.tsx';
import Learning from './pages/Learning.tsx';
import Practice from './pages/Practice.tsx';
import Profile from './pages/Profile.tsx';
import OfflineMode from './pages/OfflineMode.tsx';
import ProtectedRoute from './components/ProtectedRoute.tsx';

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="offline" element={<OfflineMode />} />
            </Route>

            {/* Protected routes */}
            <Route path="/" element={<Layout />}>
              <Route
                path="dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="recognition"
                element={
                  <ProtectedRoute>
                    <Recognition />
                  </ProtectedRoute>
                }
              />
              <Route
                path="learning"
                element={
                  <ProtectedRoute>
                    <Learning />
                  </ProtectedRoute>
                }
              />
              <Route
                path="practice"
                element={
                  <ProtectedRoute>
                    <Practice />
                  </ProtectedRoute>
                }
              />
              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Routes>
        </div>
    </AuthProvider>
  );
}

export default App;
