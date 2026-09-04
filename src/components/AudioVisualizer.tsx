// SpeakBand — Audio Waveform Visualizer (QuizTube Purple/Pink Styled)

import React from 'react';

interface AudioVisualizerProps {
  audioLevel: number; // 0 to 100
  isActive: boolean;
  className?: string;
}

export const AudioVisualizer: React.FC<AudioVisualizerProps> = ({
  audioLevel,
  isActive,
  className = '',
}) => {
  const barsCount = 20;

  return (
    <div className={`flex items-center justify-center gap-1 h-10 ${className}`}>
      {Array.from({ length: barsCount }).map((_, idx) => {
        // Calculate variable heights based on sine wave pattern + audio level
        const positionFactor = Math.sin((idx / (barsCount - 1)) * Math.PI);
        const dynamicHeight = isActive
          ? Math.max(12, Math.min(100, Math.round(audioLevel * positionFactor * 1.5 + 10)))
          : 12;

        return (
          <div
            key={idx}
            className={`w-1 rounded-full transition-all duration-75 ${
              isActive
                ? 'bg-gradient-to-t from-indigo-600 via-purple-500 to-pink-500 shadow-[0_0_8px_rgba(147,51,234,0.35)]'
                : 'bg-slate-200 dark:bg-slate-700/60'
            }`}
            style={{
              height: `${dynamicHeight}%`,
              transition: 'height 80ms ease-out',
            }}
          />
        );
      })}
    </div>
  );
};
