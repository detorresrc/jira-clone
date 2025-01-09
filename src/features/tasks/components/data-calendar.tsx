import React, { useState } from 'react'
import {
  format,
  getDay,
  parse,
  startOfWeek,
  addMonths,
  subMonths
} from "date-fns";
import { enUS} from "date-fns/locale";
import {
  Calendar,
  dateFnsLocalizer  
} from "react-big-calendar";

import "react-big-calendar/lib/css/react-big-calendar.css";
import "./data-calendar.css";

import { EventCalendar, Task } from '../types';
import { EventCard } from './event-card';
import { Project } from '@/features/projects/types';
import { Member } from '@/features/members/types';
import { CustomToolbar } from './custom-toolbar';

const locales = {
  "en-US": enUS
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales
});

interface DataCalendarProps {
  data: Task[];
}

export const DataCalendar = ({
  data
} : DataCalendarProps) => {
  const [value, setValue] = useState(
    data.length > 0 ? new Date(data[0].dueDate) : new Date()
  );

  const events: EventCalendar[] = data.map((task) => ({
    start: new Date(task.dueDate),
    end: new Date(task.dueDate),
    title: task.name,
    project: task.project as Project,
    assignee: task.assignee as Member,
    status: task.status,
    id: task.$id
  }));

  const handleNavigate = (action: "PREV" | "NEXT" | "TODAY") => {
    if(action==="PREV")
      setValue(subMonths(value, 1));
    else if(action==="NEXT")
      setValue(addMonths(value, 1));
    else
      setValue(new Date());
  };
  
  return (
    <Calendar
      localizer={localizer}
      date={value}
      events={events}
      views={["month"]}
      defaultView='month'
      toolbar
      showAllEvents
      className='h-full'
      max={new Date(new Date().setFullYear(new Date().getFullYear() + 1))}
      formats={{
        weekdayFormat: (date, culture, localizer) => localizer?.format(date, "EEEE", culture) ?? "",
      }}
      components={{
        eventWrapper: ({ event }) => (
          <EventCard
            data={event}
            />
        ),
        toolbar: () => (
          <CustomToolbar date={value} onNavigate={handleNavigate}/>
        )
      }}
      />
  )
}
