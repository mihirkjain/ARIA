import React from 'react';
import { AssistantProvider } from './contexts/AssistantContext';
import { DeviceProvider } from './contexts/DeviceContext';
import MainInterface from './components/MainInterface';

function App() {
  return (
    <DeviceProvider>
      <AssistantProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
          <MainInterface />
        </div>
      </AssistantProvider>
    </DeviceProvider>
  );
}

export default App;