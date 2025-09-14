import React, { useState } from 'react';
import { Save, Volume2, VolumeX, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useAssistant } from '../contexts/AssistantContext';

const SettingsPanel: React.FC = () => {
  const { state, updatePreferences, clearHistory, toggleVoice } = useAssistant();
  const [settings, setSettings] = useState({
    voiceSpeed: 0.9,
    voicePitch: 1.1,
    theme: 'dark',
    notifications: true,
    autoSync: true,
    privacyMode: false,
    learningMode: true,
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const saveSettings = () => {
    updatePreferences(settings);
    // You would typically show a success message here
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h2 className="text-2xl font-bold text-white mb-6">Assistant Settings</h2>

        <div className="space-y-6">
          {/* Voice Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
              Voice & Audio
            </h3>
            
            <div className="flex items-center justify-between">
              <label className="text-slate-300">Voice Output</label>
              <button
                onClick={toggleVoice}
                className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-all ${
                  state.isVoiceEnabled
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-700/50 text-slate-400 border border-slate-600'
                }`}
              >
                {state.isVoiceEnabled ? (
                  <>
                    <Volume2 className="h-4 w-4" />
                    <span>Enabled</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="h-4 w-4" />
                    <span>Disabled</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-slate-300 text-sm">Voice Speed</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.voiceSpeed}
                onChange={(e) => handleSettingChange('voiceSpeed', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-xs text-slate-400">{settings.voiceSpeed}x</div>
            </div>

            <div className="space-y-2">
              <label className="text-slate-300 text-sm">Voice Pitch</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={settings.voicePitch}
                onChange={(e) => handleSettingChange('voicePitch', parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="text-xs text-slate-400">{settings.voicePitch}</div>
            </div>
          </div>

          {/* Privacy Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
              Privacy & Learning
            </h3>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-slate-300">Privacy Mode</label>
                <p className="text-xs text-slate-400">Disable data collection and learning</p>
              </div>
              <button
                onClick={() => handleSettingChange('privacyMode', !settings.privacyMode)}
                className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-all ${
                  settings.privacyMode
                    ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                    : 'bg-slate-700/50 text-slate-400 border border-slate-600'
                }`}
              >
                {settings.privacyMode ? (
                  <>
                    <EyeOff className="h-4 w-4" />
                    <span>Private</span>
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4" />
                    <span>Learning</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-slate-300">Adaptive Learning</label>
                <p className="text-xs text-slate-400">Allow AI to learn from interactions</p>
              </div>
              <input
                type="checkbox"
                checked={settings.learningMode}
                onChange={(e) => handleSettingChange('learningMode', e.target.checked)}
                className="w-4 h-4 text-cyan-500 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500 focus:ring-2"
              />
            </div>
          </div>

          {/* System Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white border-b border-slate-700 pb-2">
              System
            </h3>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-slate-300">Auto-Sync Devices</label>
                <p className="text-xs text-slate-400">Automatically sync data across devices</p>
              </div>
              <input
                type="checkbox"
                checked={settings.autoSync}
                onChange={(e) => handleSettingChange('autoSync', e.target.checked)}
                className="w-4 h-4 text-cyan-500 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500 focus:ring-2"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="text-slate-300">Push Notifications</label>
                <p className="text-xs text-slate-400">Receive system and update notifications</p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                className="w-4 h-4 text-cyan-500 bg-slate-700 border-slate-600 rounded focus:ring-cyan-500 focus:ring-2"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4 pt-4 border-t border-slate-700">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={saveSettings}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg hover:from-cyan-600 hover:to-blue-600 transition-all"
              >
                <Save className="h-4 w-4" />
                <span>Save Settings</span>
              </button>

              <button
                onClick={clearHistory}
                className="flex items-center justify-center space-x-2 px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg hover:bg-red-500/30 transition-all"
              >
                <Trash2 className="h-4 w-4" />
                <span>Clear Chat History</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* System Info */}
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Version:</span>
              <span className="text-white">ARIA v2.1.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Model:</span>
              <span className="text-white">Advanced Neural Network</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Last Update:</span>
              <span className="text-white">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Messages:</span>
              <span className="text-white">{state.messages.length}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Storage Used:</span>
              <span className="text-white">2.4 MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Uptime:</span>
              <span className="text-white">24h 15m</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;