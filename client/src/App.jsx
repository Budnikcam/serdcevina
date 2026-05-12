import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import SplashScreen from './components/common/SplashScreen';
import PageTransition from './components/common/PageTransition';
import AIAssistant from './components/common/AIAssistant';
import RegisterForm from './components/auth/RegisterForm';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Matches from './pages/Matches';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Favorites from './pages/Favorites';
import Notifications from './pages/Notifications';
import DatingCoach from './pages/DatingCoach';
import Leaderboard from './pages/Leaderboard';

function AnimatedRoutes() {
  const location = useLocation();
  const isAuthPage = ['/login', '/register', '/'].includes(location.pathname);
  
  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><HomePage /></PageTransition>} />
          <Route path="/register" element={<PageTransition><RegisterForm /></PageTransition>} />
          <Route path="/login" element={<PageTransition><Login /></PageTransition>} />
          
          <Route path="/dashboard" element={<PageTransition><ProtectedRoute><Dashboard /></ProtectedRoute></PageTransition>} />
          <Route path="/matches" element={<PageTransition><ProtectedRoute><Matches /></ProtectedRoute></PageTransition>} />
          <Route path="/chat/:matchId?" element={<PageTransition><ProtectedRoute><Chat /></ProtectedRoute></PageTransition>} />
          <Route path="/profile" element={<PageTransition><ProtectedRoute><Profile /></ProtectedRoute></PageTransition>} />
          <Route path="/profile/:userId" element={<PageTransition><ProtectedRoute><Profile /></ProtectedRoute></PageTransition>} />
          <Route path="/favorites" element={<PageTransition><ProtectedRoute><Favorites /></ProtectedRoute></PageTransition>} />
          <Route path="/notifications" element={<PageTransition><ProtectedRoute><Notifications /></ProtectedRoute></PageTransition>} />
          <Route path="/settings" element={<PageTransition><ProtectedRoute><Settings /></ProtectedRoute></PageTransition>} />
          <Route path="/coach" element={<PageTransition><ProtectedRoute><DatingCoach /></ProtectedRoute></PageTransition>} />
          <Route path="/leaderboard" element={<PageTransition><ProtectedRoute><Leaderboard /></ProtectedRoute></PageTransition>} />
        </Routes>
      </AnimatePresence>
      
      {!isAuthPage && <AIAssistant />}
    </>
  );
}

function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-purple-700 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/5"
            style={{
              width: Math.random() * 300 + 50,
              height: Math.random() * 300 + 50,
              left: Math.random() * 100 + '%',
              top: Math.random() * 100 + '%',
              animation: `float ${Math.random() * 10 + 10}s linear infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}
      </div>

      <div className="text-center text-white p-8 relative z-10">
        <div className="text-8xl mb-6 animate-bounce">💝</div>
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-white to-pink-200 bg-clip-text text-transparent">
          Сердцевина
        </h1>
        <p className="text-xl mb-2 text-white/80">Найди свою половину</p>
        <p className="text-sm mb-8 text-white/60">Знакомства нового поколения</p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="/register"
            className="bg-white text-purple-600 px-10 py-4 rounded-full text-lg font-bold shadow-2xl hover:scale-105 transition-all duration-300"
          >
            ✨ Создать анкету
          </a>
          <a
            href="/login"
            className="bg-white/15 backdrop-blur-sm text-white border-2 border-white/40 px-10 py-4 rounded-full text-lg font-bold hover:bg-white/25 transition-all duration-300"
          >
            🔑 Войти
          </a>
        </div>

        <div className="mt-12 flex justify-center gap-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-white/40"
              style={{ animation: `pulse 1.5s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          {showSplash && <SplashScreen />}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '16px',
                padding: '16px',
                fontSize: '14px',
              },
            }}
          />
          <div className="transition-colors duration-300">
            <AnimatedRoutes />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
