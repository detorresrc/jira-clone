import React from 'react'
import { ResponseType } from '@/features/projects/api/use-get-project-analyutics';
import { ScrollArea, ScrollBar } from '../ui/scroll-area';
import { AnalyticsCard } from './analytics-card';
import { DottedSeparator } from './dotted-separator';

export const Analytics = ({
  data
} : ResponseType) => {
  if(!data) return null;

  return (
    <ScrollArea className='border rounded-lg w-full whitespace-nowrap shrink-0'>
      <div className='w-full flex flex-row'>
        <div className='flex items-center flex-1'>
          <AnalyticsCard
            title="Total Tasks"
            value={data.taskCount}
            variant={data.taskCount > 0 ? "up" : "down"}
            increaseValue={data.taskDifference}
            />
          <DottedSeparator direction='vertical'/>
        </div>
        
        <div className='flex items-center flex-1'>
          <AnalyticsCard
            title="Assigned Tasks"
            value={data.assignedTaskCount}
            variant={data.assignedTaskCount > 0 ? "up" : "down"}
            increaseValue={data.assignedTaskDifference}
            />
          <DottedSeparator direction='vertical'/>
        </div>
        <div className='flex items-center flex-1'>
          <AnalyticsCard
            title="Completed Tasks"
            value={data.completedTaskCount}
            variant={data.completedTaskCount > 0 ? "up" : "down"}
            increaseValue={data.completedTaskDifference}
            />
          <DottedSeparator direction='vertical'/>
        </div>
        <div className='flex items-center flex-1'>
          <AnalyticsCard
            title="Over Due Tasks"
            value={data.overDueTaskCount}
            variant={data.overDueTaskCount > 0 ? "up" : "down"}
            increaseValue={data.overDueTaskDifference}
            />
          <DottedSeparator direction='vertical'/>
        </div>
        <div className='flex items-center flex-1'>
          <AnalyticsCard
            title="Incomplete Tasks"
            value={data.incompleteTaskCount}
            variant={data.incompleteTaskCount > 0 ? "up" : "down"}
            increaseValue={data.incompleteTaskDifference}
            />
        </div>
      </div> 
      <ScrollBar orientation='horizontal'/>
    </ScrollArea>
  )
}
