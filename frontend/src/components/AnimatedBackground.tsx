import React from 'react';

interface AnimatedBackgroundProps {
  variant?: 'dashboard' | 'hyperspectral' | 'imageAnalysis' | 'alerts';
  children?: React.ReactNode;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ 
  variant = 'dashboard',
  children 
}) => {
  const getBackgroundConfig = () => {
    switch (variant) {
      case 'dashboard':
        return {
          gradient: 'from-agricare-light/30 via-white to-agricare-sage/40',
          particles: [
            { icon: '🌱', size: 'text-2xl', positions: ['top-10 left-10', 'top-20 right-20', 'bottom-20 left-20', 'bottom-10 right-10'] },
            { icon: '🌾', size: 'text-xl', positions: ['top-32 left-32', 'top-40 right-32', 'bottom-32 left-40', 'bottom-40 right-20'] },
            { icon: '🍃', size: 'text-lg', positions: ['top-16 left-1/4', 'top-1/4 right-16', 'bottom-16 left-3/4', 'bottom-1/4 right-1/4'] },
            { icon: '🌿', size: 'text-lg', positions: ['top-12 left-1/3', 'top-1/3 right-12', 'bottom-12 left-2/3', 'bottom-1/3 right-1/3'] }
          ]
        };
      case 'hyperspectral':
        return {
          gradient: 'from-purple-50 via-agricare-light/20 to-blue-50',
          particles: [
            { icon: '📡', size: 'text-2xl', positions: ['top-12 left-12', 'top-24 right-24', 'bottom-24 left-24', 'bottom-12 right-12'] },
            { icon: '📊', size: 'text-xl', positions: ['top-36 left-36', 'top-44 right-36', 'bottom-36 left-44', 'bottom-44 right-24'] },
            { icon: '🔬', size: 'text-lg', positions: ['top-20 left-1/3', 'top-1/3 right-20', 'bottom-20 left-2/3', 'bottom-1/3 right-1/3'] }
          ]
        };
      case 'imageAnalysis':
        return {
          gradient: 'from-green-50 via-agricare-sage/20 to-agricare-light/30',
          particles: [
            { icon: '📷', size: 'text-2xl', positions: ['top-14 left-14', 'top-28 right-28', 'bottom-28 left-28', 'bottom-14 right-14'] },
            { icon: '🖼️', size: 'text-xl', positions: ['top-40 left-40', 'top-48 right-40', 'bottom-40 left-48', 'bottom-48 right-28'] },
            { icon: '🔍', size: 'text-lg', positions: ['top-24 left-1/4', 'top-1/4 right-24', 'bottom-24 left-3/4', 'bottom-1/4 right-1/4'] }
          ]
        };
      case 'alerts':
        return {
          gradient: 'from-orange-50 via-agricare-light/25 to-red-50',
          particles: [
            { icon: '⚠️', size: 'text-2xl', positions: ['top-16 left-16', 'top-32 right-32', 'bottom-32 left-32', 'bottom-16 right-16'] },
            { icon: '🔔', size: 'text-xl', positions: ['top-44 left-44', 'top-52 right-44', 'bottom-44 left-52', 'bottom-52 right-32'] },
            { icon: '📢', size: 'text-lg', positions: ['top-28 left-1/5', 'top-1/5 right-28', 'bottom-28 left-4/5', 'bottom-1/5 right-1/5'] }
          ]
        };
      default:
        return {
          gradient: 'from-white via-agricare-light/10 to-agricare-sage/20',
          particles: [
            { icon: '🌱', size: 'text-2xl', positions: ['top-10 left-10', 'top-20 right-20', 'bottom-20 left-20', 'bottom-10 right-10'] }
          ]
        };
    }
  };

  const config = getBackgroundConfig();

  return (
    <div className={`min-h-screen bg-gradient-to-br ${config.gradient} relative overflow-hidden`}>
      {/* Animated SVG Patterns */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grain" patternUnits="userSpaceOnUse" width="100" height="100">
              <circle cx="25" cy="25" r="2" fill="var(--agricare-primary)" opacity="0.3">
                <animate attributeName="opacity" values="0.3;0.7;0.3" dur="4s" repeatCount="indefinite" />
              </circle>
              <circle cx="75" cy="75" r="1.5" fill="var(--agricare-secondary)" opacity="0.4">
                <animate attributeName="opacity" values="0.4;0.8;0.4" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle cx="50" cy="10" r="1" fill="var(--agricare-sage)" opacity="0.5">
                <animate attributeName="opacity" values="0.5;0.9;0.5" dur="5s" repeatCount="indefinite" />
              </circle>
              <circle cx="10" cy="90" r="2.5" fill="var(--agricare-light)" opacity="0.6">
                <animate attributeName="opacity" values="0.6;1;0.6" dur="6s" repeatCount="indefinite" />
              </circle>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grain)" />
        </svg>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {config.particles.map((particle, particleIndex) =>
          particle.positions.map((position, posIndex) => (
            <div
              key={`${particleIndex}-${posIndex}`}
              className={`absolute ${position} ${particle.size} opacity-20 animate-float`}
              style={{
                animationDelay: `${(particleIndex * 2 + posIndex) * 0.5}s`,
                animationDuration: `${6 + (particleIndex + posIndex)}s`
              }}
            >
              {particle.icon}
            </div>
          ))
        )}
      </div>

      {/* Geometric Shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div 
          className="absolute w-96 h-96 rounded-full opacity-5 animate-pulse"
          style={{
            background: 'radial-gradient(circle, var(--agricare-primary) 0%, transparent 70%)',
            top: '10%',
            left: '10%',
            animationDuration: '8s'
          }}
        />
        <div 
          className="absolute w-64 h-64 rounded-full opacity-5 animate-pulse"
          style={{
            background: 'radial-gradient(circle, var(--agricare-secondary) 0%, transparent 70%)',
            bottom: '20%',
            right: '15%',
            animationDuration: '10s',
            animationDelay: '2s'
          }}
        />
        <div 
          className="absolute w-80 h-80 rounded-full opacity-5 animate-pulse"
          style={{
            background: 'radial-gradient(circle, var(--agricare-sage) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animationDuration: '12s',
            animationDelay: '4s'
          }}
        />
      </div>

      {/* Wave Pattern */}
      <div className="absolute bottom-0 left-0 w-full h-32 opacity-10">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-full">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" 
                fill="var(--agricare-primary)" 
                opacity="0.3">
            <animate attributeName="d" 
                     dur="20s" 
                     repeatCount="indefinite"
                     values="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z;
                             M0,0V45.29c58.79,18.2,113.59,28.17,168,24,80.36-3.37,146.33-29.31,216.8-33.5C458.64,28.43,532.34,49.67,603,68.05c79.27,14,148.3,20.88,219.4,9.08,46.15-4,79.85-13.84,114.45-25.34C1009.49,21,1133-18.29,1200,48.47V0Z;
                             M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" />
          </path>
        </svg>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default AnimatedBackground;
