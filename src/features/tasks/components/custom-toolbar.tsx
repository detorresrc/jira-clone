import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import React from "react";

interface CustomToolbarProps {
    date: Date,
    onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void
}

export const CustomToolbar = ({
    date,
    onNavigate
} : CustomToolbarProps) => {
  return (
    <div className="flex mb-4 gap-x-2 items-center w-full lg:w-auto justify-center lg:justify-start">
        <Button
            onClick={() => onNavigate("PREV")}
            variant={"secondary"}
            size={"icon"}
            className="flex items-center"
        >
            <ChevronLeftIcon className="size-4"/>
        </Button>
        <div className="flex items-center border border-input rounded-md px-3 py-2 h-8 justify-center w-full lg:w-auto">
            <CalendarIcon className="size-4 mr-2"/>
            <p className="text-sm">{format(date, "MMMM yyyy")}</p>
        </div>
        <Button
            onClick={() => onNavigate("NEXT")}
            variant={"secondary"}
            size={"icon"}
            className="flex items-center"
        >
            <ChevronRightIcon className="size-4"/>
        </Button>
    </div>
  );
};
