
import React from 'react';
import { MoodChart } from '../charts/MoodChart';

interface JournalTabProps {
  dataLoaded: boolean;
}

export const JournalTab: React.FC<JournalTabProps> = ({ dataLoaded }) => {
  return (
    <MoodChart dataLoaded={dataLoaded} />
  );
};
