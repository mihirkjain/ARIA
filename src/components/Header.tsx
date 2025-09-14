import React from 'react';
import { Brain, Smartphone, Settings, Mic, MicOff } from 'lucide-react';
import { useAssistant } from '../contexts/AssistantContext';
import { useDevices } from '../contexts/DeviceContext';

interface HeaderProps {
  activePanel: 'chat' | 'devices' | 'settings';
  setActivePanel: (panel: 'chat' | 'devices' | 'settings') => void;
}

const Header: React.FC<HeaderProps> = ({ activePanel, setActivePanel }) => {
  const { state, toggleVoice } = useAssistant();
  const { syncStatus, devices } = useDevices();

  const onlineDevices = devices.filter(d => d.status === 'online').length;

  return (
    <header className="bg-slate-900/80 backdrop-blur-sm border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Brain className="h-8 w-8 text-cyan-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">ARIA</h1>
                <p className="text-xs text-slate-400">Advanced Responsive Intelligence Assistant</p>
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActivePanel('chat')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activePanel === 'chat'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setActivePanel('devices')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2 ${
                activePanel === 'devices'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Smartphone className="h-4 w-4" />
              <span>Devices</span>
              <span className="bg-emerald-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {onlineDevices}
              </span>
            </button>
            <button
              onClick={() => setActivePanel('settings')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                activePanel === 'settings'
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Settings className="h-4 w-4" />
            </button>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={toggleVoice}
              className={`p-2 rounded-lg transition-all ${
                state.isVoiceEnabled
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800/50 text-slate-400 hover:text-white'
              }`}
              title={`Voice ${state.isVoiceEnabled ? 'Enabled' : 'Disabled'}`}
            >
              {state.isVoiceEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
            </button>
            
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                syncStatus === 'synced' ? 'bg-emerald-400' :
                syncStatus === 'syncing' ? 'bg-yellow-400 animate-pulse' :
                'bg-red-400'
              }`}></div>
              <span className="text-xs text-slate-400 hidden sm:inline">
                {syncStatus === 'synced' ? 'Synced' :
                 syncStatus === 'syncing' ? 'Syncing...' :
                 'Error'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;