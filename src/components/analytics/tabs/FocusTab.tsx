
import React from 'react';
import { FocusSessionsChart } from '../charts/FocusSessionsChart';
import { FocusDurationChart } from '../charts/FocusDurationChart';

interface FocusTabProps {
  dataLoaded: boolean;
}

export const FocusTab: React.FC<FocusTabProps> = ({ dataLoaded }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <FocusSessionsChart dataLoaded={dataLoaded} />
      <FocusDurationChart dataLoaded={dataLoaded} />
    </div>
  );
};
