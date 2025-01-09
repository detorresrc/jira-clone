"use client";
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryState } from "nuqs";
import { Loader2, PlusIcon } from "lucide-react";

import { DottedSeparator } from "@/components/custom/dotted-separator";
import { Button } from "@/components/ui/button";
import { useCreateTaskModal } from "../hooks/use-create-task-modal";
import { useGetTasks } from "../api/use-get-tasks";
import { DataFilters } from "./data-filters";
import { useTaskFilters } from "../hooks/use-task-filters";
import { DataTable } from "./data-table";
import { columns } from "./columns";
import { DataKanban } from "./data-kanban";
import { useBulkUpdateTask } from "../api/use-bulk-update-tasks";
import { TaksUpdatePayload } from "../types";
import { DataCalendar } from "./data-calendar";

interface TaskViewSwitcherProps {
  workspaceId: string;
  hideProjectFilters?: boolean;
}

export const TaskViewSwitcher = ({ 
  workspaceId,
  hideProjectFilters = false
}: TaskViewSwitcherProps) => {
  const [{ status, assignedId, projectId, dueDate }] = useTaskFilters();

  const [view, setView] = useQueryState("task-view", {
    defaultValue: "table",
  });
  const { mutate: bulkUpdate, isPending: isBulkUpdatePending } =
    useBulkUpdateTask();
  const { open } = useCreateTaskModal();
  const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({
    workspaceId,
    status,
    assignedId,
    projectId,
    dueDate,
  });

  const onKanbanDataChangeHandler = (
    taskUpdatePayload: TaksUpdatePayload[]
  ) => {
    bulkUpdate({
      json: {
        tasks: taskUpdatePayload,
      },
    });
  };

  return (
    <Tabs
      defaultValue={view}
      onValueChange={setView}
      className='flex-1 w-full border rounded-lg'
    >
      <div className='h-full flex flex-col overflow-auto p-4'>
        <div className='flex flex-col gap-y2 lg:flex-row justify-between items-center'>
          <TabsList className='w-full lg:w-auto'>
            <TabsTrigger className='h-8 w-full lg:w-auto' value='table'>
              Table
            </TabsTrigger>
            <TabsTrigger className='h-8 w-full lg:w-auto' value='kanban'>
              Kanban
            </TabsTrigger>
            <TabsTrigger className='h-8 w-full lg:w-auto' value='calendar'>
              Calendar
            </TabsTrigger>
          </TabsList>
          <Button size={"sm"} className='w-full lg:w-auto' onClick={open}>
            <PlusIcon className='size-4 mr-2' />
            New Task
          </Button>
        </div>
        <DottedSeparator className='my-4' />
        <DataFilters hideProjectFilters={hideProjectFilters}/>
        <DottedSeparator className='my-4' />
        <div className='relative'>
          {(isBulkUpdatePending || isLoadingTasks) && (
            <div className='w-full h-full absolute top-0 left-0 bg-white bg-opacity-50 z-10 flex items-center justify-center'>
              <Loader2 className='size-5 animate-spin' />
            </div>
          )}

          {isLoadingTasks ? (
            <div className='w-full border rounded-lg h-[200px] flex flex-col items-center justify-center'>
              <Loader2 className='size-5 animate-spin' />
            </div>
          ) : (
            <>
              <TabsContent value='table' className='mt-0'>
                <DataTable columns={columns} data={tasks?.documents ?? []} />
              </TabsContent>
              <TabsContent value='kanban' className='mt-0'>
                <DataKanban
                  data={tasks?.documents ?? []}
                  onChange={onKanbanDataChangeHandler}
                />
              </TabsContent>
              <TabsContent value='calendar' className='mt-0'>
                <DataCalendar data={tasks?.documents ?? []}/>
              </TabsContent>
            </>
          )}
        </div>
      </div>
    </Tabs>
  );
};
