'use client';

import { EventAnalytics } from '@/lib/types/pixel';
import { TrendingUp } from 'lucide-react';

interface ConversionFunnelProps {
  analytics: EventAnalytics;
}

export function ConversionFunnel({ analytics }: ConversionFunnelProps) {
  const stages = [
    {
      label: 'Form Submit',
      value: analytics.total_form_submit,
      percentage: 100,
      icon: '📝',
    },
    {
      label: 'Pending Payment',
      value: analytics.total_pending_payment,
      percentage: analytics.form_to_pending_rate,
      icon: '⏳',
    },
    {
      label: 'Checkout Complete',
      value: analytics.total_checkout_complete,
      percentage: analytics.pending_to_checkout_rate,
      icon: '✓',
    },
  ];

  return (
    <div className="conversion-funnel space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <TrendingUp className="w-5 h-5 text-gold" />
        <h3 className="font-display font-bold text-ivory text-xl">Customer Journey Funnel</h3>
      </div>

      <div className="space-y-5">
        {stages.map((stage, idx) => (
          <div key={idx} className="funnel-stage">
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{stage.icon}</span>
                <span className="font-mono text-ivory text-sm font-semibold tracking-wider uppercase">
                  {stage.label}
                </span>
              </div>
              <span className="font-mono text-[#888888] text-xs">
                <span className="text-gold font-bold">{stage.value}</span> users
              </span>
            </div>

            <div className="w-full bg-[#1A1A1A] rounded-sm h-10 overflow-hidden border border-[#2A2A2A] relative">
              <div
                className="bg-gradient-to-r from-gold to-[#E8C84A] h-full transition-all duration-500 flex items-center justify-end pr-3"
                style={{ width: `${stage.percentage}%` }}
              >
                {stage.percentage > 15 && (
                  <span className="font-mono text-obsidian text-xs font-bold">
                    {stage.percentage.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Conversion Rate Summary */}
      <div className="glass-panel p-5 cyber-corner mt-8 space-y-4">
        <h4 className="font-mono text-[10px] text-[#888888] tracking-widest uppercase font-bold">
          Conversion Metrics
        </h4>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="font-mono text-[9px] text-[#888888] tracking-wider uppercase">Form → Pending</p>
            <p className="font-display text-gold text-3xl font-extrabold">
              {analytics.form_to_pending_rate.toFixed(1)}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-mono text-[9px] text-[#888888] tracking-wider uppercase">Pending → Checkout</p>
            <p className="font-display text-gold text-3xl font-extrabold">
              {analytics.pending_to_checkout_rate.toFixed(1)}%
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-mono text-[9px] text-[#888888] tracking-wider uppercase">Overall Conversion</p>
            <p className="font-display text-gold text-3xl font-extrabold">
              {analytics.overall_conversion_rate.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
