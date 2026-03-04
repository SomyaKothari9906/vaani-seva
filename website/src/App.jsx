import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Home from './pages/Home'
import TryPage from './pages/TryPage'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import Pricing from './pages/Pricing'
import VaaniWidget from './components/VaaniAgent/VaaniWidget'
import { AuthProvider } from './context/AuthContext'

const API_BASE = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE || 'http://localhost:8000'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-white text-content-primary font-sans">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/try" element={<TryPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/pricing" element={<Pricing />} />
            </Routes>
          </main>

          {/* Floating AI Agent — visible on every page */}
          <VaaniWidget apiBaseUrl={API_BASE} />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
