
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CustomTooltip } from '../ChartTooltips';
import { productivityData } from '../ChartData';

interface ProductivityChartProps {
  dataLoaded: boolean;
}

export const ProductivityChart: React.FC<ProductivityChartProps> = ({ dataLoaded }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Score de Productivité</CardTitle>
        <CardDescription>
          Évolution de votre productivité au fil du temps
        </CardDescription>
      </CardHeader>
      <CardContent>
        {dataLoaded ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={productivityData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="#8884d8" activeDot={{ r: 8 }} name="Score" />
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
