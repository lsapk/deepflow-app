
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MoodTooltip } from '../ChartTooltips';
import { moodData } from '../ChartData';

interface MoodChartProps {
  dataLoaded: boolean;
}

export const MoodChart: React.FC<MoodChartProps> = ({ dataLoaded }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Suivi de l'Humeur</CardTitle>
        <CardDescription>
          Évolution de votre humeur au fil du temps
        </CardDescription>
      </CardHeader>
      <CardContent>
        {dataLoaded ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={moodData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
              <Tooltip content={<MoodTooltip />} />
              <Line 
                type="monotone" 
                dataKey="mood" 
                stroke="#10b981" 
                activeDot={{ r: 8 }} 
                name="Humeur" 
                dot={{ stroke: '#10b981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
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
