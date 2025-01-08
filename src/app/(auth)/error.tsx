"use client"

import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { FcLeft } from 'react-icons/fc'

const ErrorPage = () => {
  return (
    <div className='h-screen flex flex-col gap-y-4 items-center justify-center'>
      <AlertTriangle className='size-6 text-muted-foreground'/>
      <p className='text-sm'>Something went wrong</p>
      <Button variant={"secondary"} size={"xs"}>
        <FcLeft/>
        <Link href={"/"}>Back to Home</Link>
      </Button>
    </div>
  )
}

export default ErrorPage