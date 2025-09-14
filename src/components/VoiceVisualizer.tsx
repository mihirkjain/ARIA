import React, { useEffect, useState } from 'react';
import { useAssistant } from '../contexts/AssistantContext';

const VoiceVisualizer: React.FC = () => {
  const { state } = useAssistant();
  const [audioLevels, setAudioLevels] = useState<number[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (state.isListening) {
      interval = setInterval(() => {
        const newLevels = Array.from({ length: 20 }, () => Math.random() * 100);
        setAudioLevels(newLevels);
      }, 100);
    } else {
      setAudioLevels(Array(20).fill(0));
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [state.isListening]);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Voice Activity</h3>
        <div className={`w-3 h-3 rounded-full ${
          state.isListening ? 'bg-red-500 animate-pulse' : 'bg-slate-500'
        }`}></div>
      </div>

      <div className="h-24 flex items-end justify-center space-x-1">
        {audioLevels.map((level, index) => (
          <div
            key={index}
            className="bg-gradient-to-t from-cyan-500 to-purple-500 rounded-full transition-all duration-100"
            style={{
              width: '4px',
              height: `${Math.max(4, (level / 100) * 96)}px`,
              opacity: state.isListening ? 0.8 : 0.3,
            }}
          ></div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-slate-400">
          {state.isListening ? 'Listening for voice commands...' :
           state.isProcessing ? 'Processing your request...' :
           'Voice recognition ready'}
        </p>
      </div>
    </div>
  );
};

export default VoiceVisualizer;