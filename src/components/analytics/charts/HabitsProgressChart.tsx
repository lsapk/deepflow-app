
import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomTooltip } from '../ChartTooltips';

interface HabitsProgressChartProps {
  dataLoaded: boolean;
}

export const HabitsProgressChart: React.FC<HabitsProgressChartProps> = ({ dataLoaded }) => {
  const progressData = [
    { day: 'Semaine 1', rate: 65 },
    { day: 'Semaine 2', rate: 68 },
    { day: 'Semaine 3', rate: 70 },
    { day: 'Semaine 4', rate: 72 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Progrès des Habitudes</CardTitle>
        <CardDescription>
          Évolution du taux de complétion au fil du temps
        </CardDescription>
      </CardHeader>
      <CardContent>
        {dataLoaded ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={progressData}
              margin={{
                top: 10,
                right: 30,
                left: 0,
                bottom: 0,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="rate" stroke="#4ade80" fill="#4ade8080" name="Taux de complétion (%)" />
            </AreaChart>
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
