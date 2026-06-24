import React, { useState } from 'react';
import { 
  History, 
  Lock, 
  User, 
  BarChart3, 
  Calendar, 
  Clock, 
  Plane,
  AlertCircle,
  Loader2,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

interface AeroGestStatsProps {
  onDataLoaded: (data: any) => void;
}

export const AeroGestStats: React.FC<AeroGestStatsProps> = ({ onDataLoaded }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<any>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/aerogest/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed. Please check your credentials.');
      }

      const data = await response.json();
      setStats(data.logs);
      onDataLoaded(data.logs);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (stats) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            label="Total Hours" 
            value={calculateTotalHours(stats)} 
            icon={<Clock className="w-5 h-5 text-blue-500" />} 
          />
          <StatCard 
            label="Total Flights" 
            value={stats.length} 
            icon={<Plane className="w-5 h-5 text-indigo-500" />} 
          />
          <StatCard 
            label="Last Flight" 
            value={stats[0]?.date || 'N/A'} 
            icon={<Calendar className="w-5 h-5 text-emerald-500" />} 
          />
        </div>

        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-200">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Flight History</h2>
            </div>
            <a 
              href="https://online.aerogest.fr" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1"
            >
              Open AeroGest <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] transition-colors">
                <tr>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Aircraft</th>
                  <th className="px-6 py-4">Route</th>
                  <th className="px-6 py-4">Duration</th>
                  <th className="px-6 py-4">Nature</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {stats.slice(0, 10).map((flight: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-600 dark:text-slate-300">{flight.date}</td>
                    <td className="px-6 py-4">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded-md font-mono font-bold text-xs">
                        {flight.aircraft}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">
                      {flight.dep} <ChevronRight className="inline w-3 h-3 mx-1" /> {flight.arr}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-blue-600 dark:text-blue-400">{flight.time}</td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                        {flight.nature}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl shadow-slate-200 dark:shadow-none border border-slate-200 dark:border-slate-800 transition-colors duration-200"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/30 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
            <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">AeroGest Login</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Connect your AeroGest Online account to sync your flight logs and statistics.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-1.5">
                <User className="w-3 h-3" />
                Username
              </label>
              <input 
                type="text" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                placeholder="e.g. yannick.teresiak"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 flex items-center gap-1.5">
                <Lock className="w-3 h-3" />
                Password
              </label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none transition-all dark:text-white"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/50 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400 leading-relaxed">{error}</p>
            </div>
          )}

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Authenticating...
              </>
            ) : (
              <>
                Sign In to AeroGest
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Secure Connection</p>
          <p className="text-[10px] text-slate-400 mt-1">Your credentials are never stored and are only used to proxy the AeroGest API.</p>
        </div>
      </motion.div>
    </div>
  );
};

function StatCard({ label, value, icon }: any) {
  return (
    <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
        {icon}
      </div>
      <h3 className="text-2xl font-black text-slate-900 dark:text-white">{value}</h3>
    </div>
  );
}

function calculateTotalHours(logs: any[]) {
  let totalMinutes = 0;
  logs.forEach(log => {
    const [h, m] = log.time.split(':').map(Number);
    totalMinutes += h * 60 + m;
  });
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h${minutes.toString().padStart(2, '0')}`;
}
