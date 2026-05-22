'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#00e5c3', '#00b4d8', '#2ed573', '#ffa502', '#ff4757', '#8892a4'];

export function StorageDonut({ data }: { data: Array<{ name: string; value: number }> }) {
  return (
    <div className="h-80 w-full rounded-xl border border-border bg-secondary p-3">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={72} outerRadius={110} paddingAngle={2}>
            {data.map((entry, index) => <Cell key={`${entry.name}-${index}`} fill={COLORS[index % COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1e293b', color: '#e8ecf1' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}