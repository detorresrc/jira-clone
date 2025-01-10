import { AlertTriangle } from 'lucide-react'
import React from 'react'

interface PageErrorProps {
    message: string
}

export const PageError = ({ message } : PageErrorProps) => {
  return (
    <div className='flex flex-col items-center justify-center h-full'>
        <AlertTriangle className='size-6 text-muted-foreground mb-2'/>
        <div className='text-sm font-medium text-muted-foreground'>{message}</div>
    </div>
  )
}
