import React, { useState } from 'react';
import { Coffee, ArrowRight, Lock, Mail, User as UserIcon, AlertCircle, Phone, MapPin, Calendar, Loader2 } from 'lucide-react';
import { loginUser, registerUser, setAdminSession } from '../services/storage';
import { User } from '../types';

interface AuthViewProps {
  onLogin: (user: User | null, isAdmin: boolean) => void;
}

const InputField = ({ 
  label, type, value, onChange, placeholder, icon: Icon, required = false 
}: { 
  label: string, type: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder: string, icon: React.ElementType, required?: boolean
}) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-bold text-gray-900 tracking-tight">{label} {required && <span className="text-red-500">*</span>}</label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
        <Icon size={18} />
      </div>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-brand-600 focus:ring-4 focus:ring-brand-50 outline-none transition-all font-medium"
        placeholder={placeholder}
      />
    </div>
  </div>
);

export const AuthView: React.FC<AuthViewProps> = ({ onLogin }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [birthDate, setBirthDate] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Trim inputs for safety
    const safeUser = username.trim();
    const safePass = password.trim();

    if (safeUser.toLowerCase() === 'admin' && safePass === 'admin123') {
      setAdminSession(); // Persist Admin Session
      onLogin(null, true);
      setIsLoading(false);
      return;
    }

    try {
      if (isRegistering) {
        if (!safeUser || !email || !safePass || !name || !phone) {
          setError('Please fill in all required fields.');
          setIsLoading(false);
          return;
        }
        const newUser = await registerUser({ username: safeUser, name, email, phone, address, birthDate, password: safePass });
        onLogin(newUser, false);
      } else {
        const user = await loginUser(safeUser, safePass);
        if (user) {
          onLogin(user, false);
        }
      }
    } catch (err: any) {
      // Display the actual error from storage.ts (which could be network error or invalid password)
      setError(err.message || 'Authentication failed. Check connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500 ring-1 ring-black/5 my-8">
      <div className="bg-coffee-900 p-8 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-brand-500/20 rounded-full blur-3xl" />
        <div className="relative z-10">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-[1rem] flex items-center justify-center mx-auto mb-4 shadow-2xl ring-1 ring-white/20">
            <Coffee size={32} className="text-white" />
          </div>
          <h1 className="text-3xl font-black text-white mb-1 tracking-tighter">StampLink</h1>
          <p className="text-coffee-200 font-bold opacity-80 uppercase tracking-widest text-[10px]">
            {isRegistering ? 'New Member Enrollment' : 'Member Check-In'}
          </p>
        </div>
      </div>

      <div className="p-8 bg-white">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl border border-red-100 flex items-center justify-center gap-2">
               <AlertCircle size={14} className="shrink-0" /> <span className="text-left">{error}</span>
            </div>
          )}

          <InputField 
            label="Username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="e.g. coffeefan99"
            icon={UserIcon}
            required
          />

          <InputField 
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            icon={Lock}
            required
          />

          {isRegistering && (
            <div className="space-y-5 animate-in slide-in-from-top-4 fade-in pt-2">
              <div className="h-px bg-gray-100"></div>
              <p className="text-xs font-black uppercase text-gray-400 tracking-wider">Personal Details</p>
              
              <InputField 
                label="Full Name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe"
                icon={UserIcon}
                required
              />
              <InputField 
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hello@example.com"
                icon={Mail}
                required
              />
              <InputField 
                label="Mobile Phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 234 567 890"
                icon={Phone}
                required
              />
               <InputField 
                label="Home Address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Coffee Lane"
                icon={MapPin}
              />
               <InputField 
                label="Birth Date"
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                placeholder=""
                icon={Calendar}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-coffee-900 hover:bg-black text-white font-black text-lg py-5 px-6 rounded-2xl shadow-xl shadow-coffee-900/20 flex items-center justify-center gap-2 transition-all active:scale-95 mt-6 disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="animate-spin" size={24} /> : (
              <>
                {isRegistering ? 'Create Profile' : 'Sign In'}
                <ArrowRight size={22} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100">
          <button
            onClick={() => { setIsRegistering(!isRegistering); setError(''); }}
            className="text-xs font-black text-brand-600 hover:text-brand-800 flex items-center justify-center gap-1 mx-auto py-2 px-4 rounded-lg uppercase tracking-widest"
          >
            {isRegistering ? 'Have an account? Login' : 'New here? Register now'}
          </button>
        </div>
      </div>
    </div>
  );
};