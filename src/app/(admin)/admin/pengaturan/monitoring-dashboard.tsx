'use client';

import { useEffect, useState } from 'react';
import { EventAnalytics } from '@/lib/types/pixel';
import { ConversionFunnel } from './conversion-funnel';

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
    <div className="monitoring-dashboard p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Event Monitoring</h2>

        <div className="flex gap-2">
          {[7, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded ${
                days === d
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
              }`}
            >
              Last {d} days
            </button>
          ))}
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading analytics...</div>
      ) : analytics ? (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-white border rounded-lg shadow">
              <p className="text-sm text-gray-600">Total Form Submits</p>
              <p className="text-3xl font-bold text-blue-600">
                {analytics.total_form_submit}
              </p>
            </div>
            <div className="p-4 bg-white border rounded-lg shadow">
              <p className="text-sm text-gray-600">Pending Payments</p>
              <p className="text-3xl font-bold text-yellow-600">
                {analytics.total_pending_payment}
              </p>
            </div>
            <div className="p-4 bg-white border rounded-lg shadow">
              <p className="text-sm text-gray-600">Completed Checkouts</p>
              <p className="text-3xl font-bold text-green-600">
                {analytics.total_checkout_complete}
              </p>
            </div>
          </div>

          {/* Funnel Visualization */}
          <div className="p-6 bg-white border rounded-lg shadow">
            <ConversionFunnel analytics={analytics} />
          </div>

          {/* Events Timeline */}
          <div className="p-6 bg-white border rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">Daily Breakdown</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b">
                  <tr>
                    <th className="text-left p-2">Date</th>
                    <th className="text-right p-2">Form Submit</th>
                    <th className="text-right p-2">Pending Payment</th>
                    <th className="text-right p-2">Checkout Complete</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.events_by_date.map((day, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="p-2">{day.date}</td>
                      <td className="text-right p-2">{day.form_submit}</td>
                      <td className="text-right p-2">{day.pending_payment}</td>
                      <td className="text-right p-2">{day.checkout_complete}</td>
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
