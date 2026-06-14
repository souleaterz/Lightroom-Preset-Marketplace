'use client'

import React from 'react'
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  AreaChart,
} from 'recharts'
import { formatPrice } from '@/lib/utils'

interface RevenueChartProps {
  data: { date: string; revenue: number }[]
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1a1f] border border-white/10 rounded-lg px-3 py-2 shadow-xl">
        <p className="text-xs text-[#888891] mb-1">{label}</p>
        <p className="text-sm font-semibold text-[#f0f0f0]">{formatPrice(payload[0].value * 100)}</p>
      </div>
    )
  }
  return null
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
        <defs>
          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7c5cfc" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#7c5cfc" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fill: '#888891', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: '#888891', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `£${v}`}
          width={40}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="revenue"
          stroke="#7c5cfc"
          strokeWidth={2}
          fill="url(#revenueGradient)"
          dot={false}
          activeDot={{ r: 4, fill: '#7c5cfc', strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
