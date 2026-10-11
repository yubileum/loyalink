import React, { useState, useEffect } from 'react';
import { MemberView } from './components/MemberView';
import { AdminView } from './components/AdminView';
import { AuthView } from './components/AuthView';
import { AdminLogin } from './components/AdminLogin';
import { LandingPage } from './components/LandingPage';
import { User } from './types';
import { getSessionUser, logoutUser, checkAdminSession } from './services/storage';
import { initializeBranding } from './services/branding';
import { fetchStampConfig } from './services/stampConfig';

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    initializeBranding();

    const initApp = async () => {
      fetchStampConfig().catch(err => {
        console.warn('Failed to preload stamp config:', err);
      });

      if (window.location.hash === '#admin') {
        setShowAdminLogin(true);
        setShowLanding(false);
        setInitializing(false);
        return;
      }

      if (checkAdminSession()) {
        setIsAdmin(true);
        setShowLanding(false);
        setInitializing(false);
        return;
      }

      const existingUser = await getSessionUser();
      if (existingUser) {
        setCurrentUser(existingUser);
        setShowLanding(false);
      }

      setInitializing(false);
    };

    initApp();

    const handleHashChange = () => {
      if (window.location.hash === '#admin') {
        setShowAdminLogin(true);
        setShowLanding(false);
      } else if (!currentUser && !isAdmin) {
        setShowAdminLogin(false);
        setShowLanding(true);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentUser, isAdmin]);

  const handleLogin = (user: User | null, admin: boolean) => {
    setCurrentUser(user);
    setIsAdmin(admin);
    setShowLanding(false);
  };

  const handleMemberLogin = () => {
    setShowLanding(false);
    setShowAdminLogin(false);
    window.history.replaceState(null, '', window.location.pathname);
  };

  const handleBusinessLogin = () => {
    window.location.hash = 'admin';
  };

  const handleAdminLogin = () => {
    setIsAdmin(true);
    setShowAdminLogin(false);
    setShowLanding(false);
    window.location.hash = '';
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setIsAdmin(false);
    setShowAdminLogin(false);
    setShowLanding(true);
    window.history.replaceState(null, '', window.location.pathname);
  };

  if (initializing) return (
    <div className="min-h-screen bg-[#f5fbf7] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-600 text-xl font-black text-white shadow-xl shadow-emerald-600/20 animate-pulse">L</div>
        <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Loading Loyalink</div>
      </div>
    </div>
  );

  if (showAdminLogin && !isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-navy-950 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute top-20 left-20 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <AdminLogin onLogin={handleAdminLogin} />
      </div>
    );
  }

  if (isAdmin) return <AdminView onLogout={handleLogout} />;
  if (currentUser) return <MemberView currentUser={currentUser} onLogout={handleLogout} />;
  if (showLanding) return <LandingPage onMemberLogin={handleMemberLogin} onBusinessLogin={handleBusinessLogin} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-navy-600 via-navy-700 to-navy-950 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-20 left-20 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <AuthView onLogin={handleLogin} />
    </div>
  );
};

export default App;
