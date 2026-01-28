import React, { useState, useEffect } from 'react';
import { MemberView } from './components/MemberView';
import { AdminView } from './components/AdminView';
import { AuthView } from './components/AuthView';
import { User } from './types';
import { getSessionUser, logoutUser, checkAdminSession } from './services/storage';

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const initApp = async () => {
      // 1. Check for Admin persistence first
      if (checkAdminSession()) {
        setIsAdmin(true);
        setInitializing(false);
        return;
      }

      // 2. Check for Member persistence
      const existingUser = await getSessionUser();
      if (existingUser) {
        setCurrentUser(existingUser);
      }
      
      setInitializing(false);
    };

    initApp();
  }, []);

  const handleLogin = (user: User | null, admin: boolean) => {
    setCurrentUser(user);
    setIsAdmin(admin);
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    setIsAdmin(false);
  };

  if (initializing) return (
    <div className="min-h-screen bg-coffee-950 flex items-center justify-center">
      <div className="animate-pulse text-coffee-200 font-bold uppercase tracking-widest text-xs">Connecting...</div>
    </div>
  );

  // 1. Admin View
  if (isAdmin) {
    return <AdminView onLogout={handleLogout} />;
  }

  // 2. Member View
  if (currentUser) {
    return <MemberView currentUser={currentUser} onLogout={handleLogout} />;
  }

  // 3. Default: Show Auth View (Login)
  return (
    <div className="min-h-screen bg-gradient-to-br from-coffee-900 to-gray-900 flex items-center justify-center p-4">
      <AuthView onLogin={handleLogin} />
    </div>
  );
};

export default App;