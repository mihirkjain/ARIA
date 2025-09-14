import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Trash2 } from 'lucide-react';
import { useAssistant } from '../contexts/AssistantContext';

const ChatInterface: React.FC = () => {
  const [input, setInput] = useState('');
  const { state, sendMessage, startListening, stopListening, clearHistory } = useAssistant();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [state.messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !state.isProcessing) {
      sendMessage(input.trim());
      setInput('');
    }
  };

  const handleVoiceToggle = () => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700">
      <div className="flex items-center justify-between p-4 border-b border-slate-700">
        <div>
          <h2 className="text-lg font-semibold text-white">AI Assistant Chat</h2>
          <p className="text-sm text-slate-400">Your intelligent companion across all devices</p>
        </div>
        <button
          onClick={clearHistory}
          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
          title="Clear chat history"
        >
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {state.messages.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-purple-500 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Mic className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Welcome to ARIA</h3>
            <p className="text-slate-400 max-w-md mx-auto">
              I'm ARIA - your Advanced Responsive Intelligence Assistant. I can monitor your system, 
              manage devices, search the internet, and help with any task. Try asking about your GPU usage, 
              Elon Musk, or say "what can you do?"
            </p>
          </div>
        ) : (
          state.messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-3xl px-4 py-3 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                    : 'bg-slate-700/50 text-slate-100 border border-slate-600'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
                <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                  <span>
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                  {message.deviceId && (
                    <span className="ml-2 px-2 py-1 bg-black/20 rounded">
                      {message.sender === 'user' ? 'You' : 'ARIA'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
        
        {state.isProcessing && (
          <div className="flex justify-start">
            <div className="bg-slate-700/50 border border-slate-600 px-4 py-3 rounded-2xl">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-slate-300 text-sm">Processing...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={state.isListening ? "Listening..." : "Type your message..."}
              className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
              disabled={state.isProcessing || state.isListening}
            />
            {state.isListening && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
          
          <button
            type="button"
            onClick={handleVoiceToggle}
            className={`p-3 rounded-xl transition-all ${
              state.isListening
                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                : 'bg-slate-700/50 text-slate-400 hover:text-white border border-slate-600'
            }`}
            title={state.isListening ? "Stop listening" : "Start voice input"}
          >
            {state.isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          </button>
          
          <button
            type="submit"
            disabled={!input.trim() || state.isProcessing || state.isListening}
            className="p-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            title="Send message"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;