import React, { useEffect, useRef, useState } from 'react';
import { Coffee, Gift, Sparkles, Star, Zap } from 'lucide-react';
import { User } from '../types';
import { getBrandConfig } from '../services/branding';

interface StampGridProps {
  user: User;
}

export const StampGrid: React.FC<StampGridProps> = ({ user }) => {
  const totalSlots = user.maxStamps;
  const filledSlots = user.stamps;
  const prevStampsRef = useRef(filledSlots);
  const [newStampIndex, setNewStampIndex] = useState<number | null>(null);
  const brandConfig = getBrandConfig();

  useEffect(() => {
    if (filledSlots > prevStampsRef.current) {
      setNewStampIndex(filledSlots - 1);

      const timer = setTimeout(() => {
        setNewStampIndex(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
    prevStampsRef.current = filledSlots;
  }, [filledSlots]);

  return (
    <div className="w-full bg-white rounded-3xl shadow-xl p-8 border border-gray-200 relative overflow-hidden">

      {/* Celebration Overlay */}
      {newStampIndex !== null && (
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-green-400/20 to-green-500/10 animate-pulse"></div>
          <div className="bg-white/95 backdrop-blur-md px-8 py-4 rounded-2xl shadow-2xl border-2 border-green-400 flex items-center gap-3 animate-bounce">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <Sparkles className="text-white" size={24} />
            </div>
            <span className="font-black text-green-800 text-xl">Stamp Added!</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h3 className="text-2xl font-black text-gray-900 leading-none flex items-center gap-2">
            <Star size={24} className="text-brand-500" />
            Loyalty Card
          </h3>
          <p className="text-sm text-gray-600 font-medium mt-1.5">Collect {totalSlots} stamps for your reward</p>
        </div>
        <div className="bg-gradient-to-br from-brand-500 to-brand-600 text-white px-5 py-3 rounded-2xl shadow-lg shadow-brand-500/30">
          <p className="text-xs font-bold opacity-90">Progress</p>
          <p className="text-2xl font-black">{filledSlots}<span className="text-sm opacity-75">/{totalSlots}</span></p>
        </div>
      </div>

      {/* Stamp Grid */}
      <div className="grid grid-cols-5 gap-4 relative z-0 mb-8">
        {Array.from({ length: totalSlots }).map((_, index) => {
          const isFilled = index < filledSlots;
          const isLast = index === totalSlots - 1;
          const isNew = index === newStampIndex;

          return (
            <div
              key={index}
              className={`
                aspect-square rounded-2xl flex items-center justify-center border-3 transition-all duration-700 relative
                ${isNew ? 'scale-110 bg-gradient-to-br from-green-500 to-green-600 border-green-400 z-20 shadow-2xl shadow-green-500/50' : ''}
                ${!isNew && isFilled
                  ? 'bg-gradient-to-br from-brand-600 to-brand-500 border-brand-400 text-white shadow-lg shadow-brand-500/30 scale-100 hover:scale-105'
                  : !isNew
                    ? 'bg-gray-100 border-gray-300 text-gray-400 scale-95 hover:scale-100'
                    : ''
                }
              `}
            >
              {isFilled ? (
                isLast ? (
                  <div className="relative">
                    <Gift size={28} className={isNew ? 'text-white animate-bounce' : 'animate-pulse'} />
                    {!isNew && <Sparkles size={14} className="absolute -top-1 -right-1 text-yellow-300 animate-pulse" />}
                  </div>
                ) : (
                  <Coffee size={26} className={isNew ? 'text-white' : ''} />
                )
              ) : (
                <div className="w-3 h-3 rounded-full bg-gray-400" />
              )}

              {/* Stamp number */}
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center text-[10px] font-black text-gray-600 border border-gray-300 shadow-sm">
                {index + 1}
              </div>
            </div>
          );
        })}
      </div>

      {/* Status Message */}
      <div className="text-center">
        {filledSlots >= totalSlots ? (
          <div className="p-5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-2xl border-2 border-green-400 flex items-center justify-center gap-3 shadow-xl shadow-green-500/30 animate-pulse">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Gift size={28} className="animate-bounce" />
            </div>
            <div className="text-left">
              <p className="font-black text-xl">Reward Ready!</p>
              <p className="text-sm font-medium text-white/90">Show this card to redeem your free item</p>
            </div>
          </div>
        ) : (
          <div className="p-5 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl border border-gray-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap size={20} className="text-brand-500" />
              <p className="text-gray-900 font-black text-lg">
                {totalSlots - filledSlots} stamp{totalSlots - filledSlots !== 1 ? 's' : ''} to go!
              </p>
            </div>
            <p className="text-sm text-gray-600 font-medium">Keep collecting to unlock your reward</p>
          </div>
        )}
      </div>
    </div>
  );
};
