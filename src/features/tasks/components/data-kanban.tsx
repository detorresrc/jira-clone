"use client";

import { useCallback, useEffect, useState } from "react";
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from "@hello-pangea/dnd";

import { Task, TaskStatus } from "../types";
import { KanbanColumnHeader } from "./kanban-column-header";
import { KanbanCard } from "./kanban-card";
import { toast } from "sonner";

const boards: TaskStatus[] = [
  TaskStatus.BACKLOG,
  TaskStatus.TODO,
  TaskStatus.IN_PROGRESS,
  TaskStatus.IN_REVIEW,
  TaskStatus.DONE,
];

type TaskState = {
  [key in TaskStatus]: Task[];
};

export type TaksUpdatePayload = {
  $id: string;
  status: TaskStatus;
  position: number;
};

interface DataKanbanProps {
  data: Task[];
  onChange: (taskUpdatePayload: TaksUpdatePayload[]) => void;
}

const initState = () => {
  const initialTasks: TaskState = {
    [TaskStatus.BACKLOG]: [],
    [TaskStatus.TODO]: [],
    [TaskStatus.IN_PROGRESS]: [],
    [TaskStatus.IN_REVIEW]: [],
    [TaskStatus.DONE]: [],
  };

  return initialTasks;
}

export const DataKanban = ({ data, onChange }: DataKanbanProps) => {
  const [task, setTask] = useState<TaskState>(initState);

  useEffect(() => {
    const newTasks: TaskState = initState();

    data.forEach((task) => {
      newTasks[task.status].push(task);
    });

    Object.keys(newTasks).forEach((status) => {
      newTasks[status as TaskStatus].sort((a, b) => {
        return a.position - b.position;
      });
    });

    setTask(newTasks);
  }, [data]);

  const updatesPayload: TaksUpdatePayload[] = [];

  const dragEndHandler = useCallback(
    (result: DropResult) => {
      if (!result.destination) return;

      const { source, destination } = result;
      const sourceStatus = source.droppableId as TaskStatus;
      const destinationStatus = destination.droppableId as TaskStatus;

      setTask((prev) => {
        const newTask = { ...prev };

        // Remove task from source
        const sourceColumn = [...newTask[sourceStatus]];
        const [movedTask] = sourceColumn.splice(source.index, 1);

        if (!movedTask) {
          console.error("No task found at the source index");
          toast.error(
            "An error occurred while moving the task, please try again."
          );
          return prev;
        }

        // Create a new task object with potentially updated status
        const updatedMovedTask =
          sourceStatus !== destinationStatus
            ? { ...movedTask, status: destinationStatus }
            : movedTask;

        // Update the source column, sourceColumn is already updated and removed the moved task
        newTask[sourceStatus] = sourceColumn;

        // Add the task to the destination column
        const destColumn = [...newTask[destinationStatus]];
        destColumn.splice(destination.index, 0, updatedMovedTask);

        // Update the destination column
        newTask[destinationStatus] = destColumn;

        updatesPayload.push({
          $id: updatedMovedTask.$id,
          status: destinationStatus,
          position: Math.min((destination.index + 1) * 1000, 1_000_000),
        });

        newTask[destinationStatus].forEach((task, index) => {
          if (task && task.$id !== updatedMovedTask.$id) {
            const newPosition = Math.min((index + 1) * 1000, 1_000_000);

            if (task.position !== newPosition) {
              updatesPayload.push({
                $id: task.$id,
                status: destinationStatus,
                position: newPosition,
              });
            }
          }
        });

        // If the task moved between columns, update the position in the source column
        if (sourceStatus !== destinationStatus) {
          newTask[sourceStatus].forEach((task, index) => {
            if (task) {
              const newPosition = Math.min((index + 1) * 1000, 1_000_000);

              if (task.position !== newPosition) {
                updatesPayload.push({
                  $id: task.$id,
                  status: sourceStatus,
                  position: newPosition,
                });
              }
            }
          });
        }

        return newTask;
      });

      onChange(updatesPayload);
    },
    [onChange]
  );

  return (
    <DragDropContext onDragEnd={dragEndHandler}>
      <div className='flex overflow-auto'>
        {boards.map((board) => {
          return (
            <div
              key={board}
              className='flex-1 mx-2 bg-muted p-1.5 rounded-md min-w-[200px]'
            >
              <KanbanColumnHeader
                board={board}
                taskCount={task[board].length}
              />

              <Droppable droppableId={board}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className='min-h-[200px] py-1.5'
                  >
                    {task[board].map((task, index) => (
                      <Draggable
                        key={task.$id}
                        draggableId={task.$id}
                        index={index}
                      >
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <KanbanCard task={task} />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
};
