
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomTooltip, RenderCustomizedLabel } from '../ChartTooltips';
import { timeUsageData } from '../ChartData';

interface TimeUsageChartProps {
  dataLoaded: boolean;
}

export const TimeUsageChart: React.FC<TimeUsageChartProps> = ({ dataLoaded }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Utilisation du Temps</CardTitle>
        <CardDescription>
          Répartition de votre temps entre les différentes activités
        </CardDescription>
      </CardHeader>
      <CardContent>
        {dataLoaded ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={timeUsageData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={RenderCustomizedLabel}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {timeUsageData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
