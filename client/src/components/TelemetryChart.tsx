import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface TelemetryChartProps {
  data: { timestamp: string; value: number }[];
  title: string;
  unit: string;
  color?: string;
  baseline?: number;
  height?: number;
}

export function TelemetryChart({ data, title, unit, color = '#0d9488', baseline, height = 200 }: TelemetryChartProps) {
  const chartData = data.map((d) => ({
    ...d,
    time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }));

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">{title}</h3>
      <ResponsiveContainer width="100%" height={height}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="time" tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" />
          <Tooltip
            contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
            formatter={(value) => [`${value} ${unit}`, title]}
          />
          {baseline && (
            <ReferenceLine y={baseline} stroke="#94a3b8" strokeDasharray="5 5" label={{ value: 'Baseline', position: 'right', fontSize: 10 }} />
          )}
          <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
