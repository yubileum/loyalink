import React, { useEffect, useRef, useState } from 'react';
import { Coffee, Gift, Sparkles } from 'lucide-react';
import { User } from '../types';

interface StampGridProps {
  user: User;
}

export const StampGrid: React.FC<StampGridProps> = ({ user }) => {
  const totalSlots = user.maxStamps;
  const filledSlots = user.stamps;
  const prevStampsRef = useRef(filledSlots);
  const [newStampIndex, setNewStampIndex] = useState<number | null>(null);

  useEffect(() => {
    // If stamps increased, trigger animation on the newest stamp
    if (filledSlots > prevStampsRef.current) {
      setNewStampIndex(filledSlots - 1); // Index is 0-based
      
      // Clear animation after 2 seconds
      const timer = setTimeout(() => {
        setNewStampIndex(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
    prevStampsRef.current = filledSlots;
  }, [filledSlots]);

  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-xl p-6 border border-gray-100 ring-1 ring-gray-200/50 relative overflow-hidden">
      
      {/* Celebration Overlay */}
      {newStampIndex !== null && (
         <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
            <div className="absolute inset-0 bg-green-500/10 animate-pulse"></div>
            <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-2xl border border-green-100 flex items-center gap-2 animate-[bounce_1s_infinite]">
                 <Sparkles className="text-green-500" size={24} />
                 <span className="font-bold text-green-800 text-lg">Stamp Added!</span>
            </div>
         </div>
      )}

      <div className="flex justify-between items-end mb-6">
        <div>
           <h3 className="text-xl font-bold text-coffee-950 leading-none">Your Card</h3>
           <p className="text-xs text-gray-500 font-medium mt-1">Get 10 stamps for a free latte</p>
        </div>
        <span className="text-sm font-bold text-coffee-900 bg-coffee-100 px-3 py-1.5 rounded-lg border border-coffee-200">
          {filledSlots} / {totalSlots}
        </span>
      </div>

      <div className="grid grid-cols-5 gap-3 sm:gap-4 relative z-0">
        {Array.from({ length: totalSlots }).map((_, index) => {
          const isFilled = index < filledSlots;
          const isLast = index === totalSlots - 1;
          const isNew = index === newStampIndex;
          
          return (
            <div
              key={index}
              className={`
                aspect-square rounded-full flex items-center justify-center border-2 transition-all duration-700 relative
                ${isNew ? 'scale-125 bg-green-500 border-green-500 z-20 shadow-[0_0_20px_rgba(34,197,94,0.6)]' : ''}
                ${!isNew && isFilled 
                  ? 'bg-coffee-900 border-coffee-900 text-white shadow-md shadow-coffee-900/30 scale-100' 
                  : !isNew 
                    ? 'bg-gray-50 border-gray-300 text-gray-300 scale-95'
                    : ''
                }
              `}
            >
              {isFilled ? (
                isLast ? <Gift size={22} className={isNew ? 'text-white animate-spin' : 'animate-pulse'} /> : <Coffee size={22} className={isNew ? 'text-white' : ''} />
              ) : (
                <div className="w-2.5 h-2.5 rounded-full bg-gray-300" />
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 text-center text-sm font-medium">
        {filledSlots >= totalSlots ? (
            <div className="p-3 bg-green-50 text-green-800 rounded-xl border border-green-200 flex items-center justify-center gap-2 animate-bounce">
                <Gift size={18}/> 
                <span className="font-bold">Reward Unlocked! Redeem now.</span>
            </div>
        ) : (
            <div className="text-gray-600">
                Collect <span className="font-bold text-coffee-900">{totalSlots - filledSlots}</span> more for a free drink!
            </div>
        )}
      </div>
    </div>
  );
};
