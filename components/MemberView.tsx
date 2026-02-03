import React, { useEffect, useState, useRef } from 'react';
import QRCode from 'react-qr-code';
import { User } from '../types';
import { getSessionUser, subscribeToGlobalUpdates } from '../services/storage';
import { initializeHost } from '../services/connection';
import { StampGrid } from './StampGrid';
import { Sparkles, History, LogOut, RefreshCw, Wifi, WifiOff, Scan, Gift, TrendingUp, Award, Zap } from 'lucide-react';
import { getRewardInsight } from '../services/geminiService';
import { getBrandConfig } from '../services/branding';

interface MemberViewProps {
  currentUser: User;
  onLogout: () => void;
}

export const MemberView: React.FC<MemberViewProps> = ({ currentUser, onLogout }) => {
  const [user, setUser] = useState<User>(currentUser);
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState<boolean>(false);
  const [peerId, setPeerId] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [scanNotification, setScanNotification] = useState<boolean>(false);
  const [showQR, setShowQR] = useState<boolean>(false);
  const peerRef = useRef<any>(null);
  const brandConfig = getBrandConfig();

  const latestUserRef = useRef<User>(user);
  useEffect(() => { latestUserRef.current = user; }, [user]);

  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    const fetchLatest = async () => {
      const updated = await getSessionUser();
      if (updated) {
        if (updated.stamps !== latestUserRef.current.stamps) {
          setUser(updated);
        }
      }
    };

    const interval = setInterval(fetchLatest, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToGlobalUpdates(async () => {
      const updated = await getSessionUser();
      if (updated) setUser(updated);
    });

    const initP2P = async () => {
      const { peer, peerId: id } = await initializeHost(
        user,
        async (cmd, payload) => {
          if (cmd === 'ADD_STAMP') {
            const count = payload?.count || 1;

            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("Stamp Added!", {
                body: `You received ${count} new stamp${count > 1 ? 's' : ''}!`,
                icon: '/favicon.ico'
              });
            }
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);

            setUser(prev => {
              const newStamps = Math.min(prev.stamps + count, prev.maxStamps);
              const newHistory = [...prev.history, {
                id: `temp-${Date.now()}`,
                timestamp: Date.now(),
                type: 'add' as const,
                amount: count
              }];
              return { ...prev, stamps: newStamps, history: newHistory };
            });

            setTimeout(async () => {
              const updated = await getSessionUser();
              if (updated) setUser(updated);
            }, 1000);

            return true;
          }

          if (cmd === 'SCAN_ALERT') {
            setScanNotification(true);
            setTimeout(() => setScanNotification(false), 3000);

            if (navigator.vibrate) navigator.vibrate(100);
            return true;
          }

          return false;
        },
        () => latestUserRef.current
      );

      peerRef.current = peer;
      if (id) {
        setPeerId(id);
        setIsConnected(true);
      }
    };

    initP2P();
    return () => {
      unsubscribe();
      if (peerRef.current) peerRef.current.destroy();
    };
  }, []);

  const handleAskAi = async () => {
    setLoadingAi(true);
    const text = await getRewardInsight(user);
    setAiInsight(text);
    setLoadingAi(false);
  };

  const qrPayload = {
    id: user.id,
    pid: peerId || '',
    n: user.name,
    s: user.stamps,
    m: user.maxStamps
  };
  const qrData = JSON.stringify(qrPayload);

  const progress = (user.stamps / user.maxStamps) * 100;
  const stampsRemaining = user.maxStamps - user.stamps;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex flex-col relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-brand-500/5 to-brand-600/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-brand-400/5 to-brand-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 shadow-sm">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {brandConfig.logoUrl ? (
              <img src={brandConfig.logoUrl} alt={brandConfig.name} className="h-10 object-contain" />
            ) : (
              <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-brand-500 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30">
                <span className="text-white font-black text-lg">{brandConfig.name.charAt(0)}</span>
              </div>
            )}
            <div>
              <h1 className="font-black text-xl tracking-tight text-gray-900">{brandConfig.name}</h1>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{brandConfig.tagline}</p>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2 text-sm font-bold transition-all"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-2xl w-full mx-auto p-6 flex flex-col gap-6 pb-12">

        {/* Scan Notification */}
        {scanNotification && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-gradient-to-r from-brand-600 to-brand-500 text-white px-6 py-4 rounded-2xl shadow-2xl shadow-brand-500/50 flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
            <Scan size={20} className="animate-pulse" />
            <span className="font-bold">Admin is scanning your code...</span>
          </div>
        )}

        {/* Hero Card - User Info & Progress */}
        <div className="bg-gradient-to-br from-brand-600 via-brand-500 to-brand-700 rounded-3xl shadow-2xl shadow-brand-500/30 overflow-hidden relative">
          {/* Animated background pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMTZjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAgMjRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6TTEyIDE2YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wIDI0YzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00eiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>

          <div className="relative p-8">
            {/* Connection Status Badge */}
            <div className="absolute top-6 right-6">
              {isConnected ? (
                <div className="flex items-center gap-2 text-xs font-bold text-white bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/30 shadow-lg">
                  <Wifi size={14} className="animate-pulse" /> Live
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs font-bold text-white/80 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                  <WifiOff size={14} /> Syncing
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white font-black text-3xl border-2 border-white/30 shadow-xl">
                {user.name.charAt(0)}
              </div>
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight drop-shadow-lg">{user.name}</h2>
                <p className="text-white/80 font-bold text-sm">Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Progress Section */}
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white/80 text-sm font-bold mb-1">Your Progress</p>
                  <p className="text-4xl font-black text-white">{user.stamps}<span className="text-2xl text-white/60">/{user.maxStamps}</span></p>
                </div>
                <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center border-2 border-white/30">
                  <Award size={40} className="text-white drop-shadow-lg" />
                </div>
              </div>

              {/* Progress Bar */}
              <div className="relative h-4 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-white to-white/90 rounded-full transition-all duration-1000 ease-out shadow-lg"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/40 to-white/0 animate-shimmer"></div>
                </div>
              </div>

              {stampsRemaining > 0 ? (
                <p className="text-white/90 text-sm font-bold mt-3 flex items-center gap-2">
                  <TrendingUp size={16} />
                  {stampsRemaining} more stamp{stampsRemaining !== 1 ? 's' : ''} to your reward!
                </p>
              ) : (
                <p className="text-white text-sm font-bold mt-3 flex items-center gap-2">
                  <Gift size={16} className="animate-bounce" />
                  Reward ready! Show this to redeem.
                </p>
              )}
            </div>

            {/* QR Code Toggle Button */}
            <button
              onClick={() => setShowQR(!showQR)}
              className="w-full mt-4 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-black py-4 rounded-xl border-2 border-white/30 transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
            >
              <Scan size={20} />
              {showQR ? 'Hide QR Code' : 'Show QR Code to Scan'}
            </button>
          </div>
        </div>

        {/* QR Code Modal */}
        {showQR && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-200 animate-in zoom-in-95 fade-in">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-black text-gray-900 mb-2">Scan to Collect Stamps</h3>
              <p className="text-gray-600 font-medium">Show this QR code to the cashier</p>
            </div>
            <div className="flex justify-center p-6 bg-gray-50 rounded-2xl border-2 border-gray-200">
              <QRCode value={qrData} size={240} level="L" fgColor="#000000" bgColor="#FFFFFF" />
            </div>
            <button
              onClick={() => setShowQR(false)}
              className="w-full mt-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-all"
            >
              Close
            </button>
          </div>
        )}

        {/* Stamps Grid */}
        <StampGrid user={user} />

        {/* AI Assistant Card */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6 border-2 border-purple-100 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles size={120} className="text-purple-500" />
          </div>
          <div className="relative z-10 flex items-start gap-4">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl text-white shadow-lg shrink-0">
              <Sparkles size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-black text-gray-900 mb-2 text-lg">AI Loyalty Assistant</h3>
              <p className="text-gray-700 font-medium mb-3">
                {aiInsight || "Get personalized insights about your rewards and progress!"}
              </p>
              {!aiInsight && (
                <button
                  onClick={handleAskAi}
                  disabled={loadingAi}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-lg shadow-purple-500/30 transition-all disabled:opacity-50"
                >
                  {loadingAi ? (
                    <>
                      <RefreshCw className="animate-spin" size={16} />
                      Thinking...
                    </>
                  ) : (
                    <>
                      <Zap size={16} />
                      Get Insights
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Activity History */}
        <div className="space-y-4">
          <h3 className="font-black text-gray-900 flex items-center gap-2 text-lg">
            <History size={20} className="text-brand-500" />
            Recent Activity
          </h3>
          <div className="bg-white rounded-3xl border border-gray-200 divide-y divide-gray-100 shadow-lg overflow-hidden">
            {user.history.length > 0 ? user.history.slice(0, 5).map(evt => (
              <div key={evt.id} className="p-5 flex justify-between items-center hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${evt.type === 'add' ? 'bg-green-100' : 'bg-orange-100'}`}>
                    {evt.type === 'add' ? (
                      <TrendingUp size={20} className="text-green-600" />
                    ) : (
                      <Gift size={20} className="text-orange-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{evt.type === 'add' ? 'Stamp Collected' : 'Reward Redeemed'}</p>
                    <p className="text-sm text-gray-500 font-medium">{new Date(evt.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <span className={`text-lg font-black px-4 py-2 rounded-xl ${evt.type === 'add' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                  {evt.type === 'add' ? `+${evt.amount || 1}` : 'USED'}
                </span>
              </div>
            )) : (
              <div className="p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <History size={32} className="text-gray-400" />
                </div>
                <p className="text-gray-500 font-bold">No activity yet</p>
                <p className="text-sm text-gray-400 mt-1">Start collecting stamps to see your history!</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
      `}</style>
    </div>
  );
};
