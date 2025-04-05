
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomTooltip } from '../ChartTooltips';
import { habitsComplianceData } from '../ChartData';

interface HabitsComplianceChartProps {
  dataLoaded: boolean;
}

export const HabitsComplianceChart: React.FC<HabitsComplianceChartProps> = ({ dataLoaded }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Suivi des Habitudes</CardTitle>
        <CardDescription>
          Taux de complétion des habitudes
        </CardDescription>
      </CardHeader>
      <CardContent>
        {dataLoaded ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={habitsComplianceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {habitsComplianceData.map((entry, index) => (
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
