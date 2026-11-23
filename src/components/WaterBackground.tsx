import React from 'react';

interface WaterBackgroundProps {
  className?: string;
  fixed?: boolean;
}

export const WaterBackground: React.FC<WaterBackgroundProps> = ({ 
  className = '',
  fixed = true,
}) => {
  return (
    <div 
      className={`${fixed ? 'fixed' : 'absolute'} inset-0 overflow-hidden pointer-events-none select-none z-0 ${className}`}
      style={{ contain: 'paint layout' }}
      aria-hidden="true"
    >
      {/* 1. Base Crisp White Canvas */}
      <div className="absolute inset-0 bg-white" />

      {/* 2A. MOBILE-OPTIMIZED LIQUID WATER (120 FPS Silky Smooth, Zero GPU Thrash on Phones) */}
      <div className="md:hidden absolute inset-0 overflow-hidden pointer-events-none">
        {/* Soft flowing gradients using efficient radial gradients */}
        <div 
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: `
              radial-gradient(ellipse at 15% 15%, rgba(0, 190, 214, 0.28) 0%, transparent 45%),
              radial-gradient(ellipse at 85% 20%, rgba(0, 229, 255, 0.26) 0%, transparent 40%),
              radial-gradient(ellipse at 50% 55%, rgba(56, 189, 248, 0.20) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 80%, rgba(8, 145, 178, 0.28) 0%, transparent 45%),
              radial-gradient(ellipse at 20% 85%, rgba(0, 190, 214, 0.22) 0%, transparent 40%)
            `,
            backgroundRepeat: 'no-repeat',
            backgroundSize: '100% 100%',
          }}
        />

        {/* Lightweight Mobile Water Droplets (GPU hardware accelerated, no heavy backdrop blur) */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="water-bubble-mobile absolute w-6 h-6 rounded-full"
            style={{ 
              left: '12%', 
              bottom: '2%',
              animation: 'waterBubbleFloat 14s ease-in-out infinite',
              animationDelay: '0s'
            }}
          />
          <div 
            className="water-bubble-mobile absolute w-9 h-9 rounded-full"
            style={{ 
              left: '38%', 
              bottom: '4%',
              animation: 'waterBubbleFloat 18s ease-in-out infinite',
              animationDelay: '3.5s'
            }}
          />
          <div 
            className="water-bubble-mobile absolute w-5 h-5 rounded-full"
            style={{ 
              left: '68%', 
              bottom: '1%',
              animation: 'waterBubbleFloat 12s ease-in-out infinite',
              animationDelay: '1.5s'
            }}
          />
          <div 
            className="water-bubble-mobile absolute w-8 h-8 rounded-full"
            style={{ 
              left: '88%', 
              bottom: '3%',
              animation: 'waterBubbleFloat 16s ease-in-out infinite',
              animationDelay: '6s'
            }}
          />
        </div>

        {/* Mobile Single Optimized Seamless Wave at Bottom */}
        <div className="absolute inset-0 flex flex-col justify-end pointer-events-none">
          <div className="w-full h-28 relative overflow-hidden opacity-60">
            <div 
              className="w-[200%] h-full flex"
              style={{ 
                animation: 'waterFlowLeft 20s linear infinite',
                transform: 'translate3d(0, 0, 0)',
                willChange: 'transform'
              }}
            >
              <svg 
                className="w-full h-full"
                viewBox="0 0 2880 180" 
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="waveMobileGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0891b2" stopOpacity="0.5" />
                    <stop offset="50%" stopColor="#00e5ff" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#0891b2" stopOpacity="0.5" />
                  </linearGradient>
                </defs>
                <path 
                  fill="url(#waveMobileGrad)" 
                  d="M0,60 C240,110 480,20 720,60 C960,100 1200,20 1440,60 C1680,110 1920,20 2160,60 C2400,100 2640,20 2880,60 L2880,180 L0,180 Z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 2B. DESKTOP FLUID LIQUID WATER CURRENTS (Hardware-Accelerated with translate3d) */}
      <div className="hidden md:block absolute inset-0 overflow-hidden pointer-events-none">
        
        {/* Desktop Currents */}
        <div className="absolute inset-0 overflow-hidden opacity-75">
          <div 
            className="absolute -top-36 -left-28 w-[780px] h-[640px] rounded-full blur-[80px] bg-gradient-to-tr from-[#0891b2]/45 via-[#00bed6]/50 to-transparent"
            style={{ 
              animation: 'waterCurrentDrift 20s ease-in-out infinite',
              transform: 'translate3d(0, 0, 0)',
              willChange: 'transform'
            }}
          />
          <div 
            className="absolute -top-20 right-[-12%] w-[860px] h-[700px] rounded-full blur-[85px] bg-gradient-to-bl from-[#00e5ff]/55 via-[#00bed6]/45 to-[#0891b2]/35"
            style={{ 
              animation: 'waterCurrentDrift 24s ease-in-out infinite reverse',
              transform: 'translate3d(0, 0, 0)',
              willChange: 'transform'
            }}
          />
          <div 
            className="absolute top-[35%] left-[20%] w-[750px] h-[520px] rounded-full blur-[70px] bg-gradient-to-r from-[#00e5ff]/40 via-[#38bdf8]/45 to-[#00bed6]/40"
            style={{ 
              animation: 'waterCaustics 16s ease-in-out infinite',
              transform: 'translate3d(0, 0, 0)',
              willChange: 'transform'
            }}
          />
          <div 
            className="absolute -bottom-28 left-[10%] w-[920px] h-[580px] rounded-full blur-[90px] bg-gradient-to-r from-[#0891b2]/45 via-[#00bed6]/50 to-[#00e5ff]/35"
            style={{ 
              animation: 'waterCurrentDrift 18s ease-in-out infinite 1.5s',
              transform: 'translate3d(0, 0, 0)',
              willChange: 'transform'
            }}
          />
        </div>

        {/* Desktop Expanding Gentle Water Ripples */}
        <div className="absolute inset-0 overflow-hidden">
          <div 
            className="water-ripple absolute top-[15%] left-[16%] w-44 h-44 rounded-full border border-cyan-400/50"
            style={{ animation: 'waterRipple 10s ease-out infinite', animationDelay: '0s' }}
          />
          <div 
            className="water-ripple absolute top-[28%] right-[18%] w-52 h-52 rounded-full border border-[#00bed6]/45"
            style={{ animation: 'waterRipple 12s ease-out infinite', animationDelay: '4s' }}
          />
        </div>

        {/* Desktop Multi-Layer Flowing Water Waves at Bottom */}
        <div className="absolute inset-0 flex flex-col justify-end pointer-events-none">
          <div 
            className="w-full h-44 sm:h-56 relative overflow-hidden -mb-6 opacity-60"
            style={{ animation: 'waterSwell 8s ease-in-out infinite alternate' }}
          >
            <div 
              className="w-[200%] h-full flex"
              style={{ 
                animation: 'waterFlowLeft 22s linear infinite',
                transform: 'translate3d(0, 0, 0)',
                willChange: 'transform'
              }}
            >
              <svg 
                className="w-full h-full"
                viewBox="0 0 2880 180" 
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="waveGradDesktop1" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#0891b2" stopOpacity="0.6" />
                    <stop offset="25%" stopColor="#00bed6" stopOpacity="0.65" />
                    <stop offset="50%" stopColor="#00e5ff" stopOpacity="0.55" />
                    <stop offset="75%" stopColor="#0891b2" stopOpacity="0.65" />
                    <stop offset="100%" stopColor="#0891b2" stopOpacity="0.6" />
                  </linearGradient>
                </defs>
                <path 
                  fill="url(#waveGradDesktop1)" 
                  d="M0,60 C240,110 480,20 720,60 C960,100 1200,20 1440,60 C1680,110 1920,20 2160,60 C2400,100 2640,20 2880,60 L2880,180 L0,180 Z"
                />
              </svg>
            </div>
          </div>

          <div 
            className="w-full h-40 sm:h-48 relative overflow-hidden -mt-24 sm:-mt-28 opacity-65"
            style={{ animation: 'waterSwell 9s ease-in-out infinite alternate 2s' }}
          >
            <div 
              className="w-[200%] h-full flex"
              style={{ 
                animation: 'waterFlowRight 17s linear infinite',
                transform: 'translate3d(0, 0, 0)',
                willChange: 'transform'
              }}
            >
              <svg 
                className="w-full h-full"
                viewBox="0 0 2880 180" 
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id="waveGradDesktop2" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.7" />
                    <stop offset="30%" stopColor="#00bed6" stopOpacity="0.55" />
                    <stop offset="65%" stopColor="#0891b2" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.7" />
                  </linearGradient>
                </defs>
                <path 
                  fill="url(#waveGradDesktop2)" 
                  d="M0,90 C180,40 360,130 720,80 C1080,30 1260,140 1440,90 C1620,40 1800,130 2160,80 C2520,30 2700,140 2880,90 L2880,180 L0,180 Z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Desktop Bubbles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div 
            className="water-bubble absolute w-6 h-6 rounded-full"
            style={{ 
              left: '6%', 
              bottom: '2%',
              animation: 'waterBubbleFloat 12s ease-in-out infinite',
              animationDelay: '0s'
            }}
          />
          <div 
            className="water-bubble absolute w-11 h-11 rounded-full"
            style={{ 
              left: '14%', 
              bottom: '4%',
              animation: 'waterBubbleFloat 16s ease-in-out infinite',
              animationDelay: '3s'
            }}
          />
          <div 
            className="water-bubble absolute w-5 h-5 rounded-full"
            style={{ 
              left: '24%', 
              bottom: '1%',
              animation: 'waterBubbleFloat 10s ease-in-out infinite',
              animationDelay: '1.2s'
            }}
          />
          <div 
            className="water-bubble absolute w-12 h-12 rounded-full"
            style={{ 
              left: '36%', 
              bottom: '5%',
              animation: 'waterBubbleFloat 18s ease-in-out infinite',
              animationDelay: '4.8s'
            }}
          />
          <div 
            className="water-bubble absolute w-7 h-7 rounded-full"
            style={{ 
              left: '50%', 
              bottom: '3%',
              animation: 'waterBubbleFloat 13s ease-in-out infinite',
              animationDelay: '2.5s'
            }}
          />
          <div 
            className="water-bubble absolute w-10 h-10 rounded-full"
            style={{ 
              left: '65%', 
              bottom: '2%',
              animation: 'waterBubbleFloat 15s ease-in-out infinite',
              animationDelay: '6s'
            }}
          />
          <div 
            className="water-bubble absolute w-6 h-6 rounded-full"
            style={{ 
              left: '80%', 
              bottom: '3%',
              animation: 'waterBubbleFloat 14s ease-in-out infinite',
              animationDelay: '3.8s'
            }}
          />
          <div 
            className="water-bubble absolute w-11 h-11 rounded-full"
            style={{ 
              left: '92%', 
              bottom: '4%',
              animation: 'waterBubbleFloat 17s ease-in-out infinite',
              animationDelay: '1.8s'
            }}
          />
        </div>
      </div>
    </div>
  );
};
