'use client';

import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity } from 'lucide-react';

export default function AnalyticsChart() {
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch('/api/analytics');
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (e) {
        console.error('Failed to fetch analytics', e);
      }
    }
    fetchAnalytics();
    
    // Refresh interval
    const interval = setInterval(fetchAnalytics, 15000);
    return () => clearInterval(interval);
  }, []);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#020202] border border-[#D9005B]/30 p-4 rounded-xl shadow-[0_0_20px_rgba(217,0,91,0.2)]">
          <p className="text-[#888888] text-sm mb-1">{label}</p>
          <p className="text-[#D9005B] font-bold text-lg">
            {payload[0].value.toLocaleString('cs-CZ')} <span className="text-sm font-normal text-white">API ověření</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-panel p-6 w-full animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Activity className="text-[#D9005B]" /> Zátěž Trust API (Ověření identit)
        </h2>
        <div className="text-xs font-bold uppercase tracking-wider text-[#D9005B] bg-[#D9005B]/10 px-3 py-1 rounded-full border border-[#D9005B]/20">
          Live Telemetry
        </div>
      </div>
      
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: -20,
              bottom: 0,
            }}
          >
            <defs>
              <linearGradient id="colorAttacks" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#D9005B" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#D9005B" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#888888" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
              minTickGap={20}
            />
            <YAxis 
              stroke="#888888" 
              fontSize={12} 
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="calls" 
              stroke="#D9005B" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorAttacks)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
