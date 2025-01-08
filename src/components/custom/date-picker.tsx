import React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '../ui/calendar';

interface DatePickerProps {
  value: Date | undefined;
  onChange: (value: Date) => void;
  className?: string;
  placeholder?: string;
}

const DatePicker = ({
  onChange,
  value,
  className,
  placeholder = "Select Date"
} : DatePickerProps) => {


  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant={"outline"} 
          size={"lg"}
          className={cn(
            "w-full justify-start text-left font-normal px-3",
            !value && "text-muted-foreground",
            className
          )}>
          <CalendarIcon className='mr-2 size-4'/>
          {value ? format(value, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0'>
        <Calendar
          mode='single'
          selected={value}
          onSelect={(date) => {
            onChange(date as Date);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export default DatePicker