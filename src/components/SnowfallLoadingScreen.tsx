
import React from 'react';

export function SnowfallLoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Fullscreen logo background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(/lovable-uploads/f4df2e72-19d9-4510-a5c3-57432e244e89.png)',
        }}
      />
      
      {/* Dark overlay for better text visibility */}
      <div className="absolute inset-0 bg-black/30" />
      
      {/* Loading content positioned over the fullscreen image */}
      <div className="relative z-10 h-full flex flex-col items-center justify-end pb-20 px-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl md:text-3xl font-semibold text-white tracking-wide drop-shadow-lg">
            Loading Rankings...
          </h2>
          
          {/* Simple animated dots */}
          <div className="flex justify-center space-x-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-2 h-2 bg-white rounded-full animate-bounce"
                style={{
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '1s',
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
