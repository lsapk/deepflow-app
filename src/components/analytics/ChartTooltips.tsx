
import React from 'react';

export const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border p-2 rounded-md shadow-md">
        <p className="font-medium">{`${label}`}</p>
        {payload.map((entry: any, index: number) => (
          <p key={`item-${index}`} style={{ color: entry.color || entry.fill }}>
            {`${entry.name}: ${entry.value}`}
          </p>
        ))}
      </div>
    );
  }

  return null;
};

export const MoodTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const mood = payload[0].value;
    return (
      <div className="bg-background border border-border p-2 rounded-md shadow-md">
        <p className="font-medium">{`${label}`}</p>
        <p style={{ color: getMoodColor(mood) }}>
          {`Humeur: ${getMoodText(mood)}`}
        </p>
      </div>
    );
  }

  return null;
};

export const RenderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = 25 + innerRadius + (outerRadius - innerRadius);
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="#888888" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${name} (${(percent * 100).toFixed(0)}%)`}
    </text>
  );
};

export const getMoodText = (mood: number) => {
  switch (mood) {
    case 1: return 'Terrible';
    case 2: return 'Mauvais';
    case 3: return 'Neutre';
    case 4: return 'Bien';
    case 5: return 'Excellent';
    default: return 'Inconnu';
  }
};

export const getMoodColor = (mood: number) => {
  switch (mood) {
    case 1: return '#ef4444';
    case 2: return '#f97316';
    case 3: return '#facc15';
    case 4: return '#84cc16';
    case 5: return '#10b981';
    default: return '#a1a1aa';
  }
};
