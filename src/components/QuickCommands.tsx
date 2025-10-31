import React, { useState } from 'react';
import { Star, Zap, Terminal, FolderOpen, BarChart3 } from 'lucide-react';
import { useSystem } from '../contexts/SystemContext';

interface QuickCommand {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  action: () => Promise<void>;
  isFavorite: boolean;
}

const QuickCommands: React.FC = () => {
  const { refreshSystemStats, refreshProcesses, refreshDisks } = useSystem();
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState<string | null>(null);

  const commands: QuickCommand[] = [
    {
      id: 'system-stats',
      label: 'System Stats',
      description: 'Refresh system statistics',
      icon: <BarChart3 className="h-5 w-5" />,
      action: refreshSystemStats,
      isFavorite: favorites.has('system-stats'),
    },
    {
      id: 'processes',
      label: 'Processes',
      description: 'Update running processes list',
      icon: <Zap className="h-5 w-5" />,
      action: refreshProcesses,
      isFavorite: favorites.has('processes'),
    },
    {
      id: 'disk-usage',
      label: 'Disk Usage',
      description: 'Check disk space',
      icon: <FolderOpen className="h-5 w-5" />,
      action: refreshDisks,
      isFavorite: favorites.has('disk-usage'),
    },
  ];

  const handleExecute = async (cmd: QuickCommand) => {
    setLoading(cmd.id);
    try {
      await cmd.action();
    } catch (error) {
      console.error(`Failed to execute ${cmd.label}:`, error);
    } finally {
      setLoading(null);
    }
  };

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const newFavs = new Set(prev);
      if (newFavs.has(id)) {
        newFavs.delete(id);
      } else {
        newFavs.add(id);
      }
      return newFavs;
    });
  };

  const favoriteCommands = commands.filter(c => favorites.has(c.id));
  const otherCommands = commands.filter(c => !favorites.has(c.id));

  return (
    <div className="space-y-4">
      {/* Favorites Section */}
      {favoriteCommands.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 px-4 py-2">
            <Star className="h-4 w-4 text-yellow-400" />
            <span className="text-sm text-slate-300 font-medium">Quick Access</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {favoriteCommands.map(cmd => (
              <button
                key={cmd.id}
                onClick={() => handleExecute(cmd)}
                disabled={loading !== null}
                className="group relative p-4 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/50 rounded-xl hover:from-cyan-500/30 hover:to-blue-500/30 transition-all disabled:opacity-50"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="text-cyan-400">{cmd.icon}</div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(cmd.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  </button>
                </div>
                <div className="text-left">
                  <div className="text-white font-medium text-sm">{cmd.label}</div>
                  <div className="text-slate-400 text-xs">{cmd.description}</div>
                </div>
                {loading === cmd.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                    <div className="animate-spin">⟳</div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Other Commands */}
      {otherCommands.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 px-4 py-2">
            <Terminal className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-400 font-medium">Commands</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {otherCommands.map(cmd => (
              <button
                key={cmd.id}
                onClick={() => handleExecute(cmd)}
                disabled={loading !== null}
                className="group relative p-4 bg-slate-800/50 border border-slate-700 rounded-xl hover:border-slate-600 transition-all disabled:opacity-50"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="text-slate-400 group-hover:text-white transition-colors">
                    {cmd.icon}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(cmd.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Star className="h-4 w-4 text-slate-500 hover:text-yellow-400" />
                  </button>
                </div>
                <div className="text-left">
                  <div className="text-white font-medium text-sm">{cmd.label}</div>
                  <div className="text-slate-500 text-xs">{cmd.description}</div>
                </div>
                {loading === cmd.id && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl">
                    <div className="animate-spin">⟳</div>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickCommands;
