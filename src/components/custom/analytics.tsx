import React from "react";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { AnalyticsCard } from "./analytics-card";
import { DottedSeparator } from "./dotted-separator";

interface AnalyticsProps {
  overDueTaskCount: number;
  overDueTaskDifference: number;
  completedTaskCount: number;
  completedTaskDifference: number;
  incompleteTaskCount: number;
  incompleteTaskDifference: number;
  assignedTaskCount: number;
  assignedTaskDifference: number;
  taskCount: number;
  taskDifference: number;
}

export const Analytics = ({
  assignedTaskCount,
  assignedTaskDifference,
  completedTaskCount,
  completedTaskDifference,
  incompleteTaskCount,
  incompleteTaskDifference,
  overDueTaskCount,
  overDueTaskDifference,
  taskCount,
  taskDifference
}: AnalyticsProps) => {

  return (
    <ScrollArea className='border rounded-lg w-full whitespace-nowrap shrink-0'>
      <div className='w-full flex flex-row'>
        <div className='flex items-center flex-1'>
          <AnalyticsCard
            title='Total Tasks'
            value={taskCount}
            variant={taskCount > 0 ? "up" : "down"}
            increaseValue={taskDifference}
          />
          <DottedSeparator direction='vertical' />
        </div>

        <div className='flex items-center flex-1'>
          <AnalyticsCard
            title='Assigned Tasks'
            value={assignedTaskCount}
            variant={assignedTaskCount > 0 ? "up" : "down"}
            increaseValue={assignedTaskDifference}
          />
          <DottedSeparator direction='vertical' />
        </div>
        <div className='flex items-center flex-1'>
          <AnalyticsCard
            title='Completed Tasks'
            value={completedTaskCount}
            variant={completedTaskCount > 0 ? "up" : "down"}
            increaseValue={completedTaskDifference}
          />
          <DottedSeparator direction='vertical' />
        </div>
        <div className='flex items-center flex-1'>
          <AnalyticsCard
            title='Over Due Tasks'
            value={overDueTaskCount}
            variant={overDueTaskCount > 0 ? "up" : "down"}
            increaseValue={overDueTaskDifference}
          />
          <DottedSeparator direction='vertical' />
        </div>
        <div className='flex items-center flex-1'>
          <AnalyticsCard
            title='Incomplete Tasks'
            value={incompleteTaskCount}
            variant={incompleteTaskCount > 0 ? "up" : "down"}
            increaseValue={incompleteTaskDifference}
          />
        </div>
      </div>
      <ScrollBar orientation='horizontal' />
    </ScrollArea>
  );
};
