"use client"

import { useQueryState, parseAsString } from 'nuqs'

export const useEditTaskModal = () => {
  const [taskId, setTaskId] = useQueryState('edit-task', parseAsString);

  return {
    taskId,
    open: (taskId: string) => setTaskId(taskId),
    close: () => setTaskId(null),
    setTaskId
  }
};