
import React from 'react';
import { TaskCategoriesChart } from '../charts/TaskCategoriesChart';
import { TasksPerDayChart } from '../charts/TasksPerDayChart';

interface TasksTabProps {
  dataLoaded: boolean;
}

export const TasksTab: React.FC<TasksTabProps> = ({ dataLoaded }) => {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <TaskCategoriesChart dataLoaded={dataLoaded} />
      <TasksPerDayChart dataLoaded={dataLoaded} />
    </div>
  );
};
