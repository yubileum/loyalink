
import React, { useRef, useEffect, useState } from 'react';
import { Camera, X } from 'lucide-react';
import jsQR from 'jsqr';

interface ScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export const Scanner: React.FC<ScannerProps> = ({ onScan, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(document.createElement('canvas'));
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  // Fix: Added initial value to useRef to resolve "Expected 1 arguments, but got 0" error
  const requestRef = useRef<number | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'environment' } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          // Wait for video to be ready to play
          videoRef.current.onloadedmetadata = () => {
             setPermissionGranted(true);
             videoRef.current?.play();
             requestRef.current = requestAnimationFrame(tick);
          };
        }
      } catch (err) {
        console.error("Camera access denied or error:", err);
        setError("Camera access is required to scan.");
      }
    };

    const tick = () => {
      if (videoRef.current && canvasRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (ctx) {
          canvas.height = video.videoHeight;
          canvas.width = video.videoWidth;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "dontInvert",
          });

          if (code && code.data) {
             onScan(code.data);
             return; // Stop scanning loop once found
          }
        }
      }
      requestRef.current = requestAnimationFrame(tick);
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [onScan]);

  const handleSimulateScan = () => {
    onScan('user-001'); 
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col animate-in fade-in duration-300">
      <div className="absolute top-4 right-4 z-10">
        <button onClick={onClose} className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition shadow-lg">
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center bg-gray-900 overflow-hidden">
        {error ? (
          <div className="text-white text-center p-6 max-w-xs">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-red-400">
                <Camera size={32} />
            </div>
            <p className="mb-6 text-lg font-medium">{error}</p>
            <button onClick={onClose} className="bg-white text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition">Close Scanner</button>
          </div>
        ) : (
          <>
            <video 
              ref={videoRef} 
              playsInline 
              muted 
              className="absolute inset-0 w-full h-full object-cover opacity-60"
            />
            
            {/* Overlay for scan area */}
            <div className="relative z-10">
                <div className="w-72 h-72 border-2 border-white/50 rounded-3xl relative flex items-center justify-center shadow-[0_0_100px_rgba(0,0,0,0.5)]">
                    {/* Corner accents */}
                    <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-brand-500 -mt-1 -ml-1 rounded-tl-xl"></div>
                    <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-brand-500 -mt-1 -mr-1 rounded-tr-xl"></div>
                    <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-brand-500 -mb-1 -ml-1 rounded-bl-xl"></div>
                    <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-brand-500 -mb-1 -mr-1 rounded-br-xl"></div>
                    
                    {/* Scanning Line */}
                    <div className="w-64 h-0.5 bg-brand-400/80 animate-[scan_2s_ease-in-out_infinite] shadow-[0_0_15px_rgba(56,189,248,0.8)]"></div>
                </div>
                <p className="text-center text-white/90 text-sm font-semibold mt-8 tracking-wide bg-black/30 py-2 px-4 rounded-full backdrop-blur-sm mx-auto w-fit">
                    Align QR code within frame
                </p>
            </div>
          </>
        )}
      </div>

      <div className="bg-black/90 p-8 pb-12 flex flex-col items-center gap-4 border-t border-white/10">
        <button 
          onClick={handleSimulateScan}
          className="text-gray-500 text-xs font-medium hover:text-white transition-colors flex items-center gap-2"
        >
          <Camera size={14} />
          <span>Dev: Simulate Scan</span>
        </button>
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { transform: translateY(-120px); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          50% { transform: translateY(120px); }
        }
      `}</style>
    </div>
  );
};
