import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Pencil } from "lucide-react";
import React from "react";

const Loading = () => {
  return (
    <div className='flex flex-col gap-y-4'>
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-x-2'>
          <Skeleton className='size-8' />
          <Skeleton className='h-8 w-32' />
        </div>
        <div>
          <Button variant={"secondary"} size={"sm"} disabled={true}>
            <Pencil className='size-4 mr-2' />
            Edit Project
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Loading;
