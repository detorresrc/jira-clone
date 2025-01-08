"use client"

import { Button } from '@/components/ui/button'
import { AlertTriangle, RefreshCcw } from 'lucide-react'
import Link from 'next/link'
import { FcLeft } from 'react-icons/fc'

const ErrorPage = () => {

  return (
    <div className='h-screen flex flex-col gap-y-4 items-center justify-center'>
      <AlertTriangle className='size-6 text-muted-foreground'/>
      <p className='text-sm'>Something went wrong</p>

      <div className='w-full flex flex-row items-center justify-center gap-x-4'>
        <Button variant={"secondary"} size={"xs"}>
          <FcLeft/>
          <Link href={"/"}>Back to Home</Link>
        </Button>

        <Button variant={"primary"} size={"xs"} onClick={() => window.location.reload()}>
          <RefreshCcw/>
          Refresh
        </Button>
      </div>
    </div>
  )
}

export default ErrorPage