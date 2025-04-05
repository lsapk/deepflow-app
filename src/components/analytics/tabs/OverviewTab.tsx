
import React from 'react';
import { ProductivityChart } from '../charts/ProductivityChart';
import { TimeUsageChart } from '../charts/TimeUsageChart';
import { WeeklyActivitiesChart } from '../charts/WeeklyActivitiesChart';

interface OverviewTabProps {
  dataLoaded: boolean;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ dataLoaded }) => {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <ProductivityChart dataLoaded={dataLoaded} />
        <TimeUsageChart dataLoaded={dataLoaded} />
      </div>
      <WeeklyActivitiesChart dataLoaded={dataLoaded} />
    </div>
  );
};
