import { differenceInDays, format } from "date-fns"

import { cn } from "@/lib/utils"

interface TaskDueDateProps {
  value: string;
  className?: string;
}

export const TaskDueDate = ({
  value,
  className
} : TaskDueDateProps) => {
  const todate = new Date();
  const endDate = new Date(value);
  const diffInDays = differenceInDays(endDate, todate);

  let textColor = "text-muted-foreground";
  if(diffInDays <= 3 )
    textColor = "text-red-600";
  else if(diffInDays <= 7)
    textColor = "text-orange-600";
  else if(diffInDays <= 14)
    textColor = "text-yellow-600";

  return (
    <div className={textColor}>
      <span className={cn("truncate", className)}>
        {format(value, "PPP")}
      </span>
    </div>
  )
}
