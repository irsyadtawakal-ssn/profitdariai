'use client';

import { useState, useEffect, useCallback } from 'react';
import { PengaturanForm } from './PengaturanForm';
import { MonitoringDashboard } from './monitoring-dashboard';
import { getSettings } from './actions';

export default function PengaturanPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'monitoring'>('general');
  const [settings, setSettings] = useState({ meta_pixel_id: '', meta_capi_token: '' });
  const [loading, setLoading] = useState(true);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getSettings();
      setSettings({
        meta_pixel_id: data.meta_pixel_id ?? '',
        meta_capi_token: data.meta_capi_token ?? '',
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSettings();
  }, [loadSettings]);

  if (loading) {
    return (
      <div className="p-6 md:p-10">
        <div className="text-center">Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10">
      <header className="mb-8">
        <h1 className="font-mono text-xs text-[#888888] uppercase tracking-[0.15em] mb-1">Pengaturan</h1>
        <h2 className="text-2xl font-bold text-ivory">Tracking & Pixel</h2>
        <p className="text-sm text-[#888888] mt-2">
          Konfigurasi Meta Pixel untuk tracking konversi iklan Facebook & Instagram.
        </p>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-gold/20 mb-6">
        <button
          onClick={() => setActiveTab('general')}
          className={`px-6 py-3 font-mono text-sm uppercase tracking-wider transition ${
            activeTab === 'general'
              ? 'text-gold border-b-2 border-gold'
              : 'text-[#888888] hover:text-ivory'
          }`}
        >
          General Settings
        </button>
        <button
          onClick={() => setActiveTab('monitoring')}
          className={`px-6 py-3 font-mono text-sm uppercase tracking-wider transition ${
            activeTab === 'monitoring'
              ? 'text-gold border-b-2 border-gold'
              : 'text-[#888888] hover:text-ivory'
          }`}
        >
          Event Monitoring
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <section className="border border-gold/20 bg-[#0E0E0E]/60 p-6 md:p-8 cyber-corner">
          <h3 className="font-mono text-sm text-gold uppercase tracking-wider mb-6">Meta (Facebook) Pixel</h3>
          <PengaturanForm
            pixelId={settings.meta_pixel_id}
            capiToken={settings.meta_capi_token}
            onSaveSuccess={loadSettings}
          />
        </section>
      )}

      {activeTab === 'monitoring' && (
        <section className="border border-gold/20 bg-[#0E0E0E]/60 p-6 md:p-8 cyber-corner">
          <MonitoringDashboard />
        </section>
      )}
    </div>
  );
}
