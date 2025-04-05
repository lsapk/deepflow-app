
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomTooltip } from '../ChartTooltips';
import { focusSessionsData } from '../ChartData';

interface FocusSessionsChartProps {
  dataLoaded: boolean;
}

export const FocusSessionsChart: React.FC<FocusSessionsChartProps> = ({ dataLoaded }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sessions de Focus</CardTitle>
        <CardDescription>
          Nombre de sessions par jour
        </CardDescription>
      </CardHeader>
      <CardContent>
        {dataLoaded ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={focusSessionsData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="sessions" name="Sessions" fill="#60a5fa" />
            </BarChart>
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
