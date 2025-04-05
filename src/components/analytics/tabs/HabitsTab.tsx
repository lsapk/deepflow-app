
import React from 'react';
import { HabitsComplianceChart } from '../charts/HabitsComplianceChart';
import { HabitsProgressChart } from '../charts/HabitsProgressChart';

interface HabitsTabProps {
  dataLoaded: boolean;
}

export const HabitsTab: React.FC<HabitsTabProps> = ({ dataLoaded }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <HabitsComplianceChart dataLoaded={dataLoaded} />
      <HabitsProgressChart dataLoaded={dataLoaded} />
    </div>
  );
};
