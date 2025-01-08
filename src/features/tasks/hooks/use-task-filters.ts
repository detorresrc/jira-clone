import { parseAsString, parseAsStringEnum, useQueryStates } from "nuqs"

import { TaskStatus } from "../types";

export const useTaskFilters = () => {
  return useQueryStates({
    projectId: parseAsString,
    status: parseAsStringEnum(Object.values(TaskStatus)),
    assignedId: parseAsString,
    search: parseAsString,
    dueDate: parseAsString
  });
}