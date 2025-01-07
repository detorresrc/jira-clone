import React from 'react'
import { MemberRole } from '../types'
import { Badge } from '@/components/ui/badge'

interface MemberBadgeProps {
  role: MemberRole
}

export const MemberBadge = ({
  role
} : MemberBadgeProps) => {

  if(role == MemberRole.ADMIN)
    return <Badge variant={"default"} className='w-1/2 uppercase flex items-center justify-center text-xs'>{role}</Badge>

  return (
    <Badge variant={"secondary"} className='w-1/2 uppercase flex items-center justify-center text-xs'>{role}</Badge>
  )
}
