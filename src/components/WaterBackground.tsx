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
      aria-hidden="true"
    >
      {/* 1. Base Crisp White Canvas */}
      <div className="absolute inset-0 bg-white" />

      {/* 2. Fluid Liquid Water Currents (Morphing cyan-teal pools with medium saturation across the whole screen) */}
      <div className="absolute inset-0 overflow-hidden opacity-75">
        
        {/* Top-Left Ocean Teal Current */}
        <div 
          className="absolute -top-36 -left-28 w-[780px] h-[640px] rounded-full blur-[90px] bg-gradient-to-tr from-[#0891b2]/45 via-[#00bed6]/50 to-transparent"
          style={{ animation: 'waterCurrentDrift 20s ease-in-out infinite' }}
        />

        {/* Top-Right Electric Cyan Current */}
        <div 
          className="absolute -top-20 right-[-12%] w-[860px] h-[700px] rounded-full blur-[95px] bg-gradient-to-bl from-[#00e5ff]/55 via-[#00bed6]/45 to-[#0891b2]/35"
          style={{ animation: 'waterCurrentDrift 24s ease-in-out infinite reverse' }}
        />

        {/* Center Aquatic Flow Stream */}
        <div 
          className="absolute top-[35%] left-[20%] w-[750px] h-[520px] rounded-full blur-[80px] bg-gradient-to-r from-[#00e5ff]/40 via-[#38bdf8]/45 to-[#00bed6]/40"
          style={{ animation: 'waterCaustics 16s ease-in-out infinite' }}
        />

        {/* Mid-Right Aqua Pool */}
        <div 
          className="absolute top-[45%] -right-20 w-[680px] h-[560px] rounded-full blur-[85px] bg-gradient-to-l from-[#00e5ff]/45 via-[#00bed6]/40 to-transparent"
          style={{ animation: 'waterCurrentDrift 19s ease-in-out infinite 3s' }}
        />

        {/* Bottom-Left Ocean Current */}
        <div 
          className="absolute -bottom-28 left-[10%] w-[920px] h-[580px] rounded-full blur-[100px] bg-gradient-to-r from-[#0891b2]/45 via-[#00bed6]/50 to-[#00e5ff]/35"
          style={{ animation: 'waterCurrentDrift 18s ease-in-out infinite 1.5s' }}
        />

        {/* Bottom-Right Deep Teal Current */}
        <div 
          className="absolute -bottom-36 right-[-8%] w-[840px] h-[600px] rounded-full blur-[95px] bg-gradient-to-tl from-[#0891b2]/45 via-[#00bed6]/40 to-[#00e5ff]/30"
          style={{ animation: 'waterCurrentDrift 22s ease-in-out infinite 4s' }}
        />
      </div>

      {/* 3. Expanding Gentle Water Ripple Rings */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Ripple 1: Top Left */}
        <div 
          className="water-ripple absolute top-[15%] left-[16%] w-44 h-44 rounded-full border border-cyan-400/50"
          style={{ animation: 'waterRipple 10s ease-out infinite', animationDelay: '0s' }}
        />
        {/* Ripple 2: Top Right */}
        <div 
          className="water-ripple absolute top-[28%] right-[18%] w-52 h-52 rounded-full border border-[#00bed6]/45"
          style={{ animation: 'waterRipple 12s ease-out infinite', animationDelay: '4s' }}
        />
        {/* Ripple 3: Center Left */}
        <div 
          className="water-ripple absolute top-[58%] left-[28%] w-48 h-48 rounded-full border border-[#0891b2]/40"
          style={{ animation: 'waterRipple 11s ease-out infinite', animationDelay: '2s' }}
        />
        {/* Ripple 4: Bottom Right */}
        <div 
          className="water-ripple absolute bottom-[18%] right-[25%] w-56 h-56 rounded-full border border-[#00e5ff]/45"
          style={{ animation: 'waterRipple 13s ease-out infinite', animationDelay: '6.5s' }}
        />
      </div>

      {/* 4. Multi-Layer Seamless Flowing SVG Water Waves at Bottom */}
      <div className="absolute inset-0 flex flex-col justify-end pointer-events-none">
        
        {/* Wave Layer 1 (Deep Ocean Teal Current, 2880px seamless loop) */}
        <div 
          className="w-full h-44 sm:h-60 relative overflow-hidden -mb-6 opacity-60"
          style={{ animation: 'waterSwell 8s ease-in-out infinite alternate' }}
        >
          <div 
            className="w-[200%] h-full flex"
            style={{ animation: 'waterFlowLeft 22s linear infinite' }}
          >
            <svg 
              className="w-full h-full"
              viewBox="0 0 2880 180" 
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="waveGradFull1" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#0891b2" stopOpacity="0.6" />
                  <stop offset="25%" stopColor="#00bed6" stopOpacity="0.65" />
                  <stop offset="50%" stopColor="#00e5ff" stopOpacity="0.55" />
                  <stop offset="75%" stopColor="#0891b2" stopOpacity="0.65" />
                  <stop offset="100%" stopColor="#0891b2" stopOpacity="0.6" />
                </linearGradient>
              </defs>
              <path 
                fill="url(#waveGradFull1)" 
                d="M0,60 C240,110 480,20 720,60 C960,100 1200,20 1440,60 C1680,110 1920,20 2160,60 C2400,100 2640,20 2880,60 L2880,180 L0,180 Z"
              />
            </svg>
          </div>
        </div>

        {/* Wave Layer 2 (Mid Cyan Current, counter-flowing in reverse direction) */}
        <div 
          className="w-full h-40 sm:h-52 relative overflow-hidden -mt-26 sm:-mt-32 opacity-65"
          style={{ animation: 'waterSwell 9s ease-in-out infinite alternate 2s' }}
        >
          <div 
            className="w-[200%] h-full flex"
            style={{ animation: 'waterFlowRight 17s linear infinite' }}
          >
            <svg 
              className="w-full h-full"
              viewBox="0 0 2880 180" 
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="waveGradFull2" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.7" />
                  <stop offset="30%" stopColor="#00bed6" stopOpacity="0.55" />
                  <stop offset="65%" stopColor="#0891b2" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="#00e5ff" stopOpacity="0.7" />
                </linearGradient>
              </defs>
              <path 
                fill="url(#waveGradFull2)" 
                d="M0,90 C180,40 360,130 720,80 C1080,30 1260,140 1440,90 C1620,40 1800,130 2160,80 C2520,30 2700,140 2880,90 L2880,180 L0,180 Z"
              />
            </svg>
          </div>
        </div>

        {/* Wave Layer 3 (Vibrant Surface Crest Highlights) */}
        <div 
          className="w-full h-32 sm:h-40 relative overflow-hidden -mt-20 sm:-mt-28 opacity-55"
          style={{ animation: 'waterSwell 6s ease-in-out infinite alternate 3.5s' }}
        >
          <div 
            className="w-[200%] h-full flex"
            style={{ animation: 'waterFlowLeft 12s linear infinite' }}
          >
            <svg 
              className="w-full h-full"
              viewBox="0 0 2880 180" 
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="waveGradFull3" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.6" />
                  <stop offset="45%" stopColor="#00e5ff" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#00bed6" stopOpacity="0.6" />
                </linearGradient>
              </defs>
              <path 
                fill="url(#waveGradFull3)" 
                d="M0,110 C120,85 240,135 480,105 C720,75 960,135 1200,105 C1320,90 1380,115 1440,110 C1560,85 1680,135 1920,105 C2160,75 2400,135 2640,105 C2760,90 2820,115 2880,110 L2880,180 L0,180 Z"
              />
            </svg>
          </div>
        </div>

      </div>

      {/* 5. Floating Translucent Water Droplets / Bubbles with Refraction & Glow Across Whole Screen */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        
        {/* Bubble 1 */}
        <div 
          className="water-bubble absolute w-6 h-6 rounded-full"
          style={{ 
            left: '6%', 
            bottom: '2%',
            animation: 'waterBubbleFloat 12s ease-in-out infinite',
            animationDelay: '0s'
          }}
        />

        {/* Bubble 2 */}
        <div 
          className="water-bubble absolute w-11 h-11 rounded-full"
          style={{ 
            left: '14%', 
            bottom: '4%',
            animation: 'waterBubbleFloat 16s ease-in-out infinite',
            animationDelay: '3s'
          }}
        />

        {/* Bubble 3 */}
        <div 
          className="water-bubble absolute w-5 h-5 rounded-full"
          style={{ 
            left: '22%', 
            bottom: '1%',
            animation: 'waterBubbleFloat 10s ease-in-out infinite',
            animationDelay: '1.2s'
          }}
        />

        {/* Bubble 4 */}
        <div 
          className="water-bubble absolute w-13 h-13 rounded-full"
          style={{ 
            left: '32%', 
            bottom: '5%',
            animation: 'waterBubbleFloat 18s ease-in-out infinite',
            animationDelay: '4.8s'
          }}
        />

        {/* Bubble 5 */}
        <div 
          className="water-bubble absolute w-7 h-7 rounded-full"
          style={{ 
            left: '42%', 
            bottom: '3%',
            animation: 'waterBubbleFloat 13s ease-in-out infinite',
            animationDelay: '2.5s'
          }}
        />

        {/* Bubble 6 */}
        <div 
          className="water-bubble absolute w-10 h-10 rounded-full"
          style={{ 
            left: '52%', 
            bottom: '2%',
            animation: 'waterBubbleFloat 15s ease-in-out infinite',
            animationDelay: '6s'
          }}
        />

        {/* Bubble 7 */}
        <div 
          className="water-bubble absolute w-4 h-4 rounded-full"
          style={{ 
            left: '62%', 
            bottom: '6%',
            animation: 'waterBubbleFloat 9s ease-in-out infinite',
            animationDelay: '3.8s'
          }}
        />

        {/* Bubble 8 */}
        <div 
          className="water-bubble absolute w-12 h-12 rounded-full"
          style={{ 
            left: '70%', 
            bottom: '1%',
            animation: 'waterBubbleFloat 17s ease-in-out infinite',
            animationDelay: '5.2s'
          }}
        />

        {/* Bubble 9 */}
        <div 
          className="water-bubble absolute w-6 h-6 rounded-full"
          style={{ 
            left: '80%', 
            bottom: '4%',
            animation: 'waterBubbleFloat 11s ease-in-out infinite',
            animationDelay: '1.8s'
          }}
        />

        {/* Bubble 10 */}
        <div 
          className="water-bubble absolute w-9 h-9 rounded-full"
          style={{ 
            left: '90%', 
            bottom: '2%',
            animation: 'waterBubbleFloat 14s ease-in-out infinite',
            animationDelay: '7s'
          }}
        />

        {/* Bubble 11 */}
        <div 
          className="water-bubble absolute w-4 h-4 rounded-full"
          style={{ 
            left: '96%', 
            bottom: '5%',
            animation: 'waterBubbleFloat 8.5s ease-in-out infinite',
            animationDelay: '4.2s'
          }}
        />

        {/* Bubble 12 */}
        <div 
          className="water-bubble absolute w-8 h-8 rounded-full"
          style={{ 
            left: '26%', 
            bottom: '8%',
            animation: 'waterBubbleFloat 13.5s ease-in-out infinite',
            animationDelay: '8.5s'
          }}
        />

        {/* Bubble 13 */}
        <div 
          className="water-bubble absolute w-5 h-5 rounded-full"
          style={{ 
            left: '58%', 
            bottom: '7%',
            animation: 'waterBubbleFloat 10.5s ease-in-out infinite',
            animationDelay: '7.8s'
          }}
        />

        {/* Bubble 14 */}
        <div 
          className="water-bubble absolute w-7 h-7 rounded-full"
          style={{ 
            left: '84%', 
            bottom: '9%',
            animation: 'waterBubbleFloat 12.5s ease-in-out infinite',
            animationDelay: '9.2s'
          }}
        />
      </div>

      {/* 6. Clean White Glass Top Veil: Keeps the overall background crisp white with floating water at medium intensity */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/55 via-white/30 to-white/60 pointer-events-none" />

    </div>
  );
};
