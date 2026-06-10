'use client';

import { EventAnalytics } from '@/lib/types/pixel';

interface ConversionFunnelProps {
  analytics: EventAnalytics;
}

export function ConversionFunnel({ analytics }: ConversionFunnelProps) {
  const stages = [
    {
      label: 'Form Submit',
      value: analytics.total_form_submit,
      percentage: 100,
    },
    {
      label: 'Pending Payment',
      value: analytics.total_pending_payment,
      percentage: analytics.form_to_pending_rate,
    },
    {
      label: 'Checkout Complete',
      value: analytics.total_checkout_complete,
      percentage: analytics.pending_to_checkout_rate,
    },
  ];

  return (
    <div className="conversion-funnel">
      <h3 className="text-lg font-bold mb-6">Customer Journey Funnel</h3>

      <div className="space-y-4">
        {stages.map((stage, idx) => (
          <div key={idx} className="funnel-stage">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">{stage.label}</span>
              <span className="text-sm text-gray-600">
                {stage.value} users ({stage.percentage.toFixed(1)}%)
              </span>
            </div>

            <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300 flex items-center justify-center"
                style={{ width: `${stage.percentage}%` }}
              >
                {stage.percentage > 20 && (
                  <span className="text-white text-sm font-semibold">
                    {stage.percentage.toFixed(1)}%
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Conversion Rate Summary */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-semibold mb-3">Conversion Metrics</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Form → Pending</p>
            <p className="text-2xl font-bold text-blue-600">
              {analytics.form_to_pending_rate.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Pending → Checkout</p>
            <p className="text-2xl font-bold text-green-600">
              {analytics.pending_to_checkout_rate.toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Overall Conversion</p>
            <p className="text-2xl font-bold text-purple-600">
              {analytics.overall_conversion_rate.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
