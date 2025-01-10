import React, { useState } from "react";
import { Task } from "../types";
import { Button } from "@/components/ui/button";
import { PencilIcon, XIcon } from "lucide-react";
import { DottedSeparator } from "@/components/custom/dotted-separator";
import { useUpdateTask } from "../api/use-update-task";
import { Textarea } from "@/components/ui/textarea";

interface TaskDescriptionProps {
  data: Task;
}

export const TaskDescription = ({ data }: TaskDescriptionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setvalue] = useState(data.description);

  const { mutate, isPending } = useUpdateTask();

  const onSaveHandler = () => {
    mutate(
      {
        json: {
          description: value,
        },
        param: {
          taskId: data.$id,
        },
      },
      {
        onSuccess: () => {
          setIsEditing(false);
        },
      }
    );
  };

  return (
    <div className='p-4 border rounded-lg'>
      <div className='flex items-center justify-between'>
        <p className='text-lg font-semibold'>Overview</p>
        <Button
          size={"sm"}
          variant={"secondary"}
          onClick={() => setIsEditing((prev) => !prev)}
        >
          {!isEditing && (
            <>
              <PencilIcon className='size-4 mr-2' />
              Edit
            </>
          )}
          {isEditing && (
            <>
              <XIcon className='size-4 mr-2' />
              Cancel
            </>
          )}
        </Button>
      </div>
      <DottedSeparator className='my-4' />
      {isEditing && (
        <div className='flex flex-col gap-y-4'>
          <Textarea
            placeholder='Add a description...'
            value={value}
            rows={4}
            onChange={(e) => setvalue(e.target.value)}
            disabled={isPending}
          ></Textarea>
          <Button
            disabled={isPending}
            onClick={onSaveHandler}
            size={"sm"}
            className='w-fit ml-auto'
          >
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      )}
      <div>
        <p>
          {data.description || (
            <span className='text-muted-foreground'>No description set</span>
          )}
        </p>
      </div>
    </div>
  );
};
