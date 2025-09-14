import React, { useState } from 'react';
import Header from './Header';
import ChatInterface from './ChatInterface';
import DevicePanel from './DevicePanel';
import VoiceVisualizer from './VoiceVisualizer';
import SettingsPanel from './SettingsPanel';
import SystemMonitor from './SystemMonitor';
import { useAssistant } from '../contexts/AssistantContext';

const MainInterface: React.FC = () => {
  const [activePanel, setActivePanel] = useState<'chat' | 'devices' | 'settings'>('chat');
  const { state } = useAssistant();

  return (
    <div className="min-h-screen flex flex-col">
      <Header activePanel={activePanel} setActivePanel={setActivePanel} />
      
      <main className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full p-4 gap-6">
        <div className="flex-1 flex flex-col">
          {activePanel === 'chat' && <ChatInterface />}
          {activePanel === 'devices' && <DevicePanel />}
          {activePanel === 'settings' && <SettingsPanel />}
        </div>
        
        {activePanel === 'chat' && (
          <div className="lg:w-80 flex flex-col gap-4">
            <VoiceVisualizer />
            <SystemMonitor />
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
              <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Messages Today</span>
                  <span className="text-cyan-400 font-semibold">{state.messages.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Voice Mode</span>
                  <span className={`font-semibold ${state.isVoiceEnabled ? 'text-emerald-400' : 'text-slate-400'}`}>
                    {state.isVoiceEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Status</span>
                  <span className="text-emerald-400 font-semibold">
                    {state.isListening ? 'Listening' : state.isProcessing ? 'Processing' : 'Ready'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MainInterface;