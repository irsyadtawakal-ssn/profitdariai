'use client';

import { useEffect, useState } from 'react';
import { EventAnalytics } from '@/lib/types/pixel';
import { ConversionFunnel } from './conversion-funnel';
import { BarChart3, RefreshCw, AlertCircle } from 'lucide-react';

export function MonitoringDashboard() {
  const [analytics, setAnalytics] = useState<EventAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, [days]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`/api/events/analytics?days=${days}`);
      if (!response.ok) throw new Error('Failed to fetch analytics');

      const data = await response.json();
      setAnalytics(data.data);
    } catch (err) {
      setError('Failed to load analytics');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="monitoring-dashboard space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-gold" />
          <div>
            <h2 className="font-display font-extrabold text-gold text-2xl uppercase tracking-tight">
              Event Monitoring
            </h2>
            <p className="font-mono text-[#888888] text-xs mt-1">Track your customer journey conversion</p>
          </div>
        </div>

        {/* Time Period Buttons */}
        <div className="flex gap-2">
          {[7, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 font-mono text-xs font-semibold transition-all cyber-corner ${
                days === d
                  ? 'bg-gold text-obsidian border border-gold'
                  : 'border border-[#2A2A2A] text-ivory hover:border-gold/50 active:scale-95'
              }`}
            >
              {d}D
            </button>
          ))}
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 border border-gold/40 text-gold hover:bg-gold/10 font-mono text-xs font-semibold transition-all cyber-corner flex items-center gap-2 active:scale-95"
          >
            <RefreshCw className="w-3 h-3" />
            REFRESH
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="glass-panel p-4 cyber-corner border-red-500/30 bg-red-500/5 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="font-mono text-xs text-red-300 font-semibold">ERROR</p>
            <p className="font-mono text-xs text-red-200 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="glass-panel p-16 cyber-corner flex flex-col items-center justify-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
          <p className="font-mono text-sm text-[#888888]">Loading analytics...</p>
        </div>
      ) : analytics ? (
        <div className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Form Submits */}
            <div className="glass-panel p-6 cyber-corner relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-mono text-[9px] text-[#888888] tracking-widest uppercase font-bold mb-2">
                    Form Submits
                  </p>
                  <p className="font-display text-gold text-4xl font-extrabold leading-none">
                    {analytics.total_form_submit}
                  </p>
                </div>
                <span className="text-2xl">📝</span>
              </div>
              <div className="h-1 w-16 bg-gradient-to-r from-gold to-[#E8C84A]" />
              <div className="absolute -bottom-3 -right-3 opacity-5 group-hover:opacity-10 transition-opacity">
                <BarChart3 className="w-20 h-20 text-gold" />
              </div>
            </div>

            {/* Pending Payments */}
            <div className="glass-panel p-6 cyber-corner relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-mono text-[9px] text-[#888888] tracking-widest uppercase font-bold mb-2">
                    Pending Payments
                  </p>
                  <p className="font-display text-gold text-4xl font-extrabold leading-none">
                    {analytics.total_pending_payment}
                  </p>
                </div>
                <span className="text-2xl">⏳</span>
              </div>
              <div className="h-1 w-16 bg-gradient-to-r from-gold to-[#E8C84A]" />
              <div className="absolute -bottom-3 -right-3 opacity-5 group-hover:opacity-10 transition-opacity">
                <BarChart3 className="w-20 h-20 text-gold" />
              </div>
            </div>

            {/* Completed Checkouts */}
            <div className="glass-panel p-6 cyber-corner relative overflow-hidden group">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="font-mono text-[9px] text-[#888888] tracking-widest uppercase font-bold mb-2">
                    Completed Checkouts
                  </p>
                  <p className="font-display text-gold text-4xl font-extrabold leading-none">
                    {analytics.total_checkout_complete}
                  </p>
                </div>
                <span className="text-2xl">✓</span>
              </div>
              <div className="h-1 w-16 bg-gradient-to-r from-gold to-[#E8C84A]" />
              <div className="absolute -bottom-3 -right-3 opacity-5 group-hover:opacity-10 transition-opacity">
                <BarChart3 className="w-20 h-20 text-gold" />
              </div>
            </div>
          </div>

          {/* Funnel Visualization */}
          <div className="glass-panel p-7 cyber-corner">
            <ConversionFunnel analytics={analytics} />
          </div>

          {/* Daily Breakdown Table */}
          <div className="glass-panel p-7 cyber-corner">
            <h3 className="font-mono text-[10px] text-[#888888] tracking-widest uppercase font-bold mb-6">
              Daily Breakdown
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs font-mono">
                <thead>
                  <tr className="border-b border-[#2A2A2A]">
                    <th className="text-left p-3 text-[#888888] font-bold uppercase tracking-wider">Date</th>
                    <th className="text-right p-3 text-[#888888] font-bold uppercase tracking-wider">Form Submit</th>
                    <th className="text-right p-3 text-[#888888] font-bold uppercase tracking-wider">Pending</th>
                    <th className="text-right p-3 text-[#888888] font-bold uppercase tracking-wider">Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.events_by_date.map((day, idx) => (
                    <tr key={idx} className="border-b border-[#1A1A1A] hover:bg-[#111111]/50 transition-colors">
                      <td className="p-3 text-ivory font-semibold">{day.date}</td>
                      <td className="text-right p-3 text-gold font-bold">{day.form_submit}</td>
                      <td className="text-right p-3 text-[#E8C84A] font-bold">{day.pending_payment}</td>
                      <td className="text-right p-3 text-ivory font-bold">{day.checkout_complete}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
